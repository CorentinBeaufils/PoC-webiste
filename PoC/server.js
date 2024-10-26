import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));


// Connexion à la base de données MySQL
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '123456789',  // Remplace par le mot de passe MySQL
    database: 'PoC',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    connectTimeout: 20000
});


// Fonction keep-alive pour éviter la déconnexion
setInterval(async () => {
    try {
        await db.query('SELECT 1'); // Envoi une requête légère
        console.log('Keep-alive: La connexion MySQL est active.');
    } catch (err) {
        console.error('Erreur de keep-alive:', err);
    }
}, 1000 * 60 * 5); // Envoie une requête toutes les 5 minutes

// db.connect((err) => {
//     if (err) {
//         console.error('Erreur de connexion à MySQL:', err);
//         return;
//     }
//     console.log('Connecté à la base de données MySQL');
// });

// Démarrer le serveur
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});




const verifierAdmin = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token non fourni' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.ACCESS_TOKEN_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
        }
        req.utilisateur = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide' });
    }
};

// Route pour créer un utilisateur (protégée)
app.post('/inscription', verifierAdmin, async (req, res) => {
    const { nom, email, mot_de_passe } = req.body;

    const mot_de_passe_hache = await bcrypt.hash(mot_de_passe, 10);

    db.query('INSERT INTO utilisateurs (nom, email, mot_de_passe) VALUES (?, ?, ?)',
        [nom, email, mot_de_passe_hache],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur.' });
            }
            res.status(201).json({ message: 'Utilisateur créé avec succès.' });
        }
    );
});



// Route pour supprimer un utilisateur
app.delete('/supprimer_utilisateur', verifierAdmin, (req, res) => {
    const { email } = req.body;

    db.query('DELETE FROM utilisateurs WHERE email = ?', [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    });
});


app.post('/connexion', async (req, res) => {
    const { email, mot_de_passe } = req.body;

    try {
        const [results] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(400).json({ message: 'Utilisateur non trouvé.' });
        }

        const utilisateur = results[0];

        // Vérifier le mot de passe
        const mot_de_passe_correct = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

        if (!mot_de_passe_correct) {
            return res.status(400).json({ message: 'Mot de passe incorrect.' });
        }

        // Générer un token JWT avec le rôle
        const token = jwt.sign(
            { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Connexion réussie', token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur de serveur.' });
    }
});


const verifierToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token non fourni' });
    }

    try {
        // On retire "Bearer " de l'auth header pour ne garder que le token
        const decoded = jwt.verify(token.split(' ')[1], process.env.ACCESS_TOKEN_SECRET);
        req.utilisateur = decoded;  // On stocke l'utilisateur décodé dans la requête
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide' });
    }
};


// Route protégée pour accéder à user.html
app.get('/user.html', verifierToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});


// Route pour ajouter un dossier (nécessite que l'utilisateur soit connecté)
app.post('/dossiers', verifierToken, (req, res) => {
    const { nom, description } = req.body;
    const utilisateur_id = req.utilisateur.id; // L'utilisateur connecté

    // Log pour vérifier les valeurs passées
    console.log('Création du dossier avec les valeurs :', { nom, description, utilisateur_id });
    // Insérer un nouveau dossier dans la base de données
    db.query(
        'INSERT INTO dossiers (nom, description, utilisateur_id) VALUES (?, ?, ?)',
        [nom, description, utilisateur_id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erreur lors de la création du dossier.' });
            }
            res.status(201).json({ message: 'Dossier créé avec succès.' });
        }
    );
});


app.get('/dossiers', verifierToken, (req, res) => {
    const limit = parseInt(req.query.limit) || 10;  // Nombre de dossiers à renvoyer (par défaut 10)
    const offset = parseInt(req.query.offset) || 0;  // Décalage (offset) pour la pagination

    const query = 'SELECT * FROM dossiers LIMIT ? OFFSET ?';
    db.query(query, [limit, offset], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des dossiers:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des dossiers.' });
        }
        res.json(results);
    });
});