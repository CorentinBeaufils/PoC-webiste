import dotenv from 'dotenv';
import express from 'express';
import bcrypt from 'bcrypt';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { verifierSession, verifierAdmin } from './src/middleware/authMiddleware.js';
import customerRoutes from './src/routes/customerRoutes.js'; // Chemin des routes clients
import db from './src/db.js'; // Assurez-vous du chemin correct
import bodyParser from 'body-parser';
import userRoutes from './src/routes/userRoutes.js'; // Assurez-vous que le chemin est correct
import supplierRoutes from './src/routes/supplierRoutes.js'; // Assurez-vous que le chemin est correct

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Middleware pour analyser les données du formulaire
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration de la session
app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET, // Remplacez par une clé secrète
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettez `true` si vous utilisez HTTPS en production
}));

// Configurer le moteur de vue EJS et le répertoire des vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Servir les fichiers statiques (CSS, JS) depuis le dossier public
app.use(express.static(path.join(__dirname, 'src/public')));

// Utilisez les routes pour les clients

app.use(customerRoutes);
app.use(userRoutes);
app.use(supplierRoutes);


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

app.get('/user', verifierSession,verifierAdmin, (req, res) => {
    res.render('user', { user: req.session.user });
});


app.get('/customer',verifierSession, (req,res) => {
    res.render('customer', { user: req.session.user });
});

app.get('/supplier',verifierSession, (req,res) => {
    res.render('supplier', { user: req.session.user });
});

app.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    res.render('home', { user: req.session.user });
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

        // Envoyer une réponse de succès
        res.status(201).json({ message: 'Utilisateur créé avec succès.', userId: result.insertId });
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
        console.log("Utilisateur trouvé :", utilisateur);
        const mot_de_passe_correct = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

        if (!mot_de_passe_correct) {
            console.log("Mot de passe incorrect.");
            return res.status(400).send('Mot de passe incorrect.');
        }

        // Stocker les informations utilisateur dans la session
        req.session.user = {
            id: utilisateur.id,
            nom : utilisateur.nom,
            email: utilisateur.email,
            role: utilisateur.role,
            startTime: Date.now()
        };

        console.log("Connexion réussie, redirection vers /user");
        res.redirect('/home');
    } catch (err) {
        console.error("Erreur de serveur :", err);
        res.status(500).send('Erreur de serveur.');
    }
});
