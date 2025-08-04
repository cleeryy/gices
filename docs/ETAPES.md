# Guide Prompt par Étape - Développement Gices

Guide détaillé pour développer Gices étape par étape avec des prompts prêts à utiliser.

---

## PHASE 1: FOUNDATION & SETUP

### ÉTAPE 1.1 - Infrastructure de Base

**Durée** : 2-3 jours  
**Objectif** : Initialiser le projet avec Next.js 14, TypeScript, et Docker

**Actions demandées** :

1. Commandes pnpm pour initialiser Next.js 14 avec TypeScript
2. Configuration package.json avec scripts de développement
3. Setup ESLint + Prettier avec règles strictes
4. Configuration Tailwind CSS optimisée
5. Structure de dossiers selon bonnes pratiques Next.js 14
6. Fichiers de configuration (.gitignore, tsconfig.json, etc.)
7. Dockerfile multi-stage pour l'application
8. docker-compose.yml basique avec Next.js + MySQL
9. Variables d'environnement (.env.example)

**Prompt à utiliser** :

```
ÉTAPE 1.1 - Infrastructure de Base

Je commence Gices selon la roadmap. Donne-moi :
- Commandes pnpm exactes pour Next.js 14 + TypeScript
- Configuration complète package.json avec scripts dev
- Setup ESLint + Prettier strictes
- Config Tailwind CSS
- Structure dossiers optimisée Next.js 14
- Dockerfile multi-stage + docker-compose.yml avec MySQL
- .env.example avec variables de base

Utilise pnpm et docker compose exclusivement.
```

---

### ÉTAPE 1.2 - Setup Prisma et Base de Données

**Durée** : 2-3 jours  
**Objectif** : Configurer Prisma avec MySQL et modèles de base

**Actions demandées** :

1. Installation et configuration Prisma avec pnpm
2. Modèle de données initial (User, Mail, MailAction)
3. Configuration MySQL avec Docker optimisée
4. Migrations initiales Prisma
5. Scripts de seed pour données de test
6. Configuration des index pour performance

**Prompt à utiliser** :

```
ÉTAPE 1.2 - Setup Prisma et Base de Données

Configure Prisma pour Gices :
- Installation Prisma avec pnpm
- Schema.prisma avec modèles User, Mail, MailAction selon la doc
- Configuration MySQL dans docker-compose.yml
- Migrations initiales
- Script de seed avec données de test
- Index optimisés pour performance

Respecte le modèle de données de la documentation.
```

---

### ÉTAPE 1.3 - NextAuth.js Configuration

**Durée** : 2-3 jours  
**Objectif** : Authentification complète avec NextAuth.js

**Actions demandées** :

1. Installation NextAuth.js avec Prisma adapter
2. Configuration providers (credentials, Google, GitHub)
3. Pages de connexion/inscription personnalisées
4. Middleware de protection des routes
5. Types TypeScript pour sessions
6. Système de rôles de base (USER, ADMIN)

**Prompt à utiliser** :

```
ÉTAPE 1.3 - NextAuth.js Configuration

Implémente l'authentification pour Gices :
- Setup NextAuth.js avec PrismaAdapter
- Providers : credentials + Google + GitHub (optionnels)
- Pages auth personnalisées avec shadcn/ui
- Middleware protection routes
- Types TypeScript sessions
- Système rôles USER/ADMIN

Utilise les conventions de la documentation SECURITE.md.
```

---

## PHASE 2: MVP CORE FEATURES

### ÉTAPE 2.1 - shadcn/ui et Layout Principal

**Durée** : 2-3 jours  
**Objectif** : Interface utilisateur de base

**Actions demandées** :

1. Installation shadcn/ui avec thème personnalisé
2. Layout principal responsive avec sidebar
3. Navigation avec menu contextuel
4. Composants de base (Button, Input, Card, etc.)
5. Thème sombre/clair (bonus)
6. Breadcrumbs et indicateurs de statut

