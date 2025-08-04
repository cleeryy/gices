# Guide de Déploiement

Ce guide couvre le déploiement de l'application en production, avec un focus sur l'automatisation et la scalabilité.

## Prérequis pour le Déploiement

- **Serveur** : Linux (Ubuntu 20.04+ recommandé) avec Docker installé
- **Domaine** : Configuré avec DNS pointant vers le serveur
- **Certificats SSL** : Via Let's Encrypt ou similaire
- **Registry Docker** : Docker Hub, GitHub Container Registry ou privé
- **Secrets** : Gérés via GitHub Secrets ou outil comme HashiCorp Vault

## Étapes de Déploiement Manuel

### 1. Préparation du Serveur

```
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker et Docker Compose
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Redémarrer la session
exit
```

### 2. Cloner et Configurer

```
git clone https://github.com/votre-org/courrier-app.git
cd courrier-app

# Créer .env avec valeurs production
cp .env.example .env
# Éditer avec valeurs réelles (DATABASE_URL, etc.)
```

### 3. Construire et Démarrer

```
# Construire l'image
docker-compose -f docker-compose.prod.yml build

# Démarrer
docker-compose -f docker-compose.prod.yml up -d

# Appliquer les migrations
docker-compose -f docker-compose.prod.yml exec nextjs-app npm run db:migrate
```

### 4. Configuration SSL avec Nginx Reverse Proxy

**Installer Nginx**

```
sudo apt install nginx certbot python3-certbot-nginx -y
```

**Fichier de configuration Nginx** (`/etc/nginx/sites-available/courrier-app`)

```
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Activer et certifier**

```
sudo ln -s /etc/nginx/sites-available/courrier-app /etc/nginx/sites-enabled/
sudo certbot --nginx -d votre-domaine.com
sudo nginx -t && sudo systemctl reload nginx
```

## Déploiement Automatisé avec CI/CD

### GitHub Actions Workflow

Le workflow est déjà configuré dans `.github/workflows/deploy.yml`. Assurez-vous d'ajouter ces secrets dans GitHub :

- DOCKER_USERNAME
- DOCKER_PASSWORD
- DEPLOY_SERVER_IP
- DEPLOY_SSH_KEY

**Étapes du Workflow** :

1. **Test** : Exécute tests unitaires et lint
2. **Build** : Construit l'image Docker
3. **Push** : Pousse vers le registry
4. **Deploy** : SSH sur le serveur pour pull et restart

### Watchtower pour Mises à Jour Automatiques

- Déjà inclus dans docker-compose
- Surveille les nouvelles images toutes les 5 minutes
- Met à jour automatiquement les conteneurs
- Nettoie les anciennes images

## Scaling et Haute Disponibilité

### Scaling Horizontal

- **Multi-instances** : Utilisez Docker Swarm ou Kubernetes

```
docker service create --name nextjs-app --replicas 3 -p 3000:3000 votre-image
```

- **Load Balancing** : Avec Nginx ou Traefik

```
upstream backend {
    server nextjs-app1:3000;
    server nextjs-app2:3000;
    server nextjs-app3:3000;
}
```

### Base de Données HA

- **Réplication MySQL** : Master-Slave configuration
- **Backup automatique** : Script cron pour mysqldump

```
# Exemple cron
0 2 * * * docker exec mysql mysqldump -u root --password=$MYSQL_ROOT_PASSWORD courrier_db > /backups/db-$(date +%Y%m%d).sql
```

### Monitoring

- **Prometheus + Grafana** : Pour métriques
- **ELK Stack** : Pour logs (optionnel)
- **Uptime Robot** : Pour alertes de downtime

## Rollback

### Procédure de Rollback

1. **Arrêter les services** : `docker-compose down`
2. **Restaurer image précédente** : `docker tag ancienne-image:latest`
3. **Redémarrer** : `docker-compose up -d`
4. **Restaurer DB** si nécessaire : `mysqldump` import

## Considérations de Production

- **Environnement** : NODE_ENV=production
- **Sécurité** : Firewall (UFW) avec ports 80/443/22 ouverts
- **Backups** : Automatiques quotidiens des volumes Docker
- **Mises à jour** : Testez en staging avant production
- **Coûts** : Surveillez l'usage CPU/RAM pour scaling

## Dépannage Déploiement

- **Erreur d'image** : Vérifiez `docker logs nextjs-app`
- **Problème SSL** : `certbot renew --dry-run`
- **CI/CD échoue** : Vérifiez les logs GitHub Actions
