// Gestion de la création d'un nouvel utilisateur
document.getElementById('createUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nom = document.getElementById('nom').value;
    const email = document.getElementById('email').value;
    const mot_de_passe = document.getElementById('mot_de_passe').value;
    const role = document.getElementById('role').value;

    try {
        const response = await fetch('/inscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nom, email, mot_de_passe, role })
        });

        const data = await response.json();
        document.getElementById('createMessage').textContent = response.ok
            ? 'Utilisateur créé avec succès.'
            : data.message || 'Erreur lors de la création de l\'utilisateur.';
    } catch (error) {
        document.getElementById('createMessage').textContent = 'Erreur lors de la création de l\'utilisateur.';
        console.error('Erreur:', error);
    }
});

// Gestion de la suppression d'un utilisateur
document.getElementById('deleteUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('deleteEmail').value;
    console.log("Envoi de la requête pour supprimer l'utilisateur avec email :", email);

    try {
        const response = await fetch(`/supprimer_utilisateur?email=${encodeURIComponent(email)}`, {
            method: 'DELETE',
            credentials: 'same-origin' // Inclut les cookies de session dans la requête
        });

        console.log("Réponse reçue :", response); // Affiche la réponse pour vérifier son statut

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression.');
        }

        const data = await response.json();
        console.log("Données reçues du serveur :", data); // Affiche les données reçues du serveur

        document.getElementById('deleteMessage').textContent = response.ok
            ? 'Utilisateur supprimé avec succès.'
            : data.message || 'Erreur lors de la suppression de l\'utilisateur.';
    } catch (error) {
        document.getElementById('deleteMessage').textContent = 'Erreur lors de la suppression de l\'utilisateur.';
        console.error('Erreur:', error);
    }
});




// Fonction de déconnexion
document.getElementById('logoutButton')?.addEventListener('click', () => {
    fetch('/logout', { method: 'POST' })
        .then(() => {
            window.location.href = '/login';
        })
        .catch(error => {
            console.error('Erreur lors de la déconnexion:', error);
        });
});
