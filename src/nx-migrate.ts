import {exec} from '@actions/exec'

export async function migrate() {
  await exec('npx nx migrate latest', [], {
    env: {
      ...process.env,
      'npm_config_yes': 'true'
    }
  })
  await exec('npm i')
  await exec('npx nx migrate --run-migrations=migrations.json', [], {
    env: {
      ...process.env,
      'npm_config_yes': 'true'
    }
  })
}
