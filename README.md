# Projet AppSinf - Préparatoire

**Cours**: LINFO1212 - Projet d'approfondissement en sciences informatiques  
**Groupe**: A14 (Lionel Hanon, Aktouf Anes, Nathan Cobut)

# Description

## Objectif

Le but est de réaliser un site web qui permet de gérer des incidents et des comptes utilisateurs.

Les utilisateurs, une fois connectés, peuvent soumettre des incidents.
Les incidents sont consultables sur la page d'accueil avec les valeurs suivantes : description, adresse, personne qui a soumis l'incident & date de soumission.

## Structure du site

Ce site contient 4 pages :
- `"/"`, la page d'accueil : permet de consulter les incidents
- `"/login"`, la page de connexion
- `"/signup"`, la page d'inscription
- `"incident-création"`, la page de création d'un accident : permet de publier un incident sur la page d'accueil.

## Structure du code

### Les pages webs

Nous utilisons une structure de layout. Pour charger une page, le code charge la page `./pages/layout.ejs` avec comme argument le titre de la page et le fichier à charger. 
Ensuite `layout.ejs` vient tout seul indiquer les métadonnées, le header qui se trouve dans `/pages/partials/header.ejs` et charge la page passée en argument.

Ceci nous évite de devoir copier-coller les métadonnées et le header sur chaque page.

### Les fichiers codes .JS

1. `./server.js`
C'est le fichier principal qui contient le squelette du serveur. Il y a les routes et connecte tous les autres codes.

2. `./backend/….js`
Ce sont les fichiers qui travaillent des données pures.
Exemple : `db.js`, `check-input.js`, `document-search.js`, `utils.js`

3. Les testes `./tests/….test.js`

# Installation

## 1. Création de la clé https
Avec openssl d'installé, faire cette commande dans votre terminal :
> `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365`

La clé de sécurité doit être "secretPasswordNoOneShouldHave".
Appuyez ENTREE pour toutes les autres valeurs

## 2. Instalation du serveur NodeJS

> `npm install`
Installe les modules nécessaires.

## 3. Setup les bases de donnée
Nous utilisons la base de donnée `LouvainLaccident` comme base de donnée principale et `LouvainLaccident_TEST` pour lancer nos batteries de testes.

1. Setup de la base de donnée de base avec quelques données d'exemples.
> `mongoimport --db=LouvainLaccident --collection=users --file=./setup-data/users.json --jsonArray`

"`2 document(s) imported successfully. 0 document(s) failed to import.`" devrait être retourné

> `mongoimport --db=LouvainLaccident --collection=incidents --file=./setup-data/incidents.json --jsonArray`

"`6 document(s) imported successfully. 0 document(s) failed to import.`" devrait être retourné.


# 3. Utilisation

Le serveur peut se lancer avec la commande `node .\server.js`. Le site sera ensuite consultable en local sur `https://127.0.0.1:8080/`.

## Les tests

Les tests sont utilisables avec la commande `npm test`. Elle testera les codes backend, les routes, la base de données et grâce à Selenium l'interface sera testée.

Les tests créent leur propre base de données pour éviter que les erreurs impactent les données de la base de données de base.

Pour utiliser Selenium, Chrome devra être installé.