**Prompt à utiliser** :

```
ÉTAPE 2.1 - shadcn/ui et Layout Principal

Crée l'interface de base pour Gices :
- Installation shadcn/ui + thème personnalisé français
- Layout principal avec sidebar responsive
- Navigation adaptée au contexte courrier
- Composants de base stylés
- Breadcrumbs et indicateurs
- Design accessible WCAG 2.1

Inspire-toi du guide UTILISATION.md pour la navigation.
```

---

### ÉTAPE 2.2 - API Routes et CRUD Courriers

**Durée** : 3-4 jours  
**Objectif** : Backend API complet pour courriers

**Actions demandées** :

1. API routes Next.js pour CRUD courriers
2. Validation avec Zod pour tous les endpoints
3. Middleware d'authentification et RBAC
4. Gestion d'erreurs standardisée
5. Pagination et filtrage avancés
6. Types TypeScript pour API

**Prompt à utiliser** :

```
ÉTAPE 2.2 - API Routes et CRUD Courriers

Développe l'API backend pour Gices :
- Routes CRUD complètes /api/mails selon doc API.md
- Validation Zod pour tous les schemas
- Middleware auth + RBAC
- Gestion erreurs standardisée
- Pagination et filtres avancés
- Types TypeScript stricts

Respecte exactement la structure API de la documentation.
```

---

### ÉTAPE 2.3 - Pages de Gestion du Courrier

**Durée** : 3-4 jours  
**Objectif** : Interface utilisateur pour CRUD courriers

**Actions demandées** :

1. Page liste des courriers avec tableau interactif
2. Formulaire création/édition courrier
3. Page détail courrier avec actions
4. Système de recherche et filtrage UI
5. Composants réutilisables
6. Gestion des états de chargement

**Prompt à utiliser** :

```
ÉTAPE 2.3 - Pages de Gestion du Courrier

Crée les pages frontend pour la gestion du courrier :
- Page liste avec tableau Data Table shadcn/ui
- Formulaires création/édition avec validation
- Page détail avec actions et historique
- Recherche et filtres UI intuitifs
- Loading states et error handling
- Composants réutilisables

Suis le workflow décrit dans UTILISATION.md.
```

---

### ÉTAPE 2.4 - Dashboard et Statistiques

**Durée** : 2-3 jours  
**Objectif** : Tableau de bord principal

**Actions demandées** :

1. Dashboard avec KPI et métriques
2. Graphiques avec Chart.js ou Recharts
3. Widgets de notifications
4. Vue d'ensemble des courriers en attente
5. Statistiques par période
6. Composants de graphiques réutilisables

**Prompt à utiliser** :

```
ÉTAPE 2.4 - Dashboard et Statistiques

Développe le dashboard principal de Gices :
- KPI courriers (reçus, en attente, traités)
- Graphiques tendances avec Recharts
- Widgets notifications et alertes
- Vue d'ensemble courriers prioritaires
- Statistiques configurables par période
- Composants charts réutilisables

Réfère-toi à la section "Rapports et Statistiques" de UTILISATION.md.
```

---

### ÉTAPE 2.5 - Upload et Gestion Fichiers

**Durée** : 3-4 jours  
**Objectif** : Système de pièces jointes

**Actions demandées** :

1. API upload sécurisé avec validation
2. Composant drag & drop pour upload
3. Prévisualisation fichiers (images, PDF)
4. Stockage organisé avec nommage unique
5. API téléchargement avec contrôle d'accès
6. Gestion des types de fichiers autorisés

**Prompt à utiliser** :

```
ÉTAPE 2.5 - Upload et Gestion Fichiers

Implémente le système de pièces jointes pour Gices :
- API upload sécurisé /api/attachments
- Composant drag & drop avec progress
- Prévisualisation images et PDF
- Stockage organisé dans /uploads
- Téléchargement sécurisé avec auth
- Validation types et tailles selon CONFIG

Respecte les spécifications de sécurité SECURITE.md.
```

