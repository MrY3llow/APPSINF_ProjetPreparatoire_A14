# Projet AppSinf - Préparatoire

**Cours**: LINFO1212 - Projet d'approfondissement en sciences informatiques  
**Groupe**: A14 (Lionel Hanon, Aktouf Anes, Nathan Cobut)

# Description

## Objectif

Le but est de réaliser un site web qui permet de gérer des incidents et des comptes utilisateurs.

Les utilisateurs, une fois connecté peuvent soumetre des incidents.
Les incidents sont consultables sur la page d'acceuil avec les valeurs suivantes : description, address, personne qui a soumis l'incident & date de soumission.

## Structure du site

Ce site contient 4 pages :
- "/", la page d'acceuil : permet de consulter les incidents
- "/login", le page de connexion
- "/signup", la apge d'inscription
- "incident-creation", la page de création d'un accident : permet de publier un incident sur la page d'acceuil.

## Structure du code

### Les pages webs

Nous utilisons une structure de layout. Pour charger une page, le code charge la page `./pages/layout.ejs` avec comme argument le titre de la page et le fichier a charger. 
Ensuite `layout.ejs` vient tous seul indiquer les métadonnées, le header qui se trouve dans `/pages/partials/header.ejs` et charge la page passer en argument.

Ceci nous évite de devoir copier coller les metadonnée et le header sur chaque pages.

### Les fichiers codes .JS

1. `./server.js`
C'est le fichier principale qui contient le squelette du serveur. Il y a les routes et connecte tous les autres codes.

2. `./backend/….js`
Ce sont les fichiers qui travaillent des données pures.
Exemple : `db.js`, `check-input.js`, `document-search.js`, `utils.js`

3. Les testes `./tests/….test.js`

# Installation

## 1. Créer la clé https
Avec openssl d'installé, faire cette commande dans votre terminal :
> `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365`

La clé de sécurité doit être "secretPasswordNoOneShouldHave".

## 2. Setup les bases de donnée
Nous utilisons la base de donnée `LouvainLaccident` comme base de donnée principale et `LouvainLaccident_TEST` pour lancer nos batteries de testes.

1. Setup de la base de donnée de base avec quelques données d'exemples.
> `mongoimport --db=LouvainLaccident --collection=users --file=./setup-data/users.json --jsonArray`

"`2 document(s) imported successfully. 0 document(s) failed to import.`" devrait être retourné

> `mongoimport --db=LouvainLaccident --collection=incidents --file=./setup-dincidents.json --jsonArray`

"`6 document(s) imported successfully. 0 document(s) failed to import.`" devrait être retourné.


# 3. Les tests

Les testes sont utilisable avec la commande `npm test`. Elle testera les codes backend, les routes, la base de donnée et grace a Selenium l'interface sera testé.

Les testes crée leur propre base de donnée pour éviter que les erreurs imapctes les données de la base de donnée de base.

Pour utiliser Selenium, Chrome devra être installé.