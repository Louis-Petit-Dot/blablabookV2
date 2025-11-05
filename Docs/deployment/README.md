# 🚀 Deployment - BlaBlaBook V2

> Guide complet pour déployer BlaBlaBook V2 sur VPS Hostinger avec CI/CD

## 📁 Fichiers de déploiement

### Scripts

| Fichier | Description | Usage |
|---------|-------------|-------|
| `scripts/setup-vps.sh` | Installation automatique VPS | `sudo bash scripts/setup-vps.sh` |
| `scripts/nginx-blablabook.conf` | Configuration Nginx reverse proxy | Copie vers `/etc/nginx/sites-available/` |
| `docker-compose.vps.yml` | Docker Compose optimisé pour VPS | `docker compose -f docker-compose.vps.yml up -d` |

### Documentation

| Fichier | Description |
|---------|-------------|
| `VPS-DEPLOY-GUIDE.md` | **Guide complet étape par étape** |
| `README.md` | Ce fichier (vue d'ensemble) |

### GitHub Actions

| Workflow | Description | Déclencheur |
|----------|-------------|-------------|
| `.github/workflows/ci.yml` | Tests automatiques | Chaque push/PR |

---

## 🎯 Vue d'ensemble du déploiement

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  INTERNET                                                   │
│  https://blablabook.online                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  VPS HOSTINGER (Ubuntu)                                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  NGINX (Reverse Proxy + SSL)                         │  │
│  │  - Port 80/443                                        │  │
│  │  - Let's Encrypt SSL                                 │  │
│  │  - Redirection HTTP → HTTPS                          │  │
│  └────────────┬──────────────────┬──────────────────────┘  │
│               │                  │                          │
│               ▼                  ▼                          │
│  ┌────────────────────┐  ┌───────────────────────┐        │
│  │  FRONTEND          │  │  BACKEND              │        │
│  │  React 19 + Vite   │  │  Deno + Hono          │        │
│  │  Port 5173         │  │  Port 3000            │        │
│  │  (Docker)          │  │  (Docker)             │        │
│  └────────────────────┘  └──────────┬────────────┘        │
│                                     │                       │
│                                     ▼                       │
│                          ┌─────────────────────┐           │
│                          │  POSTGRESQL 17      │           │
│                          │  (Docker)           │           │
│                          └─────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Déploiement rapide (3 étapes)

### 1️⃣ Configuration DNS (5 min)

Dans le panel Hostinger → DNS :

```
Type A : blablabook.online → IP_VPS
Type A : www.blablabook.online → IP_VPS
```

### 2️⃣ Installation VPS (10 min)

```bash
# Connexion SSH
ssh root@VOTRE_IP_VPS

# Clone du projet
mkdir -p /var/www/blablabook
cd /var/www/blablabook
git clone https://github.com/VOTRE_USER/blablabookV2.git .

# Installation automatique
chmod +x scripts/setup-vps.sh
sudo bash scripts/setup-vps.sh
```

### 3️⃣ Configuration & Démarrage (15 min)

```bash
# Configuration environnement
cp .env.prod.example .env.prod
nano .env.prod  # Remplir JWT_SECRET, POSTGRES_PASSWORD, etc.

# Configuration Nginx
sudo cp scripts/nginx-blablabook.conf /etc/nginx/sites-available/blablabook
sudo ln -s /etc/nginx/sites-available/blablabook /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL Let's Encrypt
sudo certbot --nginx -d blablabook.online -d www.blablabook.online

# Démarrage application
docker compose -f docker-compose.vps.yml up -d
```

✅ **C'est tout !** Votre app est en ligne sur **https://blablabook.online**

---

## 📖 Guide détaillé

Pour le guide complet avec explications, dépannage, et maintenance :

👉 **[Lisez VPS-DEPLOY-GUIDE.md](./VPS-DEPLOY-GUIDE.md)**

---

## 🔄 CI/CD - Continuous Integration

### GitHub Actions configuré

✅ À chaque push, le workflow CI :
1. Lance les tests backend (Deno)
2. Vérifie le lint
3. Vérifie le formatage TypeScript
4. Type checking

**Voir le workflow** : `.github/workflows/ci.yml`

**Badge CI dans votre README principal :**
```markdown
![CI](https://github.com/VOTRE_USER/blablabookV2/workflows/CI%20-%20Tests%20&%20Quality/badge.svg)
```

---

## 🛠️ Commandes utiles

### Déployer une mise à jour

```bash
cd /var/www/blablabook
git pull origin main
docker compose -f docker-compose.vps.yml build
docker compose -f docker-compose.vps.yml up -d
```

### Voir les logs

```bash
# Tous les services
docker compose -f docker-compose.vps.yml logs -f

# Backend uniquement
docker compose -f docker-compose.vps.yml logs -f backend

# Nginx
sudo tail -f /var/log/nginx/blablabook-error.log
```

### Redémarrer l'application

```bash
docker compose -f docker-compose.vps.yml restart
```

### Arrêter l'application

```bash
docker compose -f docker-compose.vps.yml down
```

---

## 🔒 Sécurité

### ✅ Mis en place

- **HTTPS** : Let's Encrypt SSL (renouvellement auto)
- **Firewall** : UFW activé (ports 22, 80, 443)
- **Docker** : Réseau isolé
- **PostgreSQL** : Port non exposé publiquement
- **CORS** : Origines restreintes
- **JWT** : Cookies httpOnly
- **Headers** : Nginx security headers

### 🔐 Secrets à configurer

Dans `.env.prod` :
- `JWT_SECRET` : Générer avec `openssl rand -base64 64`
- `POSTGRES_PASSWORD` : Mot de passe fort
- `CLOUDINARY_API_SECRET` : Depuis dashboard Cloudinary

**❌ Ne JAMAIS commit `.env.prod` sur GitHub !**

---

## 📊 Monitoring & Maintenance

### Vérifier l'état

```bash
# Containers en cours
docker ps

# Utilisation ressources
docker stats

# Espace disque
df -h
docker system df

# Logs Nginx
sudo tail -f /var/log/nginx/blablabook-access.log
```

### Sauvegardes PostgreSQL

```bash
# Backup manuel
docker exec blablabook-db pg_dump -U blabla blablabook > backup.sql

# Restore
docker exec -i blablabook-db psql -U blabla blablabook < backup.sql
```

---

## ❓ Dépannage

### Site inaccessible

1. Vérifier DNS : `nslookup blablabook.online`
2. Vérifier Nginx : `sudo systemctl status nginx`
3. Vérifier containers : `docker ps`
4. Vérifier firewall : `sudo ufw status`

### Erreurs CORS

1. Vérifier `.env.prod` : `ALLOWED_ORIGINS=https://blablabook.online`
2. Redémarrer backend : `docker compose -f docker-compose.vps.yml restart backend`

### Plus de détails

👉 **Section "Dépannage" dans [VPS-DEPLOY-GUIDE.md](./VPS-DEPLOY-GUIDE.md#10-dépannage)**

---

## 🎓 Pour la présentation

### Ce que vous pouvez dire au jury

> "J'ai mis en place un **CI/CD complet** pour mon projet :
>
> **Continuous Integration (CI)** :
> - Tests automatiques à chaque commit via GitHub Actions
> - Vérification lint, formatage, type checking
> - Garantit la qualité du code
>
> **Déploiement Production** :
> - Application conteneurisée avec Docker
> - Reverse proxy Nginx pour performances
> - SSL Let's Encrypt automatique
> - Base PostgreSQL 17 en production
> - Déployé sur VPS Hostinger avec domaine **blablabook.online**
>
> J'ai privilégié un **déploiement manuel contrôlé** plutôt qu'automatique pour garder le contrôle en phase MVP, ce qui est une approche appropriée pour un projet étudiant.
>
> Pour un projet à plus grande échelle, j'ajouterais :
> - Un environnement de staging
> - Deploy automatique avec validation
> - Monitoring (Prometheus/Grafana)
> - Backups automatiques PostgreSQL"

### Démonstration

1. **Montrer le workflow CI** : `.github/workflows/ci.yml`
2. **Montrer les tests qui passent** : Onglet "Actions" sur GitHub
3. **Montrer le site en ligne** : https://blablabook.online
4. **Montrer HTTPS (certificat vert)**
5. **Expliquer l'architecture** : Nginx → Docker → PostgreSQL

---

## 📚 Ressources

- [VPS-DEPLOY-GUIDE.md](./VPS-DEPLOY-GUIDE.md) - Guide complet étape par étape
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## ✅ Checklist de production

- [ ] DNS configuré et propagé
- [ ] SSL Let's Encrypt actif (HTTPS ✅)
- [ ] `.env.prod` avec secrets forts
- [ ] Firewall UFW activé
- [ ] Containers démarrés
- [ ] Site accessible : https://blablabook.online
- [ ] API fonctionne : https://blablabook.online/api/health
- [ ] CI GitHub Actions actif
- [ ] Logs propres (pas d'erreurs)
- [ ] Backups PostgreSQL configurés

---

**BlaBlaBook V2 - Déployé avec ❤️**
