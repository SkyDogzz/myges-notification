const puppeteer = require("puppeteer");

require('dotenv').config();

const twilio = {
    accountSid: process.env.accountSid,
    authToken: process.env.authToken
}

const myges = {
    username: process.env.username,
    password: process.env.password
}

const message = {
    body: process.env.body,
    from: process.env.from,
    to: process.env.to
}

const client = require('twilio')(twilio.accountSid, twilio.authToken);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log("Navigating to https://myges.fr/login")
    await page.goto("https://myges.fr/login");

    console.log("Typing username and password")
    await page.type("#username", myges.username);
    await page.type("#password", myges.password);

    console.log("Clicking on submit button")
    await page.click(".input_submit");

    console.log("Waiting 5 sec before continuing")
    await sleep(5000);

    await page.goto("https://myges.fr/student/marks");

    await page.click("#marksForm\\:j_idt172\\:periodSelect");

    console.log("Waiting 5 sec before continuing")
    await sleep(5000);

    await page.click(process.env.semesterSelector);

    console.log("Waiting 5 sec before continuing")
    await sleep(5000);

    const element = await page.$("#marksForm\\:marksWidget\\:coursesTable");

    const fs = require('fs');
    if (!fs.existsSync('notes.html')) {
        fs.writeFileSync('notes.html', await page.evaluate(element => element.innerHTML, element));
        console.log("notes.html created");
        await browser.close();
        return;
    }

    fs.writeFileSync('newnotes.html', await page.evaluate(element => element.innerHTML, element));

    const file1 = fs.readFileSync('notes.html', 'utf8');
    const file2 = fs.readFileSync('newnotes.html', 'utf8');

    if (file1 !== file2) {
        client.messages
            .create({
                body: message.body,
                from: message.from,
                to: message.to
            })
            .then(message => console.log(message.sid))
        //.done();
    }

    fs.renameSync('newnotes.html', 'notes.html');

    await browser.close();
})();