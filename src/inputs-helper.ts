import * as core from '@actions/core'
import Inputs from './inputs.model'


export function getInputs(): Inputs {
  const repoToken = core.getInput('repoToken', {required: true})
  const commitMessage = core.getInput('commitMessage', {required: false})
  const includeMigrationsFile = core.getInput('includeMigrationsFile', {required: false})
  const prTitle = core.getInput('prTitle', {required: false})

  return {
    repoToken,
    commitMessage,
    includeMigrationsFile: Boolean(includeMigrationsFile),
    prTitle,
  }
}
