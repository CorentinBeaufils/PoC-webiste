import express from 'express';
const router = express.Router();
import db from '../db.js'; // Assurez-vous que le chemin est correct
import { verifierSession, verifierAdmin } from '../middleware/authMiddleware.js'; // Chemin correct vers les middlewares


// Route pour obtenir la liste des fournisseurs avec pagination et filtrage
router.get('/api/suppliers',verifierSession, async (req, res) => {
    const { page = 1, limit = 20, filterType, filterValue } = req.query;
    console.log('Page:', page, 'Limit:', limit);
    // Convertir les valeurs de page et limit en entiers
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    

    // Validation des valeurs de page et limit
    if (isNaN(pageInt) || pageInt < 1) {
        pageInt = 1;
    }
    if (isNaN(limitInt) || limitInt < 1) {
        limitInt = 20;
    }

    try {
        const offset = (pageInt - 1) * limitInt;
        let query = 'SELECT * FROM suppliers';
        const queryParams = [];

        if (filterType && filterValue) {
            if (filterType === 'name') {
                query += ' WHERE supplier_name LIKE ?';
                queryParams.push(`%${filterValue}%`);
            } else if (filterType === 'keyword') {
                query += ' WHERE supplier_keywords LIKE ?';
                queryParams.push(`%${filterValue}%`);
            } else if (filterType === 'contact') {
                query += `
                    JOIN contacts ct ON suppliers.id = ct.supplier_id
                    WHERE ct.contact_name LIKE ?
                `;
                queryParams.push(`%${filterValue}%`);
            }
        }

        query += ' LIMIT ? OFFSET ?';
        queryParams.push(limitInt, offset);

        const [suppliers] = await db.query(query, queryParams);
        console.log('Suppliers retrieved:', suppliers.length);
        res.json(suppliers);
    } catch (error) {
        console.error('Erreur lors de la récupération des fournisseurs:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fournisseurs.' });
    }
});

// Route to display the supplier edit page
router.get('/edit-supplier/:id', verifierSession, async (req, res) => {
    const supplierId = req.params.id;

    try {
        const [supplier] = await db.query('SELECT * FROM suppliers WHERE id = ?', [supplierId]);
        if (supplier.length === 0) {
            return res.status(404).send('Supplier not found');
        }

        const [addresses] = await db.query('SELECT * FROM supplier_addresses WHERE supplier_id = ?', [supplierId]);
        const [contacts] = await db.query('SELECT * FROM supplier_contacts WHERE supplier_id = ?', [supplierId]);
        const [contactMethods] = await db.query('SELECT * FROM supplier_contact_methods WHERE supplier_id = ?', [supplierId]);

        console.log('User:', req.session.user);
        res.render('edit-supplier', { 
            supplier: supplier[0], 
            addresses: addresses, 
            contacts: contacts, 
            contactMethods: contactMethods,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching supplier:', error);
        res.status(500).send('Error fetching supplier');
    }
});

// Route to create a new supplier
router.post('/api/suppliers', verifierSession, async (req, res) => {
    const { name, keywords } = req.body;

    try {
        const [customerResult] = await db.query('INSERT INTO suppliers (supplier_name, supplier_keywords, created_by, creation_date, modification_date) VALUES (?, ?, ?, NOW(), NOW())',
            [name, keywords, req.session.user.nom]
        );
        const supplierId = customerResult.insertId;
        console.log('Supplier created:', { name, keywords, supplierId });

        res.status(201).json({message : 'Supplier created successfully',supplierId:supplierId});
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).send('Error creating supplier');
    }
});

// Route to delete an existing supplier
router.delete('/api/suppliers/:id', verifierSession, async (req, res) => {
    const supplierId = req.params.id;

    try {
        await db.query('DELETE FROM suppliers WHERE id = ?', [supplierId]);
        console.log('Supplier deleted:', { supplierId });
        res.status(200).send('Supplier deleted successfully');
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).send('Error deleting supplier');
    }
});

// Route to add a new address
router.post('/api/supplier-addresses', verifierSession, async (req, res) => {
    const { type, address, supplier_id } = req.body;

    try {
        await db.query('INSERT INTO supplier_addresses (type, address, supplier_id) VALUES (?, ?, ?)', [type, address, supplier_id]);
        console.log('Address added:', { type, address, supplier_id });
        res.status(201).send('Address added successfully');
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).send('Error adding address');
    }
});

