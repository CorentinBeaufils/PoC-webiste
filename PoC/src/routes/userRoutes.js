import express from 'express';
import { verifierSession, verifierAdmin } from '../middleware/authMiddleware.js'; // Assurez-vous que le chemin est correct
import pool from '../db.js'; // Assurez-vous que le chemin est correct et que pool est votre instance de pool MySQL

const router = express.Router();

// Route pour récupérer les informations des utilisateurs
router.get('/get_users', verifierSession, verifierAdmin, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT nom, email, role FROM utilisateurs');
        res.json(results); // Renvoie les utilisateurs en réponse
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
});

// Route pour mettre à jour un utilisateur
router.put('/update_user', verifierSession, verifierAdmin, async (req, res) => {
    const { email, nom, newEmail, role } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE utilisateurs SET nom = ?, email = ?, role = ? WHERE email = ?',
            [nom, newEmail, role, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.json({ message: 'Utilisateur mis à jour avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur.' });
    }
});

export default router;