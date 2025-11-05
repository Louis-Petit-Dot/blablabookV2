# Guide de Déploiement VPS Hostinger - BlaBlaBook V2

> 📋 Guide étape par étape pour déployer BlaBlaBook V2 sur votre VPS Hostinger avec **blablabook.online**

## 📚 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration DNS](#1-configuration-dns)
3. [Connexion au VPS](#2-connexion-au-vps)
4. [Installation automatique](#3-installation-automatique)
5. [Configuration du projet](#4-configuration-du-projet)
6. [Configuration Nginx](#5-configuration-nginx)
7. [Obtention du certificat SSL](#6-obtention-du-certificat-ssl)
8. [Démarrage de l'application](#7-démarrage-de-lapplication)
9. [Vérification](#8-vérification)
10. [Maintenance](#9-maintenance)
11. [Dépannage](#10-dépannage)

---

## Prérequis

✅ Vous avez acheté le domaine **blablabook.online**
✅ Vous avez un VPS Hostinger avec Ubuntu
✅ Vous avez les accès SSH (IP, user, mot de passe)
✅ Votre projet est sur GitHub

---

## 1. Configuration DNS

### Sur le panel Hostinger (DNS)

Ajoutez ces enregistrements DNS :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| **A** | `@` | `VOTRE_IP_VPS` | 3600 |
| **A** | `www` | `VOTRE_IP_VPS` | 3600 |

**Comment trouver l'IP du VPS ?**
- Connectez-vous au VPS et tapez : `curl ifconfig.me`
- Ou regardez dans le panel Hostinger

⏰ **Attente** : Les DNS peuvent prendre 5 minutes à 24h pour se propager.

**Vérifier la propagation DNS :**
```bash
# Depuis votre ordinateur local
nslookup blablabook.online
ping blablabook.online
```

---

## 2. Connexion au VPS

### Depuis votre ordinateur (Linux/Mac)

```bash
# Remplacez par vos vraies infos
ssh root@VOTRE_IP_VPS

# Ou si vous avez un user spécifique
ssh votreuser@VOTRE_IP_VPS
```

### Depuis Windows

Utilisez **PuTTY** ou **Windows Terminal** avec SSH.

---

## 3. Installation automatique

### 🚀 Méthode rapide (recommandée)

Une fois connecté au VPS, copiez-collez ces commandes :

```bash
# Créer un dossier pour le projet
mkdir -p /var/www/blablabook
cd /var/www/blablabook

# Cloner votre projet depuis GitHub
git clone https://github.com/VOTRE_USERNAME/blablabookV2.git .

# Rendre le script exécutable
chmod +x scripts/setup-vps.sh

# Lancer l'installation (avec sudo)
sudo bash scripts/setup-vps.sh
```

⏳ **Durée** : 5-10 minutes

Le script installe automatiquement :
- ✅ Docker + Docker Compose
- ✅ Nginx (reverse proxy)
- ✅ Certbot (SSL Let's Encrypt)
- ✅ Firewall UFW
- ✅ Structure de dossiers

---

## 4. Configuration du projet

### 4.1 Créer le fichier `.env.prod`

```bash
cd /var/www/blablabook
cp .env.prod.example .env.prod
nano .env.prod
```

### 4.2 Remplir les variables de production

**Éditez `.env.prod` avec vos vraies valeurs :**

```bash
# Base de données
POSTGRES_DB=blablabook
POSTGRES_USER=blabla
POSTGRES_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE_ICI  # Changez-moi !

DATABASE_URL=postgres://blabla:VOTRE_MOT_DE_PASSE@postgres:5432/blablabook

# API
API_PORT=3000
NODE_ENV=production

# JWT Secret (IMPORTANT : utilisez un secret fort !)
# Générer un secret : openssl rand -base64 64
JWT_SECRET=VOTRE_SECRET_JWT_TRES_LONG_ET_ALEATOIRE_ICI

# CORS
ALLOWED_ORIGINS=https://blablabook.online

# Cloudinary (si vous utilisez)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

**💡 Générer un JWT_SECRET fort :**
```bash
openssl rand -base64 64
```

**Sauvegarder** : `Ctrl+O` puis `Enter`, puis `Ctrl+X`

### 4.3 Créer `.env.database`

```bash
cp .env.database .env.database.prod
nano .env.database.prod
```

Remplir :
```bash
POSTGRES_DB=blablabook
POSTGRES_USER=blabla
POSTGRES_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE_ICI
```

---

## 5. Configuration Nginx

### 5.1 Copier la configuration

```bash
cd /var/www/blablabook
sudo cp scripts/nginx-blablabook.conf /etc/nginx/sites-available/blablabook
```

### 5.2 Activer le site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/blablabook /etc/nginx/sites-enabled/

# Supprimer la config par défaut si elle existe encore
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true

# Tester la configuration
sudo nginx -t
```

✅ Vous devez voir : `syntax is ok` et `test is successful`

### 5.3 Recharger Nginx

```bash
sudo systemctl reload nginx
```

---

## 6. Obtention du certificat SSL

### 🔒 Let's Encrypt avec Certbot

```bash
sudo certbot --nginx -d blablabook.online -d www.blablabook.online
```

**Questions interactives :**

1. **Email** : Entrez votre email (pour alertes de renouvellement)
2. **Terms of Service** : Tapez `Y` (oui)
3. **Share email** : Tapez `N` (non)
4. **Redirect HTTP to HTTPS** : Tapez `2` (redirection automatique)

✅ **Succès** : Vous verrez "Congratulations!"

Le certificat est valide **90 jours** et se renouvelle **automatiquement**.

---

## 7. Démarrage de l'application

### 7.1 Construire les images Docker

```bash
cd /var/www/blablabook
docker compose -f docker-compose.vps.yml build
```

⏳ **Durée** : 5-10 minutes (première fois)

### 7.2 Démarrer les containers

```bash
docker compose -f docker-compose.vps.yml up -d
```

**Options** :
- `-d` : Mode détaché (en arrière-plan)

### 7.3 Voir les logs

```bash
# Tous les services
docker compose -f docker-compose.vps.yml logs -f

# Backend seulement
docker compose -f docker-compose.vps.yml logs -f backend

# Frontend seulement
docker compose -f docker-compose.vps.yml logs -f frontend
```

**Sortir des logs** : `Ctrl+C`

---

## 8. Vérification

### ✅ Checklist de vérification

**8.1 Containers en cours d'exécution**

```bash
docker ps
```

Vous devez voir 4 containers :
- `blablabook-frontend` (port 5173)
- `blablabook-backend` (port 3000)
- `blablabook-db` (PostgreSQL)
- `blablabook-adminer` (port 8081)

**8.2 Health checks**

```bash
# Backend health
curl http://localhost:3000/health
# → {"status":"healthy","service":"blablabookv2-api"}

# Frontend
curl http://localhost:5173
# → HTML de votre application
```

**8.3 Tester le site web**

Ouvrez dans votre navigateur :
- 🌐 **https://blablabook.online** → Doit charger votre SPA React
- 🔒 **Certificat SSL** → Doit être vert (cadenas)
- 🚀 **API** → https://blablabook.online/api/health

**8.4 Vérifier les logs**

```bash
# Backend
docker compose -f docker-compose.vps.yml logs backend | tail -50

# Frontend
docker compose -f docker-compose.vps.yml logs frontend | tail -50

# PostgreSQL
docker compose -f docker-compose.vps.yml logs postgres | tail -50
```

---

## 9. Maintenance

### 🔄 Déployer une mise à jour

```bash
cd /var/www/blablabook

# 1. Pull les derniers changements
git pull origin main

# 2. Rebuild les images (si code modifié)
docker compose -f docker-compose.vps.yml build

# 3. Redémarrer les containers
docker compose -f docker-compose.vps.yml up -d

# 4. Vérifier les logs
docker compose -f docker-compose.vps.yml logs -f
```

### 🛑 Arrêter l'application

```bash
docker compose -f docker-compose.vps.yml down
```

**Attention** : Les données PostgreSQL sont préservées (volume persistant).

### 🔄 Redémarrer l'application

```bash
docker compose -f docker-compose.vps.yml up -d
```

### 🗑️ Supprimer TOUT (y compris les données)

```bash
# ⚠️ DANGER : Supprime les données DB !
docker compose -f docker-compose.vps.yml down -v

# Supprimer les images aussi
docker system prune -a
```

### 📊 Voir l'utilisation des ressources

```bash
# Utilisation CPU/RAM des containers
docker stats

# Espace disque Docker
docker system df

# Logs Nginx
sudo tail -f /var/log/nginx/blablabook-access.log
sudo tail -f /var/log/nginx/blablabook-error.log
```

---

## 10. Dépannage

### ❌ Problème : Site inaccessible

**Vérifier DNS :**
```bash
nslookup blablabook.online
```

**Vérifier Nginx :**
```bash
sudo systemctl status nginx
sudo nginx -t
```

**Vérifier Firewall :**
```bash
sudo ufw status
# Doit autoriser 80, 443, 22
```

**Vérifier containers :**
```bash
docker ps -a
# Tous les containers doivent être "Up"
```

---

### ❌ Problème : Certificat SSL non obtenu

**Vérifier que DNS pointe bien vers VPS :**
```bash
nslookup blablabook.online
# Doit afficher l'IP de votre VPS
```

**Réessayer Certbot :**
```bash
sudo certbot --nginx -d blablabook.online -d www.blablabook.online --dry-run
```

---

### ❌ Problème : API ne répond pas (CORS errors)

**Vérifier ALLOWED_ORIGINS dans `.env.prod` :**
```bash
cat .env.prod | grep ALLOWED_ORIGINS
# Doit contenir : https://blablabook.online
```

**Redémarrer backend :**
```bash
docker compose -f docker-compose.vps.yml restart backend
docker compose -f docker-compose.vps.yml logs -f backend
```

---

### ❌ Problème : Base de données ne démarre pas

**Voir les logs PostgreSQL :**
```bash
docker compose -f docker-compose.vps.yml logs postgres
```

**Erreur commune : mot de passe incorrect**

Supprimer le volume et recréer :
```bash
docker compose -f docker-compose.vps.yml down -v
docker volume rm blablabook_postgres_data
docker compose -f docker-compose.vps.yml up -d
```

---

### ❌ Problème : Mémoire insuffisante

**Vérifier l'utilisation :**
```bash
free -h
docker stats
```

**Si nécessaire, augmenter la RAM de votre VPS Hostinger.**

---

## 📞 Support

### Commandes utiles

```bash
# Redémarrer Docker
sudo systemctl restart docker

# Redémarrer Nginx
sudo systemctl restart nginx

# Voir tous les containers (même arrêtés)
docker ps -a

# Supprimer containers arrêtés
docker container prune

# Voir les logs système
sudo journalctl -xe

# Espace disque
df -h

# Processus en cours
htop
```

### Ressources

- 📖 [Documentation Docker](https://docs.docker.com/)
- 📖 [Documentation Nginx](https://nginx.org/en/docs/)
- 📖 [Certbot](https://certbot.eff.org/)
- 📖 [Hostinger Help](https://www.hostinger.com/tutorials/vps)

---

## ✅ Checklist finale

Avant de partir :

- [ ] DNS configuré et propagé
- [ ] VPS accessible via SSH
- [ ] Docker + Nginx + Certbot installés
- [ ] Certificat SSL obtenu (HTTPS ✅)
- [ ] `.env.prod` configuré avec secrets forts
- [ ] Application démarrée (docker compose up -d)
- [ ] Site accessible : https://blablabook.online
- [ ] API fonctionne : https://blablabook.online/api/health
- [ ] Firewall actif (ports 22, 80, 443)
- [ ] Logs propres (pas d'erreurs)

---

## 🎉 Félicitations !

Votre application **BlaBlaBook V2** est en production sur **https://blablabook.online** ! 🚀

**Prochaines étapes recommandées :**
- 📊 Configurer un monitoring (Uptime Robot)
- 🔒 Sauvegardes automatiques PostgreSQL
- 🚀 CI/CD avec GitHub Actions (voir `CI-CD-GUIDE.md`)
- 📈 Analytics (Google Analytics, Plausible)

---

**Créé pour BlaBlaBook V2 | 2025**
