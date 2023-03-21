# Notes.js

Ce programme en Node.js simule une navigation sur un site web. Il a pour but de comparer l'ancien code HTML avec le nouveau code HTML et d'envoyer un SMS au numéro spécifié dans le fichier .env si les deux codes HTML sont différents.
## Installation
1. Clonez le repository GitHub.
2. Installez les dépendances avec npm install.
3. Créez un fichier .env avec les informations nécessaires (voir ci-dessous).
4. Lancez le programme avec node notes.js.

## Création d'un compte Twilio et configuration du fichier .env

Pour utiliser le service Twilio, vous devez créer un compte gratuit sur leur site web. Une fois que vous avez créé votre compte, vous pouvez récupérer votre accountSid et votre authToken dans votre tableau de bord Twilio.

Le fichier .env doit être configuré avec les informations suivantes :

```
bash

#twilio
accountSid=VOTRE_ACCOUNT_SID_TWILIO
authToken=VOTRE_AUTH_TOKEN_TWILIO

#myges
username=VOTRE_NOM_D_UTILISATEUR_MYGES
password=VOTRE_MOT_DE_PASSE_MYGES
semesterSelector="[data-label='2022-2023 - ESGI - 3ESGI  - Semestre 1']"

#message
body=VOTRE_MESSAGE
from=VOTRE_NUMERO_TWILIO
to=LE_NUMERO_DE_DESTINATION_DU_SMS
```
Remplacez VOTRE_ACCOUNT_SID_TWILIO et VOTRE_AUTH_TOKEN_TWILIO par les informations correspondantes de votre compte Twilio.

Pour les informations username et password, utilisez votre nom d'utilisateur et votre mot de passe MyGES.
'semesterSelector' doit être configuré avec le sélecteur CSS correspondant au semestre actuel.
'body' doit contenir le texte que vous souhaitez envoyer dans votre SMS.
'from' doit être configuré avec votre numéro Twilio.
'to' doit contenir le numéro de téléphone portable qui recevra le SMS.

## Utilisation

Si le programme est lancé pour la première fois et que le fichier notes.html n'existe pas, le programme le créera et mettra fin à l'exécution. Sinon, le programme récupèrera le code HTML du site web et le comparera avec l'ancien code HTML stocké dans le fichier notes.html. Si les deux codes sont différents, le programme enverra un SMS au numéro spécifié dans le fichier .env.

## Mise en place

Pour exécuter le script notes.js toutes les 10 minutes, vous pouvez utiliser la fonctionnalité de tâches planifiées de votre système d'exploitation. Sur Linux, cela peut être fait à l'aide d'un Cronjob.

Voici les étapes pour créer un Cronjob qui exécutera le script toutes les 10 minutes sur les principaux systèmes Linux :

1. Ouvrez une session de terminal sur votre système Linux.
2. Tapez la commande crontab -e pour éditer le fichier Crontab.
3. Ajoutez la ligne suivante en remplaçant /path/folder par le chemin absolu vers la ou le script est stocké et /path/to/notes.js par le chemin absolu vers votre script notes.js :

```bash
*/10 * * * * /path/folder /usr/bin/node /path/to/notes.js
```

4. Enregistrez et fermez le fichier Crontab.

Le Cronjob que vous venez de créer exécutera le script toutes les 10 minutes. Si vous souhaitez changer la fréquence d'exécution, modifiez le premier champ */10 qui spécifie le nombre de minutes entre chaque exécution.

Il est important de noter que le cron doit avoir les permissions nécessaires pour exécuter le script et créer les fichiers requis. Par exemple, si l'utilisateur "ubuntu" est utilisé, le script doit être placé dans un fichier appartenant à "ubuntu" et le cron doit être créé avec l'utilisateur "ubuntu".

Notez que cette méthode est spécifique à Linux. Sur d'autres systèmes d'exploitation, comme Windows, il existe des alternatives similaires pour planifier des tâches récurrentes.