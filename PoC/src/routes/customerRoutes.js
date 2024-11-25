import express from 'express';
const router = express.Router();
import db from '../db.js'; // Assurez-vous que le chemin est correct
import { verifierSession, verifierAdmin } from '../middleware/authMiddleware.js'; // Chemin correct vers les middlewares


router.post('/api/customers',verifierSession, async (req, res) => {
    const { name, keyword} = req.body;
    console.log('Requête de création reçue pour un nouveau client');
    console.log('Données du nouveau client:', req.body);
    console.log('Utilisateur connecté:', req.session.user);

    // Obtenir une connexion unique depuis le pool
    const conn = await db.getConnection();
    console.log('Passage du getConnection');

    try {
        await conn.beginTransaction();
        console.log("Début de la transaction");

        // Insérer le client avec les dates de création et de dernière modification
        const [customerResult] = await conn.query(
            'INSERT INTO companies (company_name, keyword, created_by, creation_date, modification_date) VALUES (?, ?, ?, NOW(), NOW())',
            [name, keyword, req.session.user.nom]
        );
        const customerId = customerResult.insertId;
        console.log("Client inséré avec succès, ID :", customerId);

        // Valider la transaction
        await conn.commit();
        console.log("Transaction confirmée");
        res.status(201).json({ message: 'Client créé avec succès.', customerId: customerId });

    } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        await conn.rollback();  // Annuler la transaction en cas d'erreur
        res.status(500).json({ message: 'Erreur lors de la création du client.' });
    } finally {
        conn.release();  // Libérer la connexion pour le pool
    }
});

//-------------------------------------------------------------------------------------------------
//route pour afficher les clients


// Route pour obtenir la liste de tous les clients avec pagination
router.get('/api/customers', async (req, res) => {
    const { filterType,company_name, page = 1, limit = 50 } = req.query;
    console.log(req.query);

    try {
        const connection = await db.getConnection();

        let query = 'SELECT c.* FROM companies c';
        const queryParams = [];

        if (filterType === 'name') {
            query += ' WHERE c.company_name LIKE ?';
            queryParams.push(`%${company_name}%`);
        } else if (filterType === 'keyword') {
            query += ' WHERE c.keyword LIKE ?';
            queryParams.push(`%${company_name}%`);
        } else if (filterType === 'contact') {
            query += `
                JOIN company_contacts ct ON c.id = ct.company_id
                WHERE ct.name LIKE ?
            `;
            queryParams.push(`%${company_name}%`);
        }
        queryParams.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const [customers] = await connection.query(query, queryParams);

        connection.release();
        res.json(customers);
    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des clients.' });
    }
});



// Route pour obtenir les détails d'un client spécifique
router.get('/api/customers/:id', async (req, res) => {
    const customerId = req.params.id;

    try {
        const [customerResults] = await db.query('SELECT * FROM companies WHERE id = ?', [customerId]);
        if (customerResults.length === 0) {
            return res.status(404).json({ message: 'Client non trouvé.' });
        }

        const customer = customerResults[0];

        // Récupérer les adresses, contacts et moyens de communication liés au client
        const [addresses] = await db.query('SELECT * FROM company_addresses WHERE company_id = ?', [customerId]);
        const [contacts] = await db.query('SELECT * FROM company_contacts WHERE company_id = ?', [customerId]);
        const [communicationMethods] = await db.query('SELECT * FROM company_contacts_methods WHERE company_id = ?', [customerId]);

        customer.addresses = addresses;
        customer.contacts = contacts;
        customer.communicationMethods = communicationMethods;

        res.json(customer);
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du client:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des détails du client.' });
    }
});


