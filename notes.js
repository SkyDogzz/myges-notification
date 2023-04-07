const puppeteer = require("puppeteer");
const dotenv = require('dotenv').config();
const twilio = require('twilio')(process.env.accountSid, process.env.authToken);
const myges = { username: process.env.username, password: process.env.password };
const message = { body: process.env.body, from: process.env.from, to: process.env.to };
const fs = require('fs');
const parse = require('node-html-parser').parse;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function compareNotes() {
    const file1 = fs.readFileSync('notes.html', 'utf8');
    const file2 = fs.readFileSync('newnotes.html', 'utf8');

    const root1 = parse(file1);
    const root2 = parse(file2);

    const table1 = root1.querySelector('table');
    const table2 = root2.querySelector('table');

    const titles1 = table1.querySelectorAll('th');

    const rows1 = table1.querySelectorAll('tr');
    const rows2 = table2.querySelectorAll('tr');

    const notes1 = [];

    for (let i = 0; i < rows1.length; i++) {
        const row1 = rows1[i];
        const row2 = rows2[i];
        const notesRow1 = row1.querySelectorAll('td');
        const notesRow2 = row2.querySelectorAll('td');
        const notesRow = [];
        for (let j = 0; j < notesRow1.length; j++) {
            const note1 = notesRow1[j];
            const note2 = notesRow2[j];
            notesRow.push([note1, note2]);
        }
        notes1.push(notesRow);
    }

    const differences = [];
    for (let i = 0; i < notes1.length; i++) {
        const notesRow = notes1[i];
        for (let j = 0; j < notesRow.length; j++) {
            const note = notesRow[j];
            if (note[0].innerHTML !== note[1].innerHTML) {
                differences.push([note[0], titles1[j].querySelector('span'), rows1[i].querySelector('span')]);
            }
        }
    }

    let messageBody = "";
    for (let i = 0; i < differences.length; i++) {
        const difference = differences[i];
        const note = difference[0];
        const title = difference[1];
        const row = difference[2];
        messageBody += "Nouvelle note: " + note.innerHTML + " pour " + title.innerHTML + " dans " + row.innerHTML + " est disponible !";
    }

    return messageBody;
}

(async () => {
    console.log("Démarrage de Puppeteer...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log("Navigation vers https://myges.fr/login...");
    await page.goto("https://myges.fr/login");

    console.log("Saisie du nom d'utilisateur et du mot de passe...");
    await page.type("#username", myges.username);
    await page.type("#password", myges.password);

    console.log("Clic sur le bouton de connexion...");
    await Promise.all([
        page.click(".input_submit"),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    console.log("Attente de 5 secondes avant de continuer...");
    await sleep(5000);

    console.log("Navigation vers la page des notes...");
    await page.goto("https://myges.fr/student/marks");

    console.log("Clic sur le sélecteur de période...");
    await page.click("#marksForm\\:j_idt172\\:periodSelect");

    console.log("Attente de 5 secondes avant de continuer...");
    await sleep(5000);

    console.log("Sélection du semestre en cours...");
    await page.click(process.env.semesterSelector);

    console.log("Attente de 5 secondes avant de continuer...");
    await sleep(5000);

    console.log("Redimensionnement de la fenêtre du navigateur...");
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("Défilement jusqu'à la table des notes...");
    await page.evaluate(() => {
        document.querySelector("#marksForm\\:marksWidget\\:coursesTable").scrollIntoView();
    });

    const element = await page.$("#marksForm\\:marksWidget\\:coursesTable");

    console.log("Vérification de l'existence du fichier 'notes.html'...");
    if (!fs.existsSync('notes.html')) {
        console.log("Le fichier 'notes.html' n'existe pas encore, création du fichier...");
        fs.writeFileSync('notes.html', await page.evaluate(element => element.innerHTML, element));
        console.log("Le fichier 'notes.html' a été créé !");
        await browser.close();
        return;
    }

    console.log("Le fichier 'notes.html' existe déjà, création du fichier 'newnotes.html'...");
    fs.writeFileSync('newnotes.html', await page.evaluate(element => element.innerHTML, element));

    console.log("Comparaison des notes...");
    const file1 = fs.readFileSync('notes.html', 'utf8');
    const file2 = fs.readFileSync('newnotes.html', 'utf8');

    if (file1 !== file2) {
        console.log("Des nouvelles notes sont disponibles !");
        const messageBody = await compareNotes();
        message.body += messageBody;

        console.log("Envoi du message Twilio...");
        twilio.messages
            .create({
                body: message.body,
                from: message.from,
                to: message.to
            })
            .then(message => console.log("Message Twilio envoyé avec succès !"))
            .catch(error => console.error("Erreur lors de l'envoi du message Twilio : ", error));
        await page.screenshot({ path: 'newNotes.png' });
    } else {
        console.log("Il n'y a pas de nouvelles notes.");
        await page.screenshot({ path: 'oldNotes.png' });
    }

    console.log("Renommage du fichier 'newnotes.html' en 'notes.html'...");
    fs.renameSync('newnotes.html', 'notes.html');

    console.log("Fermeture de Puppeteer...");
    await browser.close();
})();