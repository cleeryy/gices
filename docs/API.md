# Documentation API

Documentation complète de l'API RESTful de l'application de suivi du courrier. L'API est exposée via les routes Next.js et protégée par authentification.

## Base URL

- **Développement** : `http://localhost:3000/api`
- **Production** : `https://votre-domaine.com/api`

## Authentification

- **Méthode** : JWT via NextAuth.js
- **Header requis** : `Authorization: Bearer {token}`
- **Endpoints publics** : `/api/health`, `/api/auth/*`
- **Endpoints protégés** : Tous les autres, avec contrôle RBAC

### Obtenir un Token

- **Login** : `POST /api/login` avec credentials
- **Session** : Utilisez `useSession()` côté client

## Endpoints Principaux

### Courriers (/api/mails)

- **GET /api/mails**  
  Récupère la liste des courriers (paginated).  
  **Params** :

  - `page` : Numéro de page (défaut: 1)
  - `limit` : Éléments par page (défaut: 20)
  - `status` : Filtre par statut (ex: "RECEIVED")
  - `type` : Filtre par type (ex: "PHYSICAL")
  - `search` : Recherche full-text  
    **Permissions** : READ_MAIL  
    **Réponse** : Array de courriers avec métadonnées.  
    **Exemple** :

  ```
  curl -H "Authorization: Bearer {token}" http://localhost:3000/api/mails?page=1&limit=10
  ```

- **POST /api/mails**  
  Crée un nouveau courrier.  
  **Body** : JSON avec champs (subject, type, priority, etc.)  
  **Permissions** : WRITE_MAIL  
  **Réponse** : Objet courrier créé.

- **GET /api/mails/:id**  
  Récupère un courrier spécifique.  
  **Permissions** : READ_MAIL  
  **Réponse** : Détails du courrier incluant actions et attachments.

- **PUT /api/mails/:id**  
  Met à jour un courrier.  
  **Body** : Champs à updater.  
  **Permissions** : WRITE_MAIL

- **DELETE /api/mails/:id**  
  Supprime un courrier (soft delete).  
  **Permissions** : DELETE_MAIL

### Actions sur Courriers (/api/mails/:id/actions)

- **GET /api/mails/:id/actions**  
  Liste les actions sur un courrier.  
  **Permissions** : READ_MAIL

- **POST /api/mails/:id/actions**  
  Ajoute une action.  
  **Body** : { action: "READ", comment: "Optionnel" }  
  **Permissions** : WRITE_MAIL

### Statistiques (/api/stats)

- **GET /api/stats**  
  Récupère les statistiques globales.  
  **Params** :

  - `period` : "day", "week", "month" (défaut: "month")
  - `service` : Filtre par service  
    **Permissions** : VIEW_STATS  
    **Réponse** : { totalMails: 123, pending: 45, averageResponseTime: 2.5 }

- **GET /api/stats/user/:userId**  
  Statistiques par utilisateur.  
  **Permissions** : VIEW_STATS (admin)

### Utilisateurs (/api/users)

- **GET /api/users**  
  Liste des utilisateurs.  
  **Permissions** : MANAGE_USERS

- **POST /api/users**  
  Crée un nouvel utilisateur.  
  **Body** : { email, name, role, password }  
  **Permissions** : MANAGE_USERS

- **GET /api/users/:id**  
  Détails d'un utilisateur.  
  **Permissions** : MANAGE_USERS

- **PUT /api/users/:id**  
  Met à jour un utilisateur.  
  **Permissions** : MANAGE_USERS

- **DELETE /api/users/:id**  
  Supprime un utilisateur.  
  **Permissions** : MANAGE_USERS

### Attachments (/api/attachments)

- **POST /api/attachments**  
  Upload d'un attachment (multipart/form-data).  
  **Params** : mailId  
  **Permissions** : WRITE_MAIL

- **GET /api/attachments/:id**  
  Télécharge un attachment.  
  **Permissions** : READ_MAIL

### Santé et Monitoring (/api/health)

- **GET /api/health**  
  Vérifie l'état du système.  
  **Public**  
  **Réponse** : { status: "OK", uptime: 12345, components: { db: "connected" } }

## Gestion des Erreurs

- **400** : Bad Request - Erreur de validation
- **401** : Unauthorized - Authentification requise
- **403** : Forbidden - Permissions insuffisantes
- **404** : Not Found - Ressource inexistante
- **429** : Too Many Requests - Limite de taux atteinte
- **500** : Internal Server Error - Erreur serveur

**Format d'erreur** :

```
{
  "error": "Description de l'erreur",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## Meilleures Pratiques

- **Utilisez HTTPS** en production
- **Validez les entrées** côté client avant envoi
- **Gérez les tokens** avec rafraîchissement automatique
- **Pagination** : Respectez les limites pour éviter les surcharges
- **Caching** : Utilisez des headers ETag pour les GET

## Outils pour Tester

- **Swagger UI** : Disponible en dev sur `/api/docs` (si ENABLE_SWAGGER=true)
- **Postman** : Importez la collection depuis GitHub
- **Curl** : Pour tests rapides

## Rate Limiting

- Fenêtre : 15 minutes
- Max : 100 requêtes par IP
- Exceptions : Endpoints admin avec token valide

## Sécurité API

- **CORS** : Limité aux domaines autorisés
- **Validation** : Zod pour tous les schémas
- **Logging** : Toutes les requêtes auditées
- **RBAC** : Contrôles granularisés par rôle
