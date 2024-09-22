import fetch from 'node-fetch';
import { faker } from '@faker-js/faker';  // Importer faker

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjb2NvQG1haWwuY29tIiwiaWF0IjoxNzI3MDQ1MTEyLCJleHAiOjE3MjcwNDg3MTJ9.UUM1TCst1Vszw12vE2nyBIydbufvhXT06wwJY4DZexo';  // Ton token JWT

// Fonction pour générer un dossier aléatoire et l'envoyer au serveur
const creerDossier = async (nom, description) => {
    try {
        const response = await fetch('http://localhost:3100/dossiers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nom, description })
        });

        if (response.ok) {
            console.log(`Dossier "${nom}" créé avec succès.`);
        } else {
            console.error(`Erreur lors de la création du dossier "${nom}".`);
        }
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
    }
};

// Fonction pour générer plusieurs milliers de dossiers
const genererDossiers = async (nombre) => {
    for (let i = 0; i < nombre; i++) {
        const nom = faker.company.name();  // Utilisation correcte dans faker v9
        const description = faker.lorem.sentence();

        await creerDossier(nom, description);
    }
};

// Générer 5000 dossiers
genererDossiers(5000);
