# Guide Développeur

Guide pour les développeurs contribuant à l'application de suivi du courrier.

## Structure du Projet

```
courrier-app/
├── app/                  # Pages et layouts Next.js
├── components/           # Composants React (shadcn/ui)
├── lib/                  # Utilitaires et services
├── prisma/               # Schéma et migrations Prisma
├── public/               # Assets statiques
├── scripts/              # Scripts de migration/custom
├── tests/                # Tests unitaires et e2e
├── types/                # Définitions TypeScript
├── uploads/              # Stockage fichiers (monté en volume)
├── .env.example          # Exemple variables env
├── docker-compose.yml    # Orchestration Docker
├── Dockerfile            # Build image
├── next.config.js        # Config Next.js
├── prisma/schema.prisma  # Modèle DB
└── tsconfig.json         # Config TypeScript
```

## Commandes npm

```
# Développement
npm run dev              # Démarre serveur dev
npm run db:push          # Push schéma Prisma
npm run db:migrate       # Exécute migrations
npm run db:seed          # Seed données test
npm run lint             # Lint code
npm run format           # Format code avec Prettier

# Tests
npm run test             # Tests unitaires (Jest)
npm run test:e2e         # Tests end-to-end (Playwright)
npm run test:watch       # Tests en watch mode

# Build et Production
npm run build            # Build production
npm run start            # Démarre production
npm run docker:build     # Build image Docker
npm run docker:push      # Push vers registry
```

## Conventions de Code

### TypeScript

- **Strict mode** activé
- **Types explicites** pour toutes les fonctions
- **Zod** pour validation schemas
- **Pas de any** sauf exceptions justifiées

### Nommage

- **Composants** : PascalCase (ex: MailList.tsx)
- **Fonctions** : camelCase (ex: fetchMails)
- **Variables** : camelCase
- **Constants** : UPPER_CASE
- **Fichiers** : kebab-case pour utils, PascalCase pour components

### Git Workflow

- **Branches** : feature/nom-feature, fix/nom-bug
- **Commits** : Conventionnels (feat:, fix:, chore:, etc.)
- **PR** : Avec description, tests, et revue de code

### Tests

- **Couverture** : Minimum 80%
- **Unitaires** : Pour services et utils
- **Intégration** : Pour API routes
- **E2E** : Pour workflows utilisateur

## Développement Frontend

### shadcn/ui Intégration

- **Ajouter composant** : `npx shadcn-ui@latest add button`
- **Thème** : Tailwind CSS avec custom variables dans `globals.css`
- **Responsive** : Utilisez les classes Tailwind (sm:, md:, etc.)

### Pages Principales

- `/dashboard` : Tableau de bord
- `/mails` : Liste courriers
- `/mails/[id]` : Détail courrier
- `/admin/users` : Gestion utilisateurs

## Développement Backend

### Prisma Usage

- **Queries** : Utilisez `prisma.mail.findMany({ ... })`
- **Transactions** : `prisma.$transaction([...])` pour opérations atomiques
- **Migrations** : `npx prisma migrate dev --name nom-migration`

### API Routes

- Fichiers dans `app/api/`
- **Middleware** : Pour auth et rate limiting
- **Erreurs** : Throw custom errors avec codes

## Outils de Développement

- **VS Code Extensions** : ESLint, Prettier, Prisma, Tailwind CSS IntelliSense
- **Debugger** : Next.js built-in avec Chrome DevTools
- **Swagger** : `/api/docs` en dev pour tester API

## Contribution

1. **Fork** le repo
2. **Créez branche** feature
3. **Codez et testez**
4. **Commit et push**
5. **Ouvrez PR** avec détails

## Bonnes Pratiques

- **Performance** : Utilisez React.memo et useCallback
- **Sécurité** : Jamais exposer secrets en client-side
- **Accessibilité** : Ajoutez ARIA labels
- **i18n** : Prêt pour multi-langues (français par défaut)

## Résolution de Problèmes

- **Erreur Prisma** : `npm run db:reset` puis `db:migrate`
- **Build échoue** : Vérifiez dépendances avec `npm ls`
- **Tests fail** : Lancez en watch pour debug
