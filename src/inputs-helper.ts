import * as core from '@actions/core'
import Inputs from './inputs.model'

export function getInputs(): Inputs {
  const repoToken = core.getInput('repoToken', {required: true})
  const includeMigrationsFile = core.getInput('includeMigrationsFile', {
    required: false
  })
  const legacyPeerDeps = core.getInput('legacyPeerDeps', {
    required: false
  })
  const prTitle = core.getInput('prTitle', {required: false})

  const base = core.getInput('base', {required: false})

  return {
    repoToken,
    includeMigrationsFile: Boolean(includeMigrationsFile),
    legacyPeerDeps: Boolean(legacyPeerDeps),
    prTitle,
    base
  }
}
