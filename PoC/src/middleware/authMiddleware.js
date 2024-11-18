export function verifierSession(req, res, next) {
    if (req.session && req.session.user) {
        console.log('Session active pour l\'utilisateur:', req.session.user);
        next();
    } else {
        res.redirect('/login');
    }
}

export function verifierAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.redirect('/customer');
    }
}
