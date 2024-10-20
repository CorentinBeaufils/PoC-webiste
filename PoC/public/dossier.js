console.log(localStorage.getItem('token'))

document.getElementById('dossierForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nom = document.getElementById('nom').value;
    const description = document.getElementById('description').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3100/dossiers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nom, description })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Dossier créé avec succès !');
            window.location.href = 'dossier_list.html'; // Redirige vers la liste des dossiers
        } else {
            document.getElementById('errorMessage').textContent = data.message;
        }
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('errorMessage').textContent = 'Erreur lors de la création du dossier.';
    }
});

document.getElementById('logoutButton').addEventListener('click', () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('token');
    // Rediriger vers la page de connexion
    window.location.href = 'login.html';
});



