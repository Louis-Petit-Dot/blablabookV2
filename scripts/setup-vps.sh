#!/bin/bash
###############################################################################
# Script d'installation VPS pour BlaBlaBook V2
# Pour Ubuntu 20.04/22.04/24.04
#
# Ce script installe automatiquement :
# - Docker + Docker Compose
# - Nginx (reverse proxy)
# - Certbot (SSL Let's Encrypt)
# - Firewall UFW
# - Configuration initiale
#
# Usage: bash setup-vps.sh
###############################################################################

set -e  # Arrête le script en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
print_step() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Vérification que le script est exécuté en root
if [[ $EUID -ne 0 ]]; then
   print_error "Ce script doit être exécuté en tant que root (sudo)"
   exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         BlaBlaBook V2 - Installation VPS                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 1. Mise à jour du système
print_step "Mise à jour du système Ubuntu..."
apt update
apt upgrade -y
print_success "Système mis à jour"
echo ""

# 2. Installation des dépendances de base
print_step "Installation des outils de base..."
apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release
print_success "Outils de base installés"
echo ""

# 3. Installation Docker
print_step "Installation de Docker..."

# Supprime les anciennes versions
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Ajoute la clé GPG officielle Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Ajoute le repository Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installe Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Démarre et active Docker
systemctl start docker
systemctl enable docker

print_success "Docker installé avec succès"
docker --version
echo ""

# 4. Configuration utilisateur Docker (optionnel si pas root)
if [ -n "$SUDO_USER" ]; then
    print_step "Ajout de l'utilisateur $SUDO_USER au groupe docker..."
    usermod -aG docker $SUDO_USER
    print_info "Déconnectez-vous et reconnectez-vous pour appliquer les changements"
fi
echo ""

# 5. Installation Nginx
print_step "Installation de Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx installé et démarré"
nginx -v
echo ""

# 6. Installation Certbot (Let's Encrypt)
print_step "Installation de Certbot pour SSL..."
apt install -y certbot python3-certbot-nginx
print_success "Certbot installé"
certbot --version
echo ""

# 7. Configuration Firewall UFW
print_step "Configuration du firewall UFW..."

# Active UFW si pas déjà fait
if ! ufw status | grep -q "Status: active"; then
    print_info "Activation du firewall..."

    # Autorise SSH d'abord (IMPORTANT !)
    ufw allow 22/tcp comment 'SSH'

    # Autorise HTTP et HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'

    # Active le firewall
    ufw --force enable
    print_success "Firewall activé"
else
    print_info "Firewall déjà actif, ajout des règles..."
    ufw allow 22/tcp comment 'SSH' 2>/dev/null || true
    ufw allow 80/tcp comment 'HTTP' 2>/dev/null || true
    ufw allow 443/tcp comment 'HTTPS' 2>/dev/null || true
    print_success "Règles firewall ajoutées"
fi

echo ""
ufw status numbered
echo ""

# 8. Création de la structure de dossiers
print_step "Création de la structure de dossiers..."
mkdir -p /var/www/blablabook
mkdir -p /var/www/blablabook/logs
chown -R www-data:www-data /var/www/blablabook
print_success "Dossiers créés dans /var/www/blablabook"
echo ""

# 9. Configuration Nginx de base
print_step "Configuration Nginx de base..."

# Sauvegarde la config par défaut
if [ -f /etc/nginx/sites-enabled/default ]; then
    mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup
    print_info "Configuration par défaut sauvegardée"
fi

print_success "Nginx prêt pour configuration"
echo ""

# 10. Test de la configuration
print_step "Vérification de l'installation..."

echo ""
print_info "Versions installées :"
echo "  • Docker: $(docker --version | awk '{print $3}')"
echo "  • Docker Compose: $(docker compose version | awk '{print $4}')"
echo "  • Nginx: $(nginx -v 2>&1 | awk '{print $3}')"
echo "  • Certbot: $(certbot --version | awk '{print $2}')"
echo ""

# 11. Récapitulatif et prochaines étapes
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✓ Installation terminée !                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_success "Votre VPS est prêt pour BlaBlaBook V2 !"
echo ""
print_info "Prochaines étapes :"
echo ""
echo "  1. Configurez votre DNS :"
echo "     • Type A : blablabook.online → $(curl -s ifconfig.me)"
echo "     • Type A : www.blablabook.online → $(curl -s ifconfig.me)"
echo ""
echo "  2. Clonez votre projet :"
echo "     cd /var/www/blablabook"
echo "     git clone https://github.com/VOTRE_USER/blablabookV2.git ."
echo ""
echo "  3. Configurez les variables d'environnement :"
echo "     cp .env.prod.example .env.prod"
echo "     nano .env.prod"
echo ""
echo "  4. Configurez Nginx (voir fichier nginx-blablabook.conf)"
echo ""
echo "  5. Obtenez le certificat SSL :"
echo "     sudo certbot --nginx -d blablabook.online -d www.blablabook.online"
echo ""
echo "  6. Démarrez l'application :"
echo "     docker compose -f docker-compose.prod.yml up -d"
echo ""
print_info "Documentation complète : Docs/deployment/DEPLOY-GUIDE.md"
echo ""

# Message important
echo -e "${YELLOW}⚠ IMPORTANT :${NC}"
echo "  • Notez l'IP de votre VPS : $(curl -s ifconfig.me)"
echo "  • Si vous utilisez SSH avec clé, configurez-la maintenant"
echo "  • Changez le mot de passe root si ce n'est pas déjà fait"
echo ""

print_success "Installation terminée avec succès !"
echo ""
