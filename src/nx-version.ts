import fs from 'fs'
import * as core from '@actions/core'
import latestVersion from 'latest-version'

export function getCurrentNxVersion() {
  const packageJson = fs.readFileSync('./package.json', 'utf8')
  const packageObject = JSON.parse(packageJson)

  if (!('nx' in packageObject.devDependencies)) {
    core.setFailed(
      'NX package can not be detected as dev dependency. Make sure you provided the correct package.json file and NX is installed.'
    )
    return
  }

  return packageObject.devDependencies[
    'nx'
    ].replace(/[\^~]/, '')
}

export function getLatestNxVersion() {
  return latestVersion('nx')
}
