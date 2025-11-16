#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const sharedRulesPath = path.join(repoRoot, 'shared', 'rules.json')

const readJson = async () => {
  const json = await fs.readFile(sharedRulesPath, 'utf8')
  return JSON.parse(json)
}

const formatTsObject = (rule) => `  {\n    name: '${rule.name}',\n    category: '${rule.category}',\n    icon: '${rule.icon}',\n    description: '${rule.description.replace(/'/g, "\\'")}',\n  }`

const generateTs = async (rules) => {
  const targetPath = path.join(repoRoot, 'frontend', 'src', 'core', 'rules', 'ruleArtifacts.gen.ts')
  const objects = rules.map(formatTsObject).join(',\n')
  const names = rules.map((rule) => `  '${rule.name}',`).join('\n')
  const contents = `// AUTO-GENERATED FILE. DO NOT EDIT.\n// Run \`npm run generate:rules\` from the frontend workspace to regenerate.\n\nimport type { RuleCategory } from './types'\n\nexport interface SharedRuleMetadata {\n  name: string\n  category: RuleCategory\n  icon: string\n  description: string\n}\n\nexport const sharedRuleMetadata = Object.freeze([\n${objects}\n] as const satisfies readonly SharedRuleMetadata[])\n\nexport const ruleList = Object.freeze([\n${names}\n] as const)\n\nexport type RuleName = (typeof ruleList)[number]\n`
  await fs.writeFile(targetPath, contents)
}

const main = async () => {
  const rules = await readJson()
  await generateTs(rules)
}

await main()