---

## PHASE 3: FONCTIONNALITÉS AVANCÉES

### ÉTAPE 3.1 - Système d'Actions et Workflow

**Durée** : 3-4 jours  
**Objectif** : Workflow de traitement du courrier

**Actions demandées** :

1. Modèle MailAction et API associée
2. Interface actions sur courrier (lu, transféré, traité)
3. Historique des actions avec timeline
4. Système de commentaires internes
5. Notifications d'actions aux utilisateurs
6. Workflow configurable par type de courrier

**Prompt à utiliser** :

```
ÉTAPE 3.1 - Système d'Actions et Workflow

Développe le système d'actions pour Gices :
- Modèle MailAction + API /api/mails/:id/actions
- Interface actions (lire, transférer, traiter, archiver)
- Timeline historique des actions
- Commentaires internes avec mentions
- Notifications actions en temps réel
- Workflow configurable par organisation

Utilise le modèle défini dans la documentation technique.
```

---

### ÉTAPE 3.2 - Notifications Email

**Durée** : 2-3 jours  
**Objectif** : Système de notifications automatiques

**Actions demandées** :

1. Configuration Nodemailer avec SMTP
2. Templates d'emails responsives
3. Notifications automatiques (nouveau courrier, échéances)
4. Système de préférences utilisateur
5. Queue d'emails avec retry
6. Digest quotidien/hebdomadaire

**Prompt à utiliser** :

```
ÉTAPE 3.2 - Notifications Email

Implémente les notifications email pour Gices :
- Setup Nodemailer avec config SMTP
- Templates HTML responsives français
- Notifications auto (nouveau courrier, rappels)
- Préférences notifications par utilisateur
- Queue emails avec gestion d'erreurs
- Digest périodique configurable

Respecte la configuration EMAIL de CONFIGURATION.md.
```

---

### ÉTAPE 3.3 - API RESTful Complète

**Durée** : 2-3 jours  
**Objectif** : API documentée pour intégrations

**Actions demandées** :

1. Documentation Swagger automatique
2. Versioning API avec headers
3. Rate limiting par utilisateur
4. Endpoints statistiques avancées
5. API keys pour intégrations tierces
6. Tests API automatisés

**Prompt à utiliser** :

```
ÉTAPE 3.3 - API RESTful Complète

Finalise l'API RESTful de Gices :
- Documentation Swagger sur /api/docs
- Versioning API et rétrocompatibilité
- Rate limiting configurable
- Endpoints stats avancées /api/stats
- Système API keys pour intégrations
- Tests API Jest complets

Suis exactement la spec de API.md.
```

---

## PHASE 4: PRODUCTION READY

### ÉTAPE 4.1 - Tests Complets

**Durée** : 3-4 jours  
**Objectif** : Suite de tests automatisés

**Actions demandées** :

1. Tests unitaires Jest avec 80%+ couverture
2. Tests d'intégration pour API routes
3. Tests E2E avec Playwright
4. Tests de performance et charge
5. Configuration CI pour tests automatiques
6. Mocks et fixtures de test

**Prompt à utiliser** :

```
ÉTAPE 4.1 - Tests Complets

Développe la suite de tests pour Gices :
- Tests unitaires Jest 80%+ couverture
- Tests intégration API routes complètes
- Tests E2E Playwright workflows utilisateur
- Tests performance et charge
- Config GitHub Actions pour CI
- Mocks et données de test réalistes

Assure qualité production selon DEVELOPPEMENT.md.
```

---

### ÉTAPE 4.2 - CI/CD et Déploiement

**Durée** : 2-3 jours  
**Objectif** : Pipeline de déploiement automatisé

**Actions demandées** :

1. Workflow GitHub Actions complet
2. Build et push images Docker automatiques
3. Déploiement staging et production
4. Configuration Watchtower
5. Monitoring et health checks
6. Backup automatisé des données

