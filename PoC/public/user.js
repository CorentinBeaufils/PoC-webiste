const token = localStorage.getItem('token');
console.log('Token stocké dans le localStorage:', token);  // Debug : Voir le token stocké

if (!token) {
    // Si pas de token, rediriger vers la page de connexion
    window.location.href = 'login.html';
} else {
    // Envoyer une requête GET pour accéder à la page sécurisée
    fetch('http://localhost:3100/user.html', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
            window.location.href = 'login.html';
        } else {
            return response.text();  // Lire le contenu de la page
        }
    })
    .then(data => {
        // Décoder le token et afficher l'email de l'utilisateur
        const payload = JSON.parse(atob(token.split('.')[1]));
        document.getElementById('userEmail').textContent = payload.email;
    })
    .catch(err => {
        console.error('Erreur lors de la récupération de la page:', err);
        window.location.href = 'login.html'; // Rediriger si une erreur se produit
    });
}


// Fonction de déconnexion
document.getElementById('logoutButton').addEventListener('click', () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('token');
    // Rediriger vers la page de connexion
    window.location.href = 'login.html';
});

