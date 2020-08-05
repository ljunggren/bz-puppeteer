# Boozang Puppeteer Test runner 

## Usage

```USAGE: boozang [--token] [--headfull] [--verbose] [--screenshot] [--file=report] [--device=default] url```

## Introduction

This is a helper package for Boozang test platform and allows for test execution from the command line. The test runner is designed to run Boozang tests (http://boozang.com) both in headless and non-headless mode, and is based on the amazing npm package Puppeteer (https://github.com/GoogleChrome/puppeteer) by Chrome developers. Just like Puppeteer it can be configured to use both headless Chrome and "full" Chrome. 


## Requirements
Installing Node v8.9.0+ is recommended. 

## Installation
To install the command-line package run

```npm install -g boozang```

To run

```boozang http://ai.boozang.com/extension/abc...```


To clone the repository run

```git clone https://github.com/ljunggren/bz-puppeteer```

To run the application from source simply run

```node index.js http://ai.boozang.com/extension/abc...```


## Commands

Headless run 

```boozang [testurl-including-auth-token]```

"Full" mode

```boozang --headfull [testurl-including-auth-token]```

Run with Boozang authentification token

```boozang --token=auth-token [testurl-excluding-auth-token]```

## Options

```USAGE: boozang [--token] [--headfull] [--verbose] [--screenshot] [--file=report] [--device=default] url```

- token: The Boozang authorization token. The recommended way of generating a token is to create a team member with CI credentials on your project. In the management UI (ai.boozang.com) login as CI member and generate a token under Account->Get Token. You can now simply control CI access and consolidate all email notifications under the CI team member email address. 

- headfull: Runs Boozang in full mode (non-headless). Will be triggered authomatically for URL with extension dependencies

- verbose: Turn on verbose logging

- screenshot: Generates a screenshot instead of runs a test. Used to generate tool screenshots for Boozang documentation. 

- file: Overrides default report name "result".

- device: Emulate device. Find devices here: https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts


## Built With

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) - Headless Chrome Node API from Google Chrome

## Authors


* **Mats Ljunggren** - *Initial work* - [ljunggren](https://github.com/ljunggren)

* **Wensheng Li** - *Initial work* - [lwshome](https://github.com/lwshome)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

