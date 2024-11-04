import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Middleware pour analyser les données du formulaire
app.use(express.urlencoded({ extended: true }));
// Configurer le moteur de vue EJS et le répertoire des vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Servir les fichiers statiques (CSS, JS) depuis le dossier public
app.use(express.static(path.join(__dirname, 'src/public')));



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

// Démarrer le serveur
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});


app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET, // Remplacez par une clé secrète
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Mettez `true` si vous utilisez HTTPS en production
}));


const verifierAdmin = (req, res, next) => {
    // Vérifier si l'utilisateur est authentifié et a le rôle d'administrateur
    if (req.session.user && req.session.user.role === 'admin') {
        console.log('admin action with mail: ',req.session.user.email)
        next();
    } else {
        console.log('admin request with email',req.session.user.email);
        res.status(403).json({ message: 'Accès refusé : réservée aux administrateurs.' });
    }
};


const verifierSession = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login'); // Redirige vers la page de connexion si la session n'existe pas
    }
};

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la déconnexion" });
        }
        res.redirect('/login');
    });
});



app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/user', verifierSession, (req, res) => {
    res.render('user', { user: req.session.user });
});

app.get('/dossier', verifierSession, (req, res) => {
    res.render('dossier');
});

app.get('/dossier_list', verifierSession, (req, res) => {
    res.render('dossier_list');
});



// Route pour créer un utilisateur (protégée par le rôle admin)
app.post('/inscription', verifierAdmin, async (req, res) => {
    const { nom, email, mot_de_passe, role } = req.body;

    try {
        const mot_de_passe_hache = await bcrypt.hash(mot_de_passe, 10);

        // Insérer un nouvel utilisateur dans la base de données
        const [result] = await db.query(
            'INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
            [nom, email, mot_de_passe_hache, role]
        );

        
    } catch (err) {
        console.error('Erreur lors de la création de l’utilisateur :', err);
        res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur.' });
    }
});


app.delete('/supprimer_utilisateur', verifierAdmin, async (req, res) => {
    const email = req.query.email;
    console.log("Email reçu pour suppression :", email);

    if (!email) {
        console.log('issue 1');
        return res.status(400).json({ message: 'Email requis pour supprimer un utilisateur.' });
    }

    try {
        const [result] = await db.query('DELETE FROM utilisateurs WHERE email = ?', [email]);

        if (result.affectedRows === 0) {
            console.log('issue 3');
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        console.log('Utilisateur supprimé avec succès');
        res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (err) {
        console.log('issue 2', err);
        return res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur.' });
    }
});





app.post('/connexion', async (req, res) => {
    const { email, mot_de_passe } = req.body;
    console.log(req.body);

    try {
        const [results] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);

        if (results.length === 0) {
            console.log("Utilisateur non trouvé.");
            return res.status(400).send('Utilisateur non trouvé.');
        }

        const utilisateur = results[0];
        const mot_de_passe_correct = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

        if (!mot_de_passe_correct) {
            console.log("Mot de passe incorrect.");
            return res.status(400).send('Mot de passe incorrect.');
        }

        // Stocker les informations utilisateur dans la session
        req.session.user = {
            id: utilisateur.id,
            email: utilisateur.email,
            role: utilisateur.role
        };

        console.log("Connexion réussie, redirection vers /user");
        res.redirect('/user');
    } catch (err) {
        console.error("Erreur de serveur :", err);
        res.status(500).send('Erreur de serveur.');
    }
});


// Route pour ajouter un dossier (nécessite que l'utilisateur soit connecté)
app.post('/dossiers', verifierSession, async (req, res) => {
    const { nom, description } = req.body;
    const utilisateur_id = req.session.user.id; // L'utilisateur connecté

    try {
        const [result] = await  db.query(
            'INSERT INTO dossiers (nom, description, utilisateur_id) VALUES (?, ?, ?)',
            [nom, description, utilisateur_id]);
            console.log('creation du dossier avec les parametres (nom,description,utilisateur_id) : ',nom,description,utilisateur_id);
            res.status(201).json({ message: 'dossier créé avec succès.' });
    } catch (err) {
        console.error('Erreur lors de la création du dossier :', err);
        res.status(500).json({ message: 'Erreur lors de la création du dossier.' });
    }
});


// Route pour récupérer les dossiers (nécessite que l'utilisateur soit connecté)
app.get('/dossiers', verifierSession, async (req, res) => {
    console.log(`[${new Date().toISOString()}] Requête reçue pour /dossiers par l'utilisateur ID : ${req.session.user.id}`);

    const limit = parseInt(req.query.limit) || 10;  // Nombre de dossiers à renvoyer
    const offset = parseInt(req.query.offset) || 0;  // Décalage (offset) pour la pagination
    console.log(`[${new Date().toISOString()}] Paramètres de requête: limit = ${limit}, offset = ${offset}`);

    try {
        // Log de début de requête
        console.log(`[${new Date().toISOString()}] Tentative de récupération des dossiers depuis la base de données`);
        
        // Exécution de la requête avec log de démarrage et fin
        const [results] = await db.query('SELECT * FROM dossiers LIMIT ? OFFSET ?', [limit, offset]);
        
        console.log(`[${new Date().toISOString()}] Requête /dossiers réussie. Nombre de dossiers récupérés: ${results.length}`);
        
        res.json(results);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Erreur dans la requête /dossiers:`, err);
        res.status(500).json({ message: 'Erreur lors de la récupération des dossiers.' });
    } finally {
        console.log(`[${new Date().toISOString()}] Fin de traitement pour la requête /dossiers`);
    }
});

