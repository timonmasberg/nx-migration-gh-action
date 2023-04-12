import * as core from '@actions/core'
import * as github from '@actions/github'
import {getInputs} from './inputs-helper'
import {getCurrentNxVersion, getLatestNxVersion} from './nx-version'
import {makePRBody, pushChangesToRemote} from './git'
import {migrate} from './nx-migrate'


async function run(): Promise<void> {
  try {
    const inputs = getInputs()
    const octokit = github.getOctokit(inputs.repoToken)

    const currentNxVersion = getCurrentNxVersion()
    core.debug(`Got version ${currentNxVersion} as current nx version`)
    const latestNxVersion = await getLatestNxVersion()
    core.debug(`Got version ${latestNxVersion} as latest nx version`)

    const hasNewNxVersion = currentNxVersion !== latestNxVersion

    if (!hasNewNxVersion) {
      core.info('No new NX version detected. Nothing to do 💤.')
      return
    }

    core.info(`New NX version detected (${latestNxVersion}). Attempting to migrate...`)

    const prTitle = inputs.prTitle.replace('$VERSION', latestNxVersion);

    core.debug('Checking if a PR for this version already exists...')
    const response = await octokit.rest.search.issuesAndPullRequests({
      q: `repo:${github.context.repo.owner}/${github.context.repo.repo} ${prTitle} in:title is:pr`,
      sort: 'created',
      per_page: 1,
    });
    if (response.data.total_count > 0) {
      core.info(`A PR for this version already exists: ${response.data.items[0].html_url}`);
      return
    }

    core.debug('Fetching latest release for NX for safety\'s sake...')
    const {data: latestNxGHRelease} = await octokit.rest.repos.getLatestRelease({
      owner: 'nrwl',
      repo: 'nx'
    })

    core.debug('Starting migrations...')
    await migrate(inputs.includeMigrationsFile)

    core.debug('Pushing changes...')
    const repoName = `migrate-nx-to-${latestNxVersion}`
    const commitMessage = inputs.commitMessage.replace('$VERSION', latestNxVersion)
    const origin = `https://x-access-token:${inputs.repoToken}@github.com/${github.context.repo.owner}/${github.context.repo.repo}`
    await pushChangesToRemote(commitMessage, repoName, origin)
    core.info(`Pushed changes to origin/${repoName}`)

    core.debug('Creating Pull Request...')

    const {data: newPr} = await octokit.rest.pulls.create({
      ...github.context.repo,
      title: inputs.prTitle.replace('$VERSION', latestNxVersion),
      body: makePRBody(latestNxGHRelease.body || 'No release notes', latestNxGHRelease.created_at, latestNxGHRelease.html_url),
      head: repoName,
      base: 'main'
    })

    core.info(`Pull Request created: ${newPr.issue_url}`)

    core.setOutput('prId', newPr.number)
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()
