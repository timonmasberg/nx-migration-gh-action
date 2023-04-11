import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import {exec} from '@actions/exec'
import latestVersion from 'latest-version'

async function run(): Promise<void> {
  try {
    const repoToken = core.getInput('repoToken', {required: true})
    const prTitle = core.getInput('prTitle', {required: false})
    const commitMessage = core.getInput('commitMessage', {required: false})
    const packageJsonPath = core.getInput('packageJsonPath', {required: false})

    const octokit = github.getOctokit(repoToken)

    core.debug(`Checking out repo`)
    await exec('git checkout main')

    core.debug(`Attempt to get local and remote nx versions.`)
    const packageJson = fs.readFileSync(packageJsonPath, 'utf8')
    core.debug(packageJson)
    const packageObject = JSON.parse(packageJson)
    core.debug(packageObject.devDependencies)
    core.debug("nx" in packageObject.devDependencies)
    if (!('nx' in packageObject.devDependencies)) {
      core.setFailed(
        'NX package can not be detected as dev dependency. Make sure you provided the correct package.json file and NX is installed.'
      )
      return
    }

    const currentNxVersion = packageObject.dependencies[
      'dependency-name'
    ].replace(/[\^~]/, '')
    core.debug(`Got version ${currentNxVersion} as current nx version`)
    const latestNxVersion = await latestVersion('nx')
    core.debug(`Got version ${latestNxVersion} as latest nx version`)

    const hasNewNxVersion = currentNxVersion !== latestNxVersion

    if (!hasNewNxVersion) {
      core.info('No new NX version detected. Nothing to do 💤.')
      return
    }

    core.info(
      `New NX version detected (${latestNxVersion}. Attempting to migrate...`
    )

    const repoName = `migrate-nx-to-${latestNxVersion}`
    core.debug(`Switching to branch ${repoName}`)
    await exec(`git checkout -b ${repoName}`)

    core.debug(`Migrating to latest NX version`)
    await exec('npx nx migrate latest')
    await exec('npm i')
    await exec('nx migrate --run-migrations=migrations.json')

    await exec('git add .')
    await exec(
      `git  commit -m ${commitMessage.replace('$VERSION', latestNxVersion)}`
    )
    await exec('git push')

    const {data: newPr} = await octokit.rest.pulls.create({
      owner: github.context.repo.owner,
      repo: repoName,
      title: prTitle.replace('$VERSION', latestNxVersion),
      body: 'prBody',
      head: repoName,
      base: 'main'
    })

    core.setOutput('prId', newPr.id)
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()
