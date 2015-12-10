# babel-plugin-angular-annotate

>  Make angular dependency annotation minification proof

[![Build Status][travis_badge]][travis]

:warning: This is still under development :warning:

## Installation

```sh
npm install babel-plugin-angular-annotate
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["angular-annotate"]
}
```

### Via CLI

```sh
$ babel --plugins angular-annotate script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["angular-annotate"]
});
```

## Running Tests

`npm test`

## Contributing

1. Fork it
1. Create your feature branch (`git checkout -b my-new-feature`)
1. Commit your changes (`git commit -am 'Add some feature'`)
1. Push to the branch (`git push origin my-new-feature`)
1. Create new Pull Request

[travis]: https://travis-ci.org/marcioj/babel-plugin-angular-annotate
[travis_badge]: https://api.travis-ci.org/marcioj/babel-plugin-angular-annotate.svg?branch=master
