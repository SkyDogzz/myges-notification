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

function compareNotes() {
    //compare les deux fichiers et renvoie un tableau de différences
    var fs = require('fs');
    var file1 = fs.readFileSync('newnotes.html', 'utf8');
    var file2 = fs.readFileSync('notes.html', 'utf8');

    //les fichiers contiennent des balises html, on va donc les parser
    var parse = require('node-html-parser').parse;
    var root1 = parse(file1);
    var root2 = parse(file2);

    //on récupère les tableaux de notes
    var table1 = root1.querySelector('table');
    var table2 = root2.querySelector('table');

    //on récupère les titres des colonnes
    var titles1 = table1.querySelectorAll('th');
    var titles2 = table2.querySelectorAll('th');

    //on récupère les lignes de notes
    var rows1 = table1.querySelectorAll('tr');
    var rows2 = table2.querySelectorAll('tr');

    //on récupère les notes
    var notes1 = [];
    var notes2 = [];

    //on récupère les notes de chaque ligne
    for (var i = 0; i < rows1.length; i++) {
        var row1 = rows1[i];
        var row2 = rows2[i];
        var notesRow1 = row1.querySelectorAll('td');
        var notesRow2 = row2.querySelectorAll('td');
        var notesRow = [];
        for (var j = 0; j < notesRow1.length; j++) {
            var note1 = notesRow1[j];
            var note2 = notesRow2[j];
            notesRow.push([note1, note2]);
        }
        notes1.push(notesRow);
    }

    //on compare les notes et on renvoie un tableau de différences contenant les notes, les titres des colonnes et les lignes
    var differences = [];
    for (var i = 0; i < notes1.length; i++) {
        var notesRow = notes1[i];
        for (var j = 0; j < notesRow.length; j++) {
            var note = notesRow[j];
            if (note[0].innerHTML !== note[1].innerHTML) {
                differences.push([note[0], titles1[j].querySelector('span'), rows1[i].querySelector('span')]);
            }
        }
    }

    //on renvoie un message contenant les différences
    var message = "";
    for (var i = 0; i < differences.length; i++) {
        var difference = differences[i];
        var note = difference[0];
        var title = difference[1];
        var row = difference[2];
        message += "Nouvelle note: " + note.innerHTML + " pour " + title.innerHTML + " dans " + row.innerHTML + " est disponible !";
    }

    return message;
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

    await page.setViewport({ width: 1920, height: 1080 });

    const element = await page.$("#marksForm\\:marksWidget\\:coursesTable");

    await page.evaluate(() => {
        document.querySelector("#marksForm\\:marksWidget\\:coursesTable").scrollIntoView();
    });
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
        console.log("New notes available !");
        const messages = await compareNotes();
        let bodyPlus = "";
        for (let i = 0; i < messages.length; i++) {
            bodyPlus += messages[i];
        }
        message.body += bodyPlus;

        client.messages
            .create({
                body: message.body,
                from: message.from,
                to: message.to
            })
            .then(message => console.log(message.sid))
        //.done();
        await page.screenshot({ path: 'newNotes.png' });
    } else {
        await page.screenshot({ path: 'oldNotes.png' });
    }

    fs.renameSync('newnotes.html', 'notes.html');

    await browser.close();
})();