import {exec} from '@actions/exec'
import fs from 'fs'

export async function migrate(keepMigrationsFile: boolean): Promise<void> {
  await exec('npx nx migrate latest', [], {
    env: {
      ...process.env,
      npm_config_yes: 'true'
    }
  })
  await exec('npm i')
  await exec('npx nx migrate --run-migrations=migrations.json', [], {
    env: {
      ...process.env,
      npm_config_yes: 'true'
    }
  })

  if (!keepMigrationsFile) {
    fs.unlinkSync('./migrations.json')
  }
}
