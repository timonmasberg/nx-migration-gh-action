#  NX Migration Action

This Action checks for new versions of [NX](https://github.com/nrwl/nx/) based on your version of `nx`found in the `package.json`.
If a new version exists, it automatically runs `nx migrate latest`, installs all dependencies, applies all migrations and finally opens a pull request.

## Usage

The easiest way is to check for new versions with a scheduled workflow. 
Make sure to checkout the branch you want apply the migrations in case there is a new version of NX.

For a detailed description of all parameters check the [action.yml](action.yml).

```yaml
name: Check for new NX version

on:
  schedule:
    - cron: "0 0 * * *" # every day at midnight

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    - uses: timonmasberg/nx-migration-gh-action@v1.0.0
      with:
        repoToken: ${{ secrets.GITHUB_TOKEN }}
        # Optional:
        commitMessage: 'deps: migrate nx to $VERSION'
        prTitle: 'Migrates NX to $VERSION'
        includeMigrationsFile: false # `migrations.json` will not be included in this PR.
        base: 'dev'
```

You can also use this action in other workflow events.

## Contribute

As I have done this mostly just to fit our needs over at [Kordis](https://github.com/kordis-leitstelle/kordis) and [Cartesius.io](https://cartesius.io), this might lack some features or does not cover some edge cases.
Also tests are currently rare ;)  
I highly appreciate any contribution. 

Make sure to run `npm all` before pushing and to check-in the `dist` folder if you make changes in `src`.
