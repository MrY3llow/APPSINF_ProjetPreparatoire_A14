# language: fr
Fonctionnalité: Soumission d’un accident

Les utilisateurs doivent pouvoir soumettre un accident avec une adresse
et une description courte pour qu’il soit référencé sur le site.

Scénario: Soumission valide d’un accident
Étant donné que l’utilisateur est connecté
Et qu’il saisit l’adresse "Rue de la Loi 16, Bruxelles"
Et qu’il saisit la description "Accident léger entre deux voitures"
Lorsque l’utilisateur soumet le formulaire
Alors l’accident est enregistré dans le système
Et un message de confirmation est affiché

Scénario: Soumission sans description
Étant donné que l’utilisateur est connecté
Et qu’il saisit l’adresse "Rue de la Loi 16, Bruxelles"
Et qu’il ne saisit pas de description
Lorsque l’utilisateur soumet le formulaire
Alors l’enregistrement est refusé
Et un message d’erreur est affiché
