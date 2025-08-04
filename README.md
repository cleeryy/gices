# Application de Suivi du Courrier

Une application fullstack moderne pour la gestion et le suivi du courrier physique et électronique, développée avec Next.js, TypeScript, et Prisma.

## 🚀 Fonctionnalités Principales

- **Gestion complète du courrier** : physique et électronique
- **Authentification sécurisée** avec NextAuth.js
- **Interface moderne** avec shadcn/ui
- **API RESTful** pour intégrations tierces
- **Tableaux de bord** et statistiques
- **Système de notifications** par email
- **Gestion des rôles** et permissions
- **Conteneurisation Docker** complète

## 🛠️ Stack Technique

- **Frontend/Backend** : Next.js 14 (TypeScript)
- **Base de données** : MySQL 8.0
- **ORM** : Prisma
- **Authentification** : NextAuth.js
- **UI** : shadcn/ui + Tailwind CSS
- **Conteneurisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions
- **Déploiement** : Watchtower (auto-update)

## 📋 Prérequis

- Node.js 18.x ou supérieur
- Docker et Docker Compose
- MySQL 8.0 (si installation locale)
- Git

## ⚡ Démarrage Rapide

```
# Cloner le repository
git clone https://github.com/votre-org/courrier-app.git
cd courrier-app

# Démarrer avec Docker
docker-compose up -d

# Ou installation locale
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📚 Documentation

- [Guide d'Installation](./docs/INSTALLATION.md)
- [Configuration](./docs/CONFIGURATION.md)
- [Guide Utilisateur](./docs/UTILISATION.md)
- [Documentation API](./docs/API.md)
- [Guide de Déploiement](./docs/DEPLOIEMENT.md)
- [Guide Développeur](./docs/DEVELOPPEMENT.md)
- [Migration des Données](./docs/MIGRATION.md)
- [Sécurité](./docs/SECURITE.md)
- [FAQ](./docs/FAQ.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez le [Guide Développeur](./docs/DEVELOPPEMENT.md) pour plus d'informations.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

Pour toute question ou problème, consultez la [FAQ](./docs/FAQ.md) ou ouvrez une issue sur GitHub.