**Prompt à utiliser** :

```
ÉTAPE 4.2 - CI/CD et Déploiement

Configure le déploiement automatisé pour Gices :
- GitHub Actions workflow complet (.github/workflows/)
- Build/push Docker images avec cache
- Déploiement multi-environnements
- Watchtower pour auto-updates
- Health checks et monitoring
- Stratégie backup et rollback

Implémente selon DEPLOIEMENT.md.
```

---

### ÉTAPE 4.3 - Migration de Données

**Durée** : 2-3 jours  
**Objectif** : Migration depuis ancienne base MySQL

**Actions demandées** :

1. Scripts d'analyse de l'ancienne base
2. Mapping des données et transformation
3. Scripts de migration avec validation
4. Tests d'intégrité post-migration
5. Documentation du processus
6. Stratégie de rollback

**Prompt à utiliser** :

```
ÉTAPE 4.3 - Migration de Données

Développe la migration de données pour Gices :
- Scripts analyse ancienne base MySQL
- Mapping et transformation des données
- Migration sécurisée avec validation
- Tests intégrité et cohérence
- Documentation processus complet
- Procédure rollback d'urgence

Suis le guide MIGRATION.md étape par étape.
```

---

## PHASE 5: FONCTIONNALITÉS BONUS

### ÉTAPE 5.1 - Système de Tags Avancé

**Durée** : 2-3 jours  
**Objectif** : Tags personnalisables et recherche sémantique

**Actions demandées** :

1. Modèle Tag avec couleurs et icônes
2. Interface de gestion des tags
3. Auto-suggestion et recherche par tags
4. Analytics par catégories de tags
5. Import/export configuration tags
6. Tags prédéfinis par contexte français

**Prompt à utiliser** :

```
ÉTAPE 5.1 - Système de Tags Avancé

Implémente le système de tags pour Gices :
- Modèle Tag avec couleurs/icônes personnalisables
- Interface gestion tags par organisation
- Auto-suggestion et recherche sémantique
- Statistiques par catégories de tags
- Import/export config tags
- Tags prédéfinis contexte administratif français

Étends les fonctionnalités de base du MVP.
```

---

### ÉTAPE 5.2 - PWA et Optimisations

**Durée** : 2-3 jours  
**Objectif** : Progressive Web App

**Actions demandées** :

1. Service Worker pour cache offline
2. Manifest PWA pour installation mobile
3. Notifications push navigateur
4. Optimisations performance (lazy loading, etc.)
5. Compression images avec next/image
6. Cache intelligent avec Redis (optionnel)

**Prompt à utiliser** :

```
ÉTAPE 5.2 - PWA et Optimisations

Transforme Gices en PWA optimisée :
- Service Worker avec cache offline intelligent
- Manifest PWA installation mobile
- Notifications push navigateur
- Optimisations Next.js avancées
- Compression images automatique
- Cache Redis pour performance (optionnel)

Maximise l'expérience utilisateur mobile et performance.
```

---

## UTILISATION DE CE GUIDE

### Comment utiliser chaque étape :

1. **Copie le prompt** de l'étape en cours
2. **Colle-le dans l'espace Perplexity** Gices
3. **L'agent connaît le contexte** et fournira le code/config exact
4. **Implémente les solutions** proposées
5. **Test et validation** avant étape suivante

### Progression recommandée :

- **Séquentiel** : Termine chaque étape avant la suivante
- **Validation** : Teste chaque fonctionnalité avant de continuer
- **Documentation** : Met à jour selon les modifications
- **Git** : Commit après chaque étape majeure

### Adaptation possible :

- **Priorise selon besoins** : Skip bonus si temps limité
- **Combine étapes courtes** : 2.4 + 2.5 possibles ensemble
- **Étale si nécessaire** : Divise étapes complexes

Ce guide te permet d'avoir un développement structuré avec des prompts prêts à utiliser pour chaque étape de Gices !
