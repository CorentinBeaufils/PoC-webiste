export function verifierSession(req, res, next) {
    if (req.session && req.session.user) {
        console.log('Session active pour l\'utilisateur:', req.session.user);
        next();
    } else {
        console.log('Session non active');
        res.status(401).send('Non autorisé');
    }
}

export function verifierAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Accès interdit');
    }
}
