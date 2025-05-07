// server.js - Point d'entrée de notre application
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mqtt = require('mqtt');
const fs = require('fs');

// Initialisation de l'application Express
const app = express();
const port = 3000;

// Configuration des middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration du client MQTT (à adapter selon votre broker MQTT)
// Pour l'instant, nous le commentons car nous n'avons pas de broker MQTT
// const mqttClient = mqtt.connect('mqtt://localhost:1883');
console.log('MQTT: Mode simulation (pas de connexion réelle)');

// Stockage des appareils dans un fichier JSON
const DEVICES_FILE = path.join(__dirname, 'devices.json');

// Fonction pour lire les appareils depuis le fichier
function readDevices() {
    try {
        // Vérifier si le fichier existe
        if (fs.existsSync(DEVICES_FILE)) {
            const data = fs.readFileSync(DEVICES_FILE, 'utf8');
            return JSON.parse(data);
        } else {
            // Créer un fichier avec des appareils par défaut
            const defaultDevices = [
                { id: 1, name: 'Lampe Salon', type: 'light', status: 'off' },
                { id: 2, name: 'Thermostat', type: 'climate', status: 'on', temperature: 21 }
            ];
            writeDevices(defaultDevices);
            return defaultDevices;
        }
    } catch (error) {
        console.error('Erreur lors de la lecture des appareils:', error);
        return [];
    }
}

// Fonction pour écrire les appareils dans le fichier
function writeDevices(devices) {
    try {
        fs.writeFileSync(DEVICES_FILE, JSON.stringify(devices, null, 2), 'utf8');
    } catch (error) {
        console.error('Erreur lors de l\'écriture des appareils:', error);
    }
}

// Routes API
app.get('/api/devices', (req, res) => {
    const devices = readDevices();
    res.json(devices);
});

app.post('/api/devices', (req, res) => {
    const { name, type } = req.body;
    
    if (!name || !type) {
        return res.status(400).json({ 
            success: false, 
            message: 'Le nom et le type de l\'appareil sont requis' 
        });
    }
    
    const devices = readDevices();
    
    // Générer un nouvel ID (en prenant le plus grand existant + 1)
    const newId = devices.length > 0 
        ? Math.max(...devices.map(d => d.id)) + 1 
        : 1;
    
    // Créer le nouvel appareil
    const newDevice = { 
        id: newId, 
        name, 
        type, 
        status: 'off'
    };
    
    // Ajouter la propriété température pour les thermostats
    if (type === 'climate') {
        newDevice.temperature = 20;
    }
    
    // Ajouter à la liste et enregistrer
    devices.push(newDevice);
    writeDevices(devices);
    
    res.json({ 
        success: true, 
        message: 'Appareil ajouté avec succès', 
        device: newDevice 
    });
});

app.post('/api/devices/:id/control', (req, res) => {
    const deviceId = parseInt(req.params.id);
    const command = req.body.command;
    
    console.log(`Commande reçue pour l'appareil ${deviceId}: ${command}`);
    
    // Lire les appareils
    const devices = readDevices();
    
    // Trouver l'appareil
    const deviceIndex = devices.findIndex(d => d.id === deviceId);
    
    if (deviceIndex === -1) {
        return res.status(404).json({ 
            success: false, 
            message: 'Appareil non trouvé' 
        });
    }
    
    const device = devices[deviceIndex];
    
    // Simuler la mise à jour de l'appareil
    if (device.type === 'light') {
        if (command === 'on' || command === 'off') {
            device.status = command;
        }
    } else if (device.type === 'climate') {
        if (command === 'up' && device.temperature !== undefined) {
            device.temperature += 1;
        } else if (command === 'down' && device.temperature !== undefined) {
            device.temperature -= 1;
        }
    }
    
    // Sauvegarder les modifications
    writeDevices(devices);
    
    res.json({ 
        success: true, 
        message: `Commande ${command} envoyée à l'appareil ${deviceId}`,
        device: device
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});