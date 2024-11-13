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

export { verifierSession, verifierAdmin };