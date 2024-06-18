import {exec} from '@actions/exec'
import fs from 'fs'
import {getInputs} from './inputs-helper'

export async function migrate(keepMigrationsFile: boolean): Promise<void> {
  const inputs = getInputs()

  await exec('npx nx migrate latest', [], {
    env: {
      ...process.env,
      npm_config_yes: String(true)
    }
  })
  await exec(inputs.installCommand)
  await exec(
    'npx nx migrate --run-migrations=migrations.json  --if-exists --create-commits',
    [],
    {
      env: {
        ...process.env,
        npm_config_yes: String(true),
        NX_MIGRATE_SKIP_INSTALL: String(true)
      }
    }
  )
  await exec(inputs.installCommand)

  if (!keepMigrationsFile) {
    fs.unlinkSync('./migrations.json')
  }

  await exec('bash', [
    '-c',
    '(git add . && git commit -am "chore: [nx migration] changes") || true'
  ])
}