// Route pour mettre à jour les informations d'un client
router.put('/api/customers/:id', async (req, res) => {
    const customerId = req.params.id;
    const updatedData = req.body;

    console.log(`Requête de mise à jour reçue pour le client ID: ${customerId}`);
    console.log('Données mises à jour:', updatedData);

    const { company_name, created_by,keyword } = updatedData;
    console.log(company_name, created_by);

    try {
        const connection = await db.getConnection();

        const [result] = await connection.query(
            'UPDATE companies SET company_name = ?, created_by = ?,keyword = ? WHERE id = ?',
            [company_name, created_by,keyword, customerId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            console.log(`Client ID: ${customerId} non trouvé.`);
            return res.status(404).send({ message: 'Client non trouvé' });
        }

        console.log(`Client ID: ${customerId} mis à jour avec succès.`);
        res.send({ message: 'Client mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des informations du client:', error);
        res.status(500).send({ message: 'Erreur lors de la mise à jour des informations du client' });
    }
});

// Route pour mettre à jour une adresse d'un client
router.put('/api/customers/:customerId/addresses/:addressId', async (req, res) => {
    const customerId = req.params.customerId;
    const addressId = req.params.addressId;
    const updatedAddress = req.body;

    console.log(`Requête de mise à jour reçue pour l'adresse ID: ${addressId} du client ID: ${customerId}`);
    console.log('Données mises à jour:', updatedAddress);

    const {address } = updatedAddress;

    try {
        const connection = await db.getConnection();

        const [result] = await connection.query(
            'UPDATE company_addresses SET address = ? WHERE company_id = ? AND id = ?',
            [address, customerId, addressId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            console.log(`Adresse ID: ${addressId} du client ID: ${customerId} non trouvée.`);
            return res.status(404).send({ message: 'Adresse non trouvée' });
        }

        console.log(`Adresse ID: ${addressId} du client ID: ${customerId} mise à jour avec succès.`);
        res.send({ message: 'Adresse mise à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'adresse:', error);
        res.status(500).send({ message: 'Erreur lors de la mise à jour de l\'adresse' });
    }
});

// Route pour ajouter une nouvelle adresse à un client
router.post('/api/customers/:customerId/addresses', async (req, res) => {
    const customerId = req.params.customerId;
    const newAddress = req.body;

    console.log(`Requête de création reçue pour une nouvelle adresse du client ID: ${customerId}`);
    console.log('Données de la nouvelle adresse:', newAddress);

    const { type,address } = newAddress;

    try {
        const connection = await db.getConnection();

        const [result] = await connection.query(
            'INSERT INTO company_addresses (company_id, type,address) VALUES (?, ?, ?)',
            [customerId, type, address]
        );

        connection.release();

        if (result.affectedRows === 0) {
            console.log(`Erreur lors de l'ajout de la nouvelle adresse pour le client ID: ${customerId}.`);
            return res.status(500).send({ message: 'Erreur lors de l\'ajout de la nouvelle adresse' });
        }

        console.log(`Nouvelle adresse ajoutée avec succès pour le client ID: ${customerId}.`);
        res.send({ id: result.insertId, message: 'Nouvelle adresse ajoutée avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la nouvelle adresse:', error);
        res.status(500).send({ message: 'Erreur lors de l\'ajout de la nouvelle adresse' });
    }
});

// Route pour supprimer une adresse d'un client
router.delete('/api/customers/:customerId/addresses/:addressId', async (req, res) => {
    const customerId = req.params.customerId;
    const addressId = req.params.addressId;

    console.log(`Requête de suppression reçue pour l'adresse ID: ${addressId} du client ID: ${customerId}`);

    try {
        const connection = await db.getConnection();

        const [result] = await connection.query(
            'DELETE FROM company_addresses WHERE company_id = ? AND id = ?',
            [customerId, addressId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            console.log(`Adresse ID: ${addressId} du client ID: ${customerId} non trouvée.`);
            return res.status(404).send({ message: 'Adresse non trouvée' });
        }

        console.log(`Adresse ID: ${addressId} du client ID: ${customerId} supprimée avec succès.`);
        res.send({ message: 'Adresse supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'adresse:', error);
        res.status(500).send({ message: 'Erreur lors de la suppression de l\'adresse' });
    }
});

// Route pour ajouter un nouveau contact à un client
router.post('/api/customers/:customerId/contacts', async (req, res) => {
    const customerId = req.params.customerId;
    const newContact = req.body;

    console.log(`Requête de création reçue pour un nouveau contact du client ID: ${customerId}`);
    console.log('Données du nouveau contact:', newContact);

    const { name, mobile, email, direct_phone,contact_function } = newContact;

    try {
        const connection = await db.getConnection();

        const [result] = await connection.query(
            'INSERT INTO company_contacts (company_id, name, mobile, email, direct_phone,contact_function) VALUES (?, ?, ?, ?, ?,?)',
            [customerId, name, mobile, email, direct_phone,contact_function]
        );

        connection.release();

        if (result.affectedRows === 0) {
            console.log(`Erreur lors de l'ajout du nouveau contact pour le client ID: ${customerId}.`);
            return res.status(500).send({ message: 'Erreur lors de l\'ajout du nouveau contact' });
        }

        console.log(`Nouveau contact ajouté avec succès pour le client ID: ${customerId}.`);
        res.send({ id: result.insertId, message: 'Nouveau contact ajouté avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du nouveau contact:', error);
        res.status(500).send({ message: 'Erreur lors de l\'ajout du nouveau contact' });
    }
});

// Route pour mettre à jour un contact d'un client
router.put('/api/customers/:customerId/contacts/:contactId', async (req, res) => {
    const customerId = req.params.customerId;
    const contactId = req.params.contactId;
    const updatedContact = req.body;

    console.log(`Requête de mise à jour reçue pour le contact ID: ${contactId} du client ID: ${customerId}`);
    console.log('Données mises à jour:', updatedContact);

    const { name, mobile, email, direct_phone,contact_function } = updatedContact;

    try {
        const connection = await db.getConnection();

        const [result] = await connection.query(
            'UPDATE company_contacts SET name = ?, mobile = ?, email = ?, direct_phone = ?, contact_function = ? WHERE company_id = ? AND id = ?',
            [name, mobile, email, direct_phone,contact_function, customerId, contactId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            console.log(`Contact ID: ${contactId} du client ID: ${customerId} non trouvé.`);
            return res.status(404).send({ message: 'Contact non trouvé' });
        }

        console.log(`Contact ID: ${contactId} du client ID: ${customerId} mis à jour avec succès.`);
        res.send({ message: 'Contact mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du contact:', error);
        res.status(500).send({ message: 'Erreur lors de la mise à jour du contact' });
    }
});

// Route pour supprimer un contact d'un client
router.delete('/api/customers/:customerId/contacts/:contactId', async (req, res) => {
    const customerId = req.params.customerId;
    const contactId = req.params.contactId;

    console.log(`Requête de suppression reçue pour le contact ID: ${contactId} du client ID: ${customerId}`);

    try {
        const connection = await db.getConnection();

        const [result] = await connection.query(
            'DELETE FROM company_contacts WHERE company_id = ? AND id = ?',
            [customerId, contactId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            console.log(`Contact ID: ${contactId} du client ID: ${customerId} non trouvé.`);
            return res.status(404).send({ message: 'Contact non trouvé' });
        }

        console.log(`Contact ID: ${contactId} du client ID: ${customerId} supprimé avec succès.`);
        res.send({ message: 'Contact supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du contact:', error);
        res.status(500).send({ message: 'Erreur lors de la suppression du contact' });
    }
});

// Route pour ajouter une nouvelle méthode de communication à un client
router.post('/api/customers/:customerId/communicationMethods', async (req, res) => {
    const customerId = req.params.customerId;
    const newMethod = req.body;

    console.log(`Requête de création reçue pour une nouvelle méthode de communication du client ID: ${customerId}`);
    console.log('Données de la nouvelle méthode de communication:', newMethod);

    const { contact_type, contact_value } = newMethod;

    try {
        const connection = await db.getConnection();

        const [result] = await connection.query(
            'INSERT INTO company_contacts_methods (company_id, contact_type, contact_value) VALUES (?, ?, ?)',
            [customerId, contact_type, contact_value]
        );

        connection.release();

        if (result.affectedRows === 0) {
            console.log(`Erreur lors de l'ajout de la nouvelle méthode de communication pour le client ID: ${customerId}.`);
            return res.status(500).send({ message: 'Erreur lors de l\'ajout de la nouvelle méthode de communication' });
        }

        console.log(`Nouvelle méthode de communication ajoutée avec succès pour le client ID: ${customerId}.`);
        res.send({ id: result.insertId, message: 'Nouvelle méthode de communication ajoutée avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la nouvelle méthode de communication:', error);
        res.status(500).send({ message: 'Erreur lors de l\'ajout de la nouvelle méthode de communication' });
    }
});

// Route pour mettre à jour une méthode de communication d'un client
router.put('/api/customers/:customerId/communicationMethods/:methodId', async (req, res) => {
    const customerId = req.params.customerId;
    const methodId = req.params.methodId;
    const updatedMethod = req.body;

    console.log(`Requête de mise à jour reçue pour la méthode de communication ID: ${methodId} du client ID: ${customerId}`);
    console.log('Données mises à jour:', updatedMethod);

    const { contact_type, contact_value } = updatedMethod;

    try {
        const connection = await db.getConnection();

        const [result] = await connection.query(
            'UPDATE company_contacts_methods SET contact_type = ?,contact_value = ? WHERE company_id = ? AND id = ?',
            [contact_type, contact_value, customerId, methodId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            console.log(`Méthode de communication ID: ${methodId} du client ID: ${customerId} non trouvée.`);
            return res.status(404).send({ message: 'Méthode de communication non trouvée' });
        }

        console.log(`Méthode de communication ID: ${methodId} du client ID: ${customerId} mise à jour avec succès.`);
        res.send({ message: 'Méthode de communication mise à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la méthode de communication:', error);
        res.status(500).send({ message: 'Erreur lors de la mise à jour de la méthode de communication' });
    }
});

// Route pour supprimer une méthode de communication d'un client
router.delete('/api/customers/:customerId/communicationMethods/:methodId', async (req, res) => {
    const customerId = req.params.customerId;
    const methodId = req.params.methodId;

    console.log(`Requête de suppression reçue pour la méthode de communication ID: ${methodId} du client ID: ${customerId}`);

    try {
        const connection = await db.getConnection();

        const [result] = await connection.query(
            'DELETE FROM company_contacts_methods WHERE company_id = ? AND id = ?',
            [customerId, methodId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            console.log(`Méthode de communication ID: ${methodId} du client ID: ${customerId} non trouvée.`);
            return res.status(404).send({ message: 'Méthode de communication non trouvée' });
        }

        console.log(`Méthode de communication ID: ${methodId} du client ID: ${customerId} supprimée avec succès.`);
        res.send({ message: 'Méthode de communication supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la méthode de communication:', error);
        res.status(500).send({ message: 'Erreur lors de la suppression de la méthode de communication' });
    }
});

export default router;
