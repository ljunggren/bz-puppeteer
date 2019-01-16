#! /usr/bin/env node

const puppeteer = require('puppeteer')
const fs = require('fs')
const options = require('node-options');

var opts = {
    device: "default",
    timeout: null,
    file: "boozang-" + new Date().toISOString().split('.')[0],
    token: null,
    screenshot: false
};

var result = options.parse(process.argv.slice(2), opts);

if (result.errors) {
    if (opts.verbose) console.log('Unknown argument(s): "' + result.errors.join('", "') + '"');
    process.exit(2);
}

if (result.errors || !result.args || result.args.length !== 1) {
    console.log('USAGE: [--device=default] [--timeout=0] [--file=<boozang-Y-m-d>] [--token=<token_id>] [--screenshot] url');
    process.exit(2);
}

let url = result.args[0]

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const isURL = (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[.-a-z\\d_/]*)/run$', 'i') // mandatory fragment locator (. and / are allowed even if they are normally invalid)
    return pattern.test(str)
}

if (typeof (url) == 'string' && !url.endsWith("/run")) {
    if (!url.endsWith("/")) {
        url += "/"
    }
    url += "run"
}

if (!url || !isURL(url)) {
    console.error("Invalid URL: " + url)
    process.exit(2)
}

if (opts.timeout) {
    setTimeout(() => {
        console.log(`Timeout! (${Number(opts.timeout)}s)`)
        process.exit(2)
    }, Number(opts.timeout) * 1000)
}

const RED = '\033[0;31m'
const GREEN = '\033[0;32m'
const BLANK = '\033[0m'

const parseReport = (json) => {
    report = ''
    report += json.details.map(detail =>
        (detail.test ?
            `\n\t${detail.result == 4 ? GREEN + "✓" : RED + "✘"} ` +
            `[${detail.module.code}] ${detail.module.name} - [${detail.test.code}] ${detail.test.name} ` +
            `(${detail.test.actions} actions, ${detail.time}ms)` + BLANK
            :
            `\n\t\t${detail.result == 4 ? GREEN + "✓" : RED + "✘"} ` +
            `${detail.description} (${detail.time}ms)` + BLANK
        )).join('')
    report += `\n\n\tStatus: ${json.result.type == 1 ? GREEN + "success" + BLANK : RED + "failure" + BLANK}`
    report += `    Passing tests: ${json.result.summary.test - json.result.summary.failedTest}/${json.result.summary.test}`
    report += `    Passing actions: ${json.result.summary.action - json.result.summary.failedAction}/${json.result.summary.action}\n`

    return report
}

(async () => {
    if (url) {
        let success = false

        // Launch the browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--disable-infobars', '--no-sandbox', '--disable-setuid-sandbox']
        })

        // Prepare the device
        const page = await browser.newPage()
        const devices = require('puppeteer/DeviceDescriptors')

        await page._client.send('Emulation.clearDeviceMetricsOverride')
        if (opts.device === "default") {
            console.log('Default device.')
        } else if (!devices[opts.device]) {
            console.log('Device ' + opts.device + ' not found, ignoring.')
        } else {
            console.log(`${opts.device} found.Viewport is set to ${devices[opts.device].viewport.width} x ${devices[opts.device].viewport.height}`)
            await page.emulate(devices[opts.device])
        }

        console.log(`Opening URL: ${url}`)

        // Insert token, if option set
        if (opts.token && url.indexOf('token') == "-1") {
            const position = url.indexOf('#')
            url = [url.slice(0, position), (url.indexOf('?') == -1) ? '?' : '&', "token=" + opts.token, url.slice(position)].join('')
        }

        await page.goto(url)

        // Screenshot, if option enabled
        if (opts.screenshot) {
            console.log("Waiting two seconds for screenshot.")
            await sleep(2000)
            await page.screenshot({ path: `/var/boozang/${opts.file}.png` })
            console.log(`Screenshot "${opts.file}.png" saved.`)
        }

        // Messages processing
        page.on('console', async msg => {
            let logString = msg.text()

            // Report step
            if (logString.includes("<html>")) {
                fs.writeFile(`/var/boozang/${opts.file}.html`, logString, (err) => {
                    if (err) {
                        console.error("Error: ", err)
                        process.exit(2)
                    }
                    console.log(`Report "${opts.file}.html" saved.`)
                })

                // To be added if we want to display HTML on-screen
                // console.log(pretty(logString))

                if (logString.includes("Failed !")) {
                    success = false
                } else if (logString.includes("Success !")) {
                    success = true
                }
                // Tests end
            } else if (logString.includes('"result": {')) {
                fs.writeFile(`${opts.file}.json`, logString, (err) => {
                    if (err) {
                        console.error("Error: ", err)
                        process.exit(2)
                    }
                    console.log(`Report "${opts.file}.json" saved.`)
                })
                const json = JSON.parse(logString)
                success = (json.result.type == 1)

                console.log(parseReport(json))
            } else if (logString.includes("All tests completed!")) {
                if (success) {
                    console.log(GREEN + "Tests success" + BLANK)
                } else {
                    console.error(RED + "Tests failure" + BLANK)
                }
                process.exit(Number(!success))
            } else {
                console.log(logString)
            }
        })
    }
})().catch((e) => {
    console.error(e);
    process.exit(2)
})