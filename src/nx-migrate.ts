import {exec} from '@actions/exec'
import fs from 'fs'

export async function migrate(
  keepMigrationsFile: boolean,
  legacyPeerDeps: boolean
): Promise<void> {
  await exec('npx nx migrate latest', [], {
    env: {
      ...process.env,
      npm_config_yes: 'true'
    }
  })
  await exec('npm i', [], {
    env: {
      ...process.env,
      npm_config_legacy_peer_deps: String(legacyPeerDeps)
    }
  })
  await exec(
    'npx nx migrate --run-migrations=migrations.json --create-commits',
    [],
    {
      env: {
        ...process.env,
        npm_config_yes: 'true',
        npm_config_legacy_peer_deps: String(legacyPeerDeps)
      }
    }
  )

  if (!keepMigrationsFile) {
    fs.unlinkSync('./migrations.json')
  }
  await exec('bash', [
    '-c',
    'git diff --quiet --cached || git diff --quiet || (git add . && git commit -m "chore: [nx migration] changes")'
  ])
}
