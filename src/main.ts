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

    const octokit = github.getOctokit(repoToken)

    core.debug(`Attempt to get local and remote nx versions.`)
    const packageJson = fs.readFileSync("./package.json", 'utf8')
    const packageObject = JSON.parse(packageJson)

    if (!('nx' in packageObject.devDependencies)) {
      core.setFailed(
        'NX package can not be detected as dev dependency. Make sure you provided the correct package.json file and NX is installed.'
      )
      return
    }

    const currentNxVersion = packageObject.devDependencies[
      'nx'
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
      `New NX version detected (${latestNxVersion}). Attempting to migrate...`
    )

    const repoName = `migrate-nx-to-${latestNxVersion}`
    core.debug(`Switching to branch ${repoName}`)
    await exec(`git checkout -b ${repoName}`)

    core.debug(`Migrating to latest NX version`)
    await exec('npm_config_yes=true npx nx migrate latest')
    await exec('npm i')
    await exec('nx migrate --run-migrations=migrations.json')

    await exec('git add .')
    await exec(
      `git commit -m ${commitMessage.replace('$VERSION', latestNxVersion)}`
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
