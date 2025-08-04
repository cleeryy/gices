# Guide de Configuration

Configuration détaillée de l'application de suivi du courrier.

## Variables d'Environnement

### Fichier .env Principal

```
# ====================================
# BASE DE DONNÉES
# ====================================
DATABASE_URL="mysql://utilisateur:motdepasse@localhost:3306/courrier_db"
MYSQL_ROOT_PASSWORD=mot_de_passe_root_securise
MYSQL_DATABASE=courrier_db
MYSQL_USER=courrier_user
MYSQL_PASSWORD=mot_de_passe_user_securise

# ====================================
# AUTHENTIFICATION
# ====================================
NEXTAUTH_SECRET=votre_secret_nextauth_minimum_32_caracteres_tres_securise
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (optionnel)
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret

GITHUB_CLIENT_ID=votre_github_client_id
GITHUB_CLIENT_SECRET=votre_github_client_secret

# ====================================
# EMAIL / SMTP
# ====================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_application

# Paramètres d'envoi
FROM_EMAIL=noreply@votre-domaine.com
FROM_NAME="Système de Courrier"

# ====================================
# STOCKAGE FICHIERS
# ====================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB en bytes
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png,gif,txt

# ====================================
# SÉCURITÉ
# ====================================
BCRYPT_ROUNDS=12
JWT_EXPIRY=24h
RATE_LIMIT_WINDOW=900000  # 15 minutes en ms
RATE_LIMIT_MAX=100        # Max 100 requêtes par fenêtre

# ====================================
# APPLICATION
# ====================================
NODE_ENV=development
PORT=3000
APP_NAME="Suivi du Courrier"
APP_VERSION=1.0.0

# Paramètres de pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# ====================================
# LOGS ET MONITORING
# ====================================
LOG_LEVEL=info
LOG_FORMAT=combined
ENABLE_REQUEST_LOGGING=true

# ====================================
# DÉVELOPPEMENT
# ====================================
ENABLE_SWAGGER=true
ENABLE_DEBUG_ROUTES=false
```

## Configuration de la Base de Données

### MySQL Configuration Optimisée

Créez le fichier `mysql/my.cnf` :

```
[mysqld]
# Configuration générale
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
default-time-zone='+01:00'

# Performance
innodb_buffer_pool_size=256M
innodb_log_file_size=64M
max_connections=100
query_cache_size=32M

# Sécurité
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO

# Logs
log_error=/var/log/mysql/error.log
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow.log
long_query_time=2

[client]
default-character-set=utf8mb4
```

### Configuration Prisma

Fichier `prisma/schema.prisma` avec configuration personnalisée :

```
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl"]
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}

// Configuration des index optimisés
model Mail {
  // ... vos modèles

  @@index([status, receivedAt])
  @@index([recipientId, status])
  @@index([reference])
  @@fulltext([subject, content])
}
```

## Configuration NextAuth.js

### Providers d'Authentification

Fichier `pages/api/auth/[...nextauth].ts` :

```
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    }),

    // Provider Google (si configuré)
    ...(process.env.GOOGLE_CLIENT_ID ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),

    // Provider GitHub (si configuré)
    ...(process.env.GITHUB_CLIENT_ID ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 heures
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.sub
      session.user.role = token.role as string
      return session
    }
  },

  pages: {
    signIn: "/login",
    signUp: "/auth/signup",
    error: "/auth/error",
  }
}

export default NextAuth(authOptions)
```

## Configuration Email/SMTP

### Configuration Nodemailer

Fichier `lib/email.ts` :

```
import nodemailer from 'nodemailer'

export const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
}

export const transporter = nodemailer.createTransporter(emailConfig)

// Templates d'email
export const emailTemplates = {
  newMail: {
    subject: "Nouveau courrier reçu",
    template: "new-mail"
  },
  reminder: {
    subject: "Rappel : Courrier en attente",
    template: "reminder"
  },
  response: {
    subject: "Réponse requise",
    template: "response-required"
  }
}
```

## Configuration Docker

### docker-compose.yml Complet

```
version: '3.8'

services:
  nextjs-app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_ENV: ${NODE_ENV:-production}
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
    volumes:
      - uploads_data:/app/uploads
      - ./logs:/app/logs
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - courrier-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/my.cnf:/etc/mysql/conf.d/custom.cnf
      - ./mysql/init:/docker-entrypoint-initdb.d
    networks:
      - courrier-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 300 --cleanup
    restart: unless-stopped
    networks:
      - courrier-network

volumes:
  mysql_data:
  uploads_data:

networks:
  courrier-network:
    driver: bridge
```

## Configuration Avancée

### Rate Limiting

```
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

### Configuration des Logs

```
// lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ] : [])
  ]
})
```

## Variables par Environnement

### Développement (.env.local)

```
NODE_ENV=development
DATABASE_URL="mysql://root:password@localhost:3306/courrier_dev"
NEXTAUTH_URL=http://localhost:3000
LOG_LEVEL=debug
ENABLE_SWAGGER=true
```

### Test (.env.test)

```
NODE_ENV=test
DATABASE_URL="mysql://root:password@localhost:3306/courrier_test"
NEXTAUTH_URL=http://localhost:3000
LOG_LEVEL=error
```

### Production (.env.production)

```
NODE_ENV=production
DATABASE_URL="mysql://user:password@db-host:3306/courrier_prod"
NEXTAUTH_URL=https://votre-domaine.com
LOG_LEVEL=warn
ENABLE_SWAGGER=false
```
