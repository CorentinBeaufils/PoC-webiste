document.getElementById('dossierForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nom = document.getElementById('nom').value;
    const description = document.getElementById('description').value;

    try {
        const response = await fetch('/dossiers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin', // Ajout de cette option pour envoyer les cookies de session
            body: JSON.stringify({ nom, description })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Dossier créé avec succès !');
            window.location.href = '/dossier_list';
        } else {
            document.getElementById('errorMessage').textContent = data.message || 'Erreur lors de la création du dossier.';
        }
    } catch (error) {
        console.error('Erreur lors de la création du dossier:', error);
        document.getElementById('errorMessage').textContent = 'Erreur lors de la création du dossier.';
    }
});


document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
});
