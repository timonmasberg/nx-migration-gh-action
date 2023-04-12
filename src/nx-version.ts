import fs from 'fs'
import latestVersion from 'latest-version'

export function getCurrentNxVersion(): string {
  const packageJson = fs.readFileSync('./package.json', 'utf8')
  const packageObject = JSON.parse(packageJson)

  if (!('nx' in packageObject.devDependencies)) {
    throw new Error(
      'NX package can not be detected as dev dependency. Make sure you provided the correct package.json file and NX is installed.'
    )
  }

  return packageObject.devDependencies['nx'].replace(/[\^~]/, '')
}

export async function getLatestNxVersion(): Promise<string> {
  return await latestVersion('nx')
}
