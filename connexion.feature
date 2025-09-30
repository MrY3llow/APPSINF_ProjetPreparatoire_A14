# language: fr
Fonctionnalité: Connexion utilisateur

Pour accéder aux fonctionnalités personnalisées du site,
un utilisateur doit pouvoir s’enregistrer, se connecter et consulter son profil.

Scénario: Enregistrement d’un nouvel utilisateur
Étant donné une adresse email non enregistrée et un mot de passe valide
Lorsque l'utilisateur demande son inscription
Alors l’utilisateur est enregistré sur le système

Scénario: Connexion avec identifiants corrects
Étant donné un utilisateur enregistré avec l’email "user@mail.com" et le mot de passe "azerty"
Lorsque l’utilisateur tente de se connecter avec ces identifiants
Alors l’utilisateur est connecté au système
Et il est redirigé vers son profil

Scénario: Connexion avec mot de passe incorrect
Étant donné un utilisateur enregistré avec l’email "user@mail.com" et le mot de passe "azerty"
Lorsque l’utilisateur tente de se connecter avec le mot de passe "qwerty"
Alors la connexion est refusée
Et un message d’erreur est affiché
