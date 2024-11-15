import axios from 'axios';
import { faker } from '@faker-js/faker';

const API_URL = 'http://localhost:3100/api/customers'; // Remplacez <votre-domaine> par le domaine de votre API

// Fonction pour générer des données de clients aléatoires
function generateRandomClient(index) {
    return {
        infos: {
            name: faker.company.name(),
            notes: faker.lorem.sentence()
        },
        addresses: [
            {
                type: 'main',
                address_line1: faker.address.streetAddress(),
                address_line2: faker.address.secondaryAddress(),
                city: faker.address.city(),
                state: faker.address.state(),
                zip_code: faker.address.zipCode(),
                country: faker.address.country()
            },
            {
                type: 'secondary',
                address_line1: faker.address.streetAddress(),
                city: faker.address.city(),
                state: faker.address.state(),
                zip_code: faker.address.zipCode(),
                country: faker.address.country()
            }
        ],
        contacts: [
            {
                name: faker.name.fullName(),
                phone_number: faker.phone.number(),
                email: faker.internet.email(),
                direct_phone: faker.phone.number()
            }
        ],
        communicationMethods: [
            {
                method_type: 'Email',
                details: faker.internet.email()
            }
        ]
    };
}

// Fonction pour créer un client
async function createClient(clientData) {
    try {
        const response = await axios.post(API_URL, clientData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(`Client créé avec succès: ${response.data.message}`);
    } catch (error) {
        console.error('Erreur lors de la création du client:', error.response ? error.response.data : error.message);
    }
}

// Fonction principale pour créer plusieurs clients
async function createMultipleClients(count) {
    for (let i = 1; i <= count; i++) {
        const clientData = generateRandomClient(i);
        await createClient(clientData);
    }
}

// Créer 400 clients
createMultipleClients(40000);