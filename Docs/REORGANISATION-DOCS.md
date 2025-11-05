# 📚 Plan de Réorganisation de la Documentation BlaBlaBook V2

**Date:** 2025-10-21
**Objectif:** Harmoniser et consolider toute la documentation éparpillée dans le projet

---

## 🔍 État Actuel

### Localisation des dossiers de documentation

```
blablabookV2/
├── Docs/                          # ✅ PRINCIPAL - À conserver
│   ├── cdc/                      # Cahier des charges
│   ├── Diagrammes/               # Diagrammes (Activity, Sequence, UseCase)
│   ├── Architecture/             # Architecture services
│   ├── database/                 # Documentation BDD
│   ├── deployment/               # Déploiement
│   ├── ERD/                      # Entity Relationship Diagrams
│   ├── maquettes/                # Maquettes UI
│   ├── Merise/                   # Modèles Merise (MCD, MLD, MPD)
│   ├── RGPD/                     # Documentation RGPD
│   └── *.adoc (11 fichiers)     # ⚠️ Fichiers à la racine à organiser
│
├── backend/Docs/                  # ⚠️ À intégrer dans /Docs/backend/
│   ├── author-search-flow.adoc
│   └── genre-search-flow.adoc
│
└── frontend/docs/                 # ⚠️ À intégrer dans /Docs/frontend/
    ├── frontend-architecture.adoc
    ├── frontend-security-checklist.adoc
    ├── react-architecture-complete.adoc
    ├── react-explique-simplement.adoc
    └── react-routerV7.adoc
```

---

## 🔴 Doublons Identifiés

### Fichiers identiques (à supprimer)

