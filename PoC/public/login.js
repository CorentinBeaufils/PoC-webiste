document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://72.255.240.81:5001/connexion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, mot_de_passe: password })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Stocker le token dans le localStorage
            localStorage.setItem('token', data.token);
            // Rediriger vers la page d'affichage de l'utilisateur
            window.location.href = 'user.html';
        } else {
            document.getElementById('errorMessage').textContent = data.message;
        }
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('errorMessage').textContent = 'Erreur lors de la connexion.';
    }
});
