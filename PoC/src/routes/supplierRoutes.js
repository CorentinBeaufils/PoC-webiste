import express from 'express';
const router = express.Router();
import db from '../db.js'; // Assurez-vous que le chemin est correct
import { verifierSession, verifierAdmin } from '../middleware/authMiddleware.js'; // Chemin correct vers les middlewares


// Route pour obtenir la liste des fournisseurs avec pagination et filtrage
router.get('/api/suppliers',verifierSession, async (req, res) => {
    const { page = 1, limit = 10, filterType, filterValue } = req.query;

    // Convertir les valeurs de page et limit en entiers
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);

    // Validation des valeurs de page et limit
    if (isNaN(pageInt) || pageInt < 1) {
        pageInt = 1;
    }
    if (isNaN(limitInt) || limitInt < 1) {
        limitInt = 10;
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

        res.json(suppliers);
    } catch (error) {
        console.error('Erreur lors de la récupération des fournisseurs:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fournisseurs.' });
    }
});

export default router;