| Fichier Original | Doublon | Action |
|-----------------|---------|--------|
| `/Docs/architecture.md` | `/Docs/Diagrammes/architecture.md` | **SUPPRIMER le doublon dans Diagrammes/** |

### Fichiers similaires mais différents (à fusionner ou clarifier)

| Fichier 1 | Fichier 2 | Différence | Recommandation |
|-----------|-----------|------------|----------------|
| `/Docs/dictionnaire-donnees-bbbv2.adoc` (25K) | `/Docs/Diagrammes/dictionnaire-donnees.md` (taille inconnue) | Format + contenu différent | Garder `.adoc` (plus complet), supprimer `.md` |
| `/Docs/architecture-fichiers-principaux.adoc` | `/Docs/cdc/technical-architecture.adoc` | Différent mais overlap possible | Vérifier contenu, fusionner si nécessaire |

---

## ✅ Structure Recommandée

```
Docs/
├── README.adoc                           # 📖 INDEX PRINCIPAL - Navigation hub
│
├── cdc/                                  # ✅ Cahier des Charges (CONSERVER)
│   ├── api-specifications.adoc
│   ├── business-requirements.adoc
│   ├── risk-analysis.adoc
│   ├── technical-architecture.adoc
│   └── test-strategy.adoc
│
├── architecture/                         # 🏗️ Architecture (RENOMMER depuis Architecture/)
│   ├── overview.adoc                    # CRÉER (fusion architecture.md + fichiers-principaux)
│   ├── service-images.adoc              # DÉPLACER depuis Architecture/
│   ├── security-architecture.adoc       # DÉPLACER depuis racine
│   └── docker-explications.adoc         # DÉPLACER depuis racine
│
├── backend/                              # 🔧 NOUVEAU DOSSIER
│   ├── author-search-flow.adoc          # DÉPLACER depuis backend/Docs/
│   └── genre-search-flow.adoc           # DÉPLACER depuis backend/Docs/
│
├── frontend/                             # 🎨 NOUVEAU DOSSIER
│   ├── frontend-architecture.adoc       # DÉPLACER depuis frontend/docs/
│   ├── frontend-security-checklist.adoc # DÉPLACER depuis frontend/docs/
│   ├── react-architecture-complete.adoc # DÉPLACER depuis frontend/docs/
│   ├── react-explique-simplement.adoc   # DÉPLACER depuis frontend/docs/
│   └── react-routerV7.adoc              # DÉPLACER depuis frontend/docs/
│
├── design/                               # 🎨 Design & UI (CRÉER)
│   ├── charte-graphique-blablabook.adoc # DÉPLACER depuis racine
│   └── maquettes/                       # DÉPLACER depuis racine
│
├── database/                             # 🗄️ Base de données (CONSERVER)
│   ├── dictionnaire-donnees.adoc        # RENOMMER depuis dictionnaire-donnees-bbbv2.adoc
│   ├── ERD/                             # DÉPLACER depuis racine
│   └── Merise/                          # DÉPLACER depuis racine
│
├── diagrams/                             # 📊 Diagrammes (RENOMMER depuis Diagrammes/)
│   ├── activity/                        # RENOMMER depuis "Diagramme Activité"
│   ├── sequence/
│   └── use-cases/                       # RENOMMER depuis UseCase
│
├── deployment/                           # 🚀 Déploiement (CONSERVER)
│   └── README.adoc
│
├── development/                          # 💻 Développement (CRÉER)
│   ├── coding-conventions.adoc          # DÉPLACER depuis racine
│   ├── configuration-guide.adoc         # DÉPLACER depuis racine
│   └── guide-terminologie-merise.adoc   # DÉPLACER depuis racine
│
├── legal/                                # ⚖️ Juridique (RENOMMER depuis RGPD/)
│   └── rgpd.md
│
└── project/                              # 📋 Gestion projet (CRÉER)
    └── CONCEPTION-BLABLABOOKV2.adoc     # DÉPLACER depuis racine
```

---

## 🗑️ Fichiers à Supprimer

### Doublons confirmés
- [ ] `/Docs/Diagrammes/architecture.md` (doublon exact de `/Docs/architecture.md`)
- [ ] `/Docs/Diagrammes/dictionnaire-donnees.md` (version obsolète, garder `.adoc`)

### Fichiers potentiellement obsolètes (à vérifier)
- [ ] `/Docs/docs-dedupe-report.md` (ancien rapport de déduplication, obsolète après cette réorganisation)

---

## 📝 Actions à Réaliser

### Phase 1: Création de la nouvelle structure
- [ ] Créer `/Docs/README.adoc` (index principal de navigation)
- [ ] Créer dossiers manquants:
  - `/Docs/backend/`
  - `/Docs/frontend/`
  - `/Docs/design/`
  - `/Docs/development/`
  - `/Docs/project/`

### Phase 2: Renommages
- [ ] `Diagrammes/` → `diagrams/`
- [ ] `Architecture/` → `architecture/`
- [ ] `RGPD/` → `legal/`
- [ ] `dictionnaire-donnees-bbbv2.adoc` → `database/dictionnaire-donnees.adoc`

### Phase 3: Déplacements
- [ ] Déplacer backend/Docs/* → Docs/backend/
- [ ] Déplacer frontend/docs/* → Docs/frontend/
- [ ] Déplacer fichiers racine vers sous-dossiers appropriés
- [ ] Déplacer ERD/ et Merise/ vers database/

### Phase 4: Suppression des doublons
- [ ] Supprimer Diagrammes/architecture.md
- [ ] Supprimer Diagrammes/dictionnaire-donnees.md
- [ ] Supprimer docs-dedupe-report.md (ancien rapport)

### Phase 5: Nettoyage final
- [ ] Supprimer dossiers vides (backend/Docs/, frontend/docs/)
- [ ] Mettre à jour tous les liens inter-documents
- [ ] Créer index README.adoc avec navigation complète

---

## 🔗 Navigation Recommandée (README.adoc principal)

```asciidoc
= BlaBlaBook V2 - Documentation Hub
:toc: left
:toclevels: 2

== 📋 Cahier des Charges
* link:cdc/business-requirements.adoc[Spécifications métier]
* link:cdc/technical-architecture.adoc[Architecture technique]
* link:cdc/api-specifications.adoc[API REST]
* link:cdc/test-strategy.adoc[Stratégie de tests]
* link:cdc/risk-analysis.adoc[Analyse des risques & RGPD]

== 🏗️ Architecture
* link:architecture/overview.adoc[Vue d'ensemble]
* link:architecture/security-architecture.adoc[Sécurité]
* link:architecture/docker-explications.adoc[Infrastructure Docker]

== 🔧 Backend
* link:backend/author-search-flow.adoc[Recherche par auteur]
* link:backend/genre-search-flow.adoc[Recherche par genre]

== 🎨 Frontend
* link:frontend/react-architecture-complete.adoc[Architecture React]
* link:frontend/frontend-security-checklist.adoc[Sécurité frontend]

== 🗄️ Base de Données
* link:database/dictionnaire-donnees.adoc[Dictionnaire des données]
* link:database/ERD/ERD-BBBV2.adoc[Diagrammes ERD]
* link:database/Merise/[Modèles Merise (MCD/MLD/MPD)]

== 📊 Diagrammes
* link:diagrams/activity/[Diagrammes d'activité]
* link:diagrams/sequence/diag-sequence.adoc[Diagrammes de séquence]
* link:diagrams/use-cases/use-cases-BBBV2.adoc[Use Cases]

== 💻 Développement
* link:development/coding-conventions.adoc[Conventions de code]
* link:development/configuration-guide.adoc[Guide de configuration]
```

---

## 📊 Statistiques

**État actuel:**
- 3 dossiers de documentation séparés
- ~30 fichiers .adoc
- 2 doublons confirmés
- 11 fichiers à la racine de /Docs/

**Après réorganisation:**
- 1 dossier principal `/Docs/`
- Structure hiérarchique claire (11 sous-dossiers)
- 0 doublons
- Navigation centralisée via README.adoc

---

## ⚠️ Risques et Précautions

1. **Liens cassés**: Vérifier tous les liens inter-documents après déplacement
2. **Git history**: Les déplacements peuvent complexifier le blame/log
3. **Références externes**: Vérifier si des outils CI/CD référencent ces chemins

**Recommandation**: Effectuer la réorganisation en **une seule opération Git** avec un commit explicite :
```bash
git mv backend/Docs Docs/backend
git mv frontend/docs Docs/frontend
# ... etc
git commit -m "docs: reorganize documentation structure - consolidate into /Docs/"
```
