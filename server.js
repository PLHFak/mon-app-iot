// server.js - Point d'entrée de notre application
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mqtt = require('mqtt');

// Initialisation de l'application Express
const app = express();
const port = 3000;

// Configuration des middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration du client MQTT (à adapter selon votre broker MQTT)
const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
  console.log('Connecté au broker MQTT');
  
  // S'abonner aux topics des appareils
  mqttClient.subscribe('iot/devices/+/status', (err) => {
    if (!err) {
      console.log('Abonnement aux statuts des appareils réussi');
    }
  });
});

mqttClient.on('message', (topic, message) => {
  console.log(`Message reçu sur ${topic}: ${message.toString()}`);
  // Ici nous traiterons les messages des appareils
});

// Routes API
app.get('/api/devices', (req, res) => {
  // Pour l'instant, retournons une liste d'appareils fictifs
  const devices = [
    { id: 1, name: 'Lampe Salon', type: 'light', status: 'off' },
    { id: 2, name: 'Thermostat', type: 'climate', status: 'on', temperature: 21 }
  ];
  res.json(devices);
});

app.post('/api/devices/:id/control', (req, res) => {
  const deviceId = req.params.id;
  const command = req.body.command;
  
  console.log(`Commande reçue pour l'appareil ${deviceId}: ${command}`);
  
  // Publier la commande sur MQTT
  mqttClient.publish(`iot/devices/${deviceId}/commands`, JSON.stringify({
    command: command,
    timestamp: new Date().toISOString()
  }));
  
  res.json({ success: true, message: `Commande ${command} envoyée à l'appareil ${deviceId}` });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});