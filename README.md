<div align="center">
	<img src="https://i.imgur.com/TRGtM83.gif">
	<h1 style="font-weight:bold;">sync ⚙️ dotenv</h1>
    <p>Keep your .env in sync with .env.example</p>
    <img alt="Travis (.org)" src="https://img.shields.io/travis/codeshifu/sync-dotenv.svg?logo=travis">
	<img alt="Coveralls github" src="https://img.shields.io/coveralls/github/codeshifu/sync-dotenv.svg?style=popout">
</div>

## Motivation

Projects often rely on environmental variables stored in a `.env` file to run... and because these
variables sometimes contain sensitive data, we never add them to source control.
Instead, these variables are added e.g. to a `.env.example` file so it's easy to
get the project running for other developers. However, it's very easy to forget to update this file
when a variable is added/updated in `.env` (during development). This can make
it difficult for devs to get the project running (locally) because they rely on
`.env.example` file to setup their environment (with their own configs).

Enter `sync-dotenv` 🔥

## Description

`sync-dotenv` automates the process of keeping your
`.env` in sync with `.env.example`.

## Installation

```bash
$ npm install -g sync-dotenv
```

Install as a dev dependency (**recommended**)

```bash
$ npm install -D sync-dotenv
```

## Usage

By default, `sync-dotenv` looks for a `.env` in your working directory and
attempt to sync with `.env.example` when no argument is provided. Failure
to find these files will cause the sync to fail.

```
$ sync-dotenv
```

Alternatively, you can use the `--env` and `--sample` flag to specify the source and destination file.

```
$ sync-dotenv --env foo/.env --sample bar/.env.example
```

Also, in the situation where you want to keep multiple files in sync with one source `env` file you can make use of the `--samples` flag specifying a globbing pattern to match:

```sh
$ sync-dotenv --env foo/.env --samples "env-samples/*"

# note: glob pattern should be provided as a string as shown above
```

For CLI options, use the `--help` flag

```
$ sync-dotenv --help
```

To run `sync-dotenv` whenever the `.env` file changes, you can for example use [`nodemon`](https://www.npmjs.com/package/nodemon):

```
$ nodemon --watch .env --exec 'sync-dotenv --env .env --sample .env.example'
```

## Examples

Sync (with `.env.example`) before every commit using [husky](https://github.com/typicode/husky)

```js
// package.json
{
  "scripts": {
    "env": "sync-dotenv"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run env",
    }
  }
}
```

Or with file other than `.env.example`

```diff
{
  "scripts": {
-    "env": "sync-dotenv"
+    "env": "sync-dotenv --sample .env.development"
  }
}
```

### Preserving variables in sample env

Sometimes you need to preserve certain variables in your example env file, you can optionally allow this by adding a `sync-dotenv` config in `package.json` like so

```js
// package.json
"scripts": {
  ...
},
"sync-dotenv": {
  "preserve": ["CHANNEL"]
}
```

## Related

- [parse-dotenv](https://github.com/codeshifu/parse-dotenv) - zero dependency `.env` to javascript object parser

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://twitter.com/codeshifu"><img src="https://avatars0.githubusercontent.com/u/5154605?v=4" width="100px;" alt="Luqman Olushi O."/><br /><sub><b>Luqman Olushi O.</b></sub></a><br /><a href="https://github.com/codeshifu/sync-dotenv/commits?author=codeshifu" title="Code">💻</a> <a href="https://github.com/codeshifu/sync-dotenv/commits?author=codeshifu" title="Documentation">📖</a> <a href="#maintenance-codeshifu" title="Maintenance">🚧</a> <a href="#platform-codeshifu" title="Packaging/porting to new platform">📦</a> <a href="https://github.com/codeshifu/sync-dotenv/commits?author=codeshifu" title="Tests">⚠️</a></td><td align="center"><a href="https://www.patreon.com/cooproton"><img src="https://avatars0.githubusercontent.com/u/25608335?v=4" width="100px;" alt="Bolaji Olajide"/><br /><sub><b>Bolaji Olajide</b></sub></a><br /><a href="https://github.com/codeshifu/sync-dotenv/commits?author=BolajiOlajide" title="Code">💻</a></td><td align="center"><a href="http://kizi.to"><img src="https://avatars2.githubusercontent.com/u/15332525?v=4" width="100px;" alt="Kizito Akhilome"/><br /><sub><b>Kizito Akhilome</b></sub></a><br /><a href="https://github.com/codeshifu/sync-dotenv/commits?author=akhilome" title="Code">💻</a> <a href="https://github.com/codeshifu/sync-dotenv/commits?author=akhilome" title="Tests">⚠️</a> <a href="https://github.com/codeshifu/sync-dotenv/commits?author=akhilome" title="Documentation">📖</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

This project is licensed under
[MIT](https://github.com/codeshifu/sync-dotenv/blob/master/LICENSE)
