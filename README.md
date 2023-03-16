# Notes.js

Ce programme en Node.js simule une navigation sur un site web. Il a pour but de comparer l'ancien code HTML avec le nouveau code HTML et d'envoyer un SMS au numéro spécifié dans le fichier .env si les deux codes HTML sont différents.
## Installation
1. Clonez le repository GitHub.
2. Installez les dépendances avec npm install.
3. Créez un fichier .env avec les informations nécessaires (voir ci-dessous).
4. Lancez le programme avec node notes.js.

## Configuration

Le fichier .env doit contenir les informations suivantes :
```bash
#twilio
accountSid= #sid twilio
authToken= #token twilio

#myges
username= #username myges
password= #password myges
semesterSelector="[data-label='2022-2023 - ESGI - 3ESGI  - Semestre 1']"

#message
body= #message
from= #from twilio number
to= #to twilio number
```

## Utilisation

Si le programme est lancé pour la première fois et que le fichier notes.html n'existe pas, le programme le créera et mettra fin à l'exécution. Sinon, le programme récupèrera le code HTML du site web et le comparera avec l'ancien code HTML stocké dans le fichier notes.html. Si les deux codes sont différents, le programme enverra un SMS au numéro spécifié dans le fichier .env.

## Mise en place

Pour exécuter le script notes.js toutes les 10 minutes, vous pouvez utiliser la fonctionnalité de tâches planifiées de votre système d'exploitation. Sur Linux, cela peut être fait à l'aide d'un Cronjob.

Voici les étapes pour créer un Cronjob qui exécutera le script toutes les 10 minutes sur les principaux systèmes Linux :

1. Ouvrez une session de terminal sur votre système Linux.
2. Tapez la commande crontab -e pour éditer le fichier Crontab.
3. Ajoutez la ligne suivante en remplaçant /path/to/notes.js par le chemin absolu vers votre script notes.js :

```bash
*/10 * * * * /usr/bin/node /path/to/notes.js
```

4. Enregistrez et fermez le fichier Crontab.

Le Cronjob que vous venez de créer exécutera le script toutes les 10 minutes. Si vous souhaitez changer la fréquence d'exécution, modifiez le premier champ */10 qui spécifie le nombre de minutes entre chaque exécution.

Notez que cette méthode est spécifique à Linux. Sur d'autres systèmes d'exploitation, comme Windows, il existe des alternatives similaires pour planifier des tâches récurrentes.