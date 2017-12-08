# Boozang Chromium Test runner 

## Usage

```USAGE: boozang [--token] [--headfull] [--verbose] [--screenshot] [--file=report] [--device=default] url```

## Disclaimer

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

```boozang --headfull [testurl-including-auth-token```

Run with Boozang authentification token

```boozang --token=auth-token [testurl-excluding-auth-token]```

## Options

```USAGE: boozang [--token] [--headfull] [--verbose] [--screenshot] [--file=report] [--device=default] url```

- headfull: Runs Boozang in full mode (non-headless). Will be triggered authomatically for URL with extension dependencies

- verbose: Turn on verbose logging

- screenshot: Generates a screenshot instead of runs a test. Used to generate tool screenshots for Boozang documentation. 

- file: Overrides default report name "result".

- device: Emulate device. Find devices here: https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js