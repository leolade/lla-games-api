
# Bac à sable jeux

Une API permettant de centraliser divers informations pour divers jeu (à ce jour, uniquement Wordle/Motus)
## Run Locally

Prérequis
```
  Installer Node12 
  Installer MySQL Server 5.6
  Créer une base de données sur MySQL (le nom est à garder et à renseigner dans la variable d'environnement plus bas)
```

Clonez le projet

```bash
  git clone https://link-to-project
```

En ligne de commande, rendez-vous dans le répertoire du projet

```bash
  cd link-to-project
```

Installez les dépendances

```bash
  npm i
```

Lancez le serveur
```bash
  npm run start
```


## Environment Variables

Pour pouvoir lancer le serveur, vous devez disposez des variable d'environnement suivantes

`PARTY_GAMES_MYSQL_DATABASE_URL` URL de la base MySQL. Doit être sous la forme jdbc:mysql://[username]:[password]@localhost:[port]/[nom_de_la_base]

`JWS_SECRET_KEY`
Avec comme valeur une chaine de caractères permettant d'encoder le mot de passe d'un utilisateur. Peut faire jusqu'a 32 caractères alphanumériques
