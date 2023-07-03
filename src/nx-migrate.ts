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
  // sometimes migrations change packages without installing them, so naivly install dependencies here again
  await exec('npm i --package-lock-only', [], {
    env: {
      ...process.env,
      npm_config_legacy_peer_deps: String(legacyPeerDeps)
    }
  })

  if (!keepMigrationsFile) {
    fs.unlinkSync('./migrations.json')
  }

  await exec('bash', [
    '-c',
    '(git add . && git commit -am "chore: [nx migration] changes") || true'
  ])
}
