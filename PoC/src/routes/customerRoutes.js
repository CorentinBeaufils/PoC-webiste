import express from 'express';
const router = express.Router();
import db from '../db.js'; // Assurez-vous que le chemin est correct
import { verifierSession, verifierAdmin } from '../middleware/authMiddleware.js'; // Chemin correct vers les middlewares


router.post('/api/customers', async (req, res) => {
    const { infos, addresses, contacts, communicationMethods } = req.body;
    console.log('Reception de requete /api/customers');
    console.log(infos);
    console.log(addresses);
    // Obtenir une connexion unique depuis le pool
    const conn = await db.getConnection();
    console.log('Passage du getConnection');

    try {
        await conn.beginTransaction();
        console.log("Début de la transaction");
        // 1. Insérer le client sans `main_address_id` pour l'instant
        const [customerResult] = await conn.query(
            'INSERT INTO customers (name, notes) VALUES (?, ?)',
            [infos[0].name, infos[0].notes]
        );
        const customerId = customerResult.insertId;
        console.log("Client inséré avec succès, ID :", customerId);



        let mainAddressId = null;

        // 2. Insérer les adresses et obtenir l'ID de l'adresse principale
        for (const address of addresses) {
            const [addressResult] = await conn.query(
                'INSERT INTO addresses (customer_id, type, address_line1, address_line2, city, state, zip_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    customerId,
                    address.type,
                    address.address_line1,
                    address.address_line2,
                    address.city,
                    address.state,
                    address.zip_code,
                    address.country,
                ]
            );

            if (address.type === 'main') {
                mainAddressId = addressResult.insertId;
            }
            console.log("Adresse insérée :", address);
        }

        // 3. Mettre à jour `main_address_id` dans la table `customers`
        if (mainAddressId) {
            await conn.query(
                'UPDATE customers SET main_address_id = ? WHERE id = ?',
                [mainAddressId, customerId]
            );
            console.log("main_address_id mis à jour pour le client :", mainAddressId);
        }

        // 4. Insertion des contacts
        for (const contact of contacts) {
            await conn.query(
                'INSERT INTO contacts (customer_id, name, phone_number, email, direct_phone) VALUES (?, ?, ?, ?, ?)',
                [
                    customerId,
                    contact.name,
                    contact.phone_number,
                    contact.email,
                    contact.direct_phone,
                ]
            );
            console.log("Contact inséré :", contact);
        }

        // 5. Insertion des moyens de communication
        for (const method of communicationMethods) {
            await conn.query(
                'INSERT INTO communication_methods (customer_id, method_type, details) VALUES (?, ?, ?)',
                [
                    customerId,
                    method.method_type,
                    method.details,
                ]
            );
            console.log("Moyen de communication inséré :", method);
        }

        // Valider la transaction
        await conn.commit();
        console.log("Transaction confirmée");
        res.status(201).json({ message: 'Client et ses informations créés avec succès.' });

    } catch (error) {
        console.error('Erreur lors de la création du client et de ses informations:', error);
        await conn.rollback();  // Annuler la transaction en cas d'erreur
        res.status(500).json({ message: 'Erreur lors de la création du client et de ses informations.' });
    } finally {
        conn.release();  // Libérer la connexion pour le pool
    }
});

//-------------------------------------------------------------------------------------------------
//route pour afficher les clients


// Route pour obtenir la liste de tous les clients
router.get('/api/customers', async (req, res) => {
    try {
        // Récupérer la liste de tous les clients
        const [customers] = await db.query('SELECT id, name, notes FROM customers');

        if (customers.length === 0) {
            return res.status(404).json({ message: 'Aucun client trouvé.' });
        }

        res.json(customers);
    } catch (error) {
        console.error('Erreur lors de la récupération de la liste des clients:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la liste des clients.' });
    }
});



// Route pour obtenir les détails d'un client spécifique
router.get('/api/customers/:id', async (req, res) => {
    const customerId = req.params.id;

    try {
        const [customerResults] = await db.query('SELECT * FROM customers WHERE id = ?', [customerId]);
        if (customerResults.length === 0) {
            return res.status(404).json({ message: 'Client non trouvé.' });
        }

        const customer = customerResults[0];

        // Récupérer les adresses, contacts et moyens de communication liés au client
        const [addresses] = await db.query('SELECT * FROM addresses WHERE customer_id = ?', [customerId]);
        const [contacts] = await db.query('SELECT * FROM contacts WHERE customer_id = ?', [customerId]);
        const [communicationMethods] = await db.query('SELECT * FROM communication_methods WHERE customer_id = ?', [customerId]);

        // Ajouter les détails à l'objet client
        customer.addresses = addresses;
        customer.contacts = contacts;
        customer.communicationMethods = communicationMethods;

        res.json(customer);
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du client:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des détails du client.' });
    }
});


export default router;