// Route to update an existing address
router.put('/api/supplier-addresses/:id', verifierSession, async (req, res) => {
    const addressId = req.params.id;
    const { type, address } = req.body;

    try {
        await db.query('UPDATE supplier_addresses SET type = ?, address = ? WHERE id = ?', [type, address, addressId]);
        console.log('Address updated:', { addressId, type, address });
        res.status(200).send('Address updated successfully');
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).send('Error updating address');
    }
});

// Route to delete an existing address
router.delete('/api/supplier-addresses/:id', verifierSession, async (req, res) => {
    const addressId = req.params.id;

    try {
        await db.query('DELETE FROM supplier_addresses WHERE id = ?', [addressId]);
        console.log('Address deleted:', { addressId });
        res.status(200).send('Address deleted successfully');
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).send('Error deleting address');
    }
});

// Route to add a new contact
router.post('/api/supplier-contacts', verifierSession, async (req, res) => {
    const { name, mobile, email, supplier_id } = req.body;

    try {
        await db.query('INSERT INTO supplier_contacts (name, mobile, email, supplier_id) VALUES (?, ?, ?, ?)', [name, mobile, email, supplier_id]);
        console.log('Contact added:', { name, mobile, email, supplier_id });
        res.status(201).send('Contact added successfully');
    } catch (error) {
        console.error('Error adding contact:', error);
        res.status(500).send('Error adding contact');
    }
});

// Route to update an existing contact
router.put('/api/supplier-contacts/:id', verifierSession, async (req, res) => {
    const contactId = req.params.id;
    const { name, mobile, email } = req.body;

    try {
        await db.query('UPDATE supplier_contacts SET name = ?, mobile = ?, email = ? WHERE id = ?', [name, mobile, email, contactId]);
        console.log('Contact updated:', { contactId, name, mobile, email });
        res.status(200).send('Contact updated successfully');
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).send('Error updating contact');
    }
});

// Route to delete an existing contact
router.delete('/api/supplier-contacts/:id', verifierSession, async (req, res) => {
    const contactId = req.params.id;

    try {
        await db.query('DELETE FROM supplier_contacts WHERE id = ?', [contactId]);
        console.log('Contact deleted:', { contactId });
        res.status(200).send('Contact deleted successfully');
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).send('Error deleting contact');
    }
});

// Route to add a new contact method
router.post('/api/supplier-contact-methods', verifierSession, async (req, res) => {
    const { contact_type, contact_value, address_type, supplier_id } = req.body;

    try {
        await db.query('INSERT INTO supplier_contact_methods (contact_type, contact_value, address_type, supplier_id) VALUES (?, ?, ?, ?)', [contact_type, contact_value, address_type, supplier_id]);
        console.log('Contact method added:', { contact_type, contact_value, address_type, supplier_id });
        res.status(201).send('Contact method added successfully');
    } catch (error) {
        console.error('Error adding contact method:', error);
        res.status(500).send('Error adding contact method');
    }
});

// Route to update an existing contact method
router.put('/api/supplier-contact-methods/:id', verifierSession, async (req, res) => {
    const methodId = req.params.id;
    const { contact_type, contact_value, address_type } = req.body;

    try {
        await db.query('UPDATE supplier_contact_methods SET contact_type = ?, contact_value = ?, address_type = ? WHERE id = ?', [contact_type, contact_value, address_type, methodId]);
        console.log('Contact method updated:', { methodId, contact_type, contact_value, address_type });
        res.status(200).send('Contact method updated successfully');
    } catch (error) {
        console.error('Error updating contact method:', error);
        res.status(500).send('Error updating contact method');
    }
});

// Route to delete an existing contact method
router.delete('/api/supplier-contact-methods/:id', verifierSession, async (req, res) => {
    const methodId = req.params.id;

    try {
        await db.query('DELETE FROM supplier_contact_methods WHERE id = ?', [methodId]);
        console.log('Contact method deleted:', { methodId });
        res.status(200).send('Contact method deleted successfully');
    } catch (error) {
        console.error('Error deleting contact method:', error);
        res.status(500).send('Error deleting contact method');
    }
});

export default router;