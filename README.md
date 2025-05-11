# Mon Application IoT

Application de surveillance d'objets connectés personnalisée.

## Projets inclus

### Moniteur de Pilulier

Application qui surveille l'état d'un pilulier via un capteur eWeLink et affiche l'historique des événements d'ouverture/fermeture dans une interface web.

#### Fonctionnalités

- Détection de l'ouverture et fermeture du pilulier
- Enregistrement de l'historique des événements
- Interface web simple pour visualiser l'état actuel et l'historique
- Configuration automatique au démarrage du système

#### Technologies utilisées

- Python avec Flask pour le backend
- SQLite pour le stockage des données
- eWeLink pour le capteur de porte
- IFTTT pour l'automatisation des événements
- AWS Lightsail pour l'hébergement

## Installation et utilisation

Voir les instructions spécifiques dans chaque dossier de projet.
# Moniteur de Pilulier

Application Flask qui surveille l'état d'un pilulier via un capteur eWeLink.

## Prérequis

- Python 3.12+
- Capteur de porte eWeLink
- Compte IFTTT
- Serveur (AWS Lightsail ou autre)

## Installation

1. Cloner ce dépôt
2. Installer les dépendances: `pip install -r requirements.txt`
3. Lancer l'application: `./run.sh` ou `python app.py`

## Configuration IFTTT

1. Créez un applet IFTTT:
   - Trigger: eWeLink Door Sensor > Door Opened/Closed
   - Action: Webhook
   - URL: `http://VOTRE_IP:8000/webhook/pillbox`
   - Method: POST
   - Content Type: application/json
   - Body: `{"value": "opened"}` ou `{"value": "closed"}`

## Démarrage automatique

Pour configurer le démarrage automatique au redémarrage du serveur:

```bash
sudo crontab -e

@reboot cd /home/ubuntu/pillbox-app && source /home/ubuntu/pillbox-app/venv/bin/activate && nohup python3 app.py > /home/ubuntu/pillbox-app/output.log 2>&1 &
