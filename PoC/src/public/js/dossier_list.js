let offset = 0;
const limit = 20;
let isLoading = false;

const dossierList = document.getElementById('dossierList');
const loader = document.getElementById('loader');

const chargerDossiers = async () => {
    if (isLoading) return;

    isLoading = true;
    try {
        const response = await fetch(`/dossiers?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            credentials: 'same-origin' // Inclut les cookies de session pour l'authentification
        });

        if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        
        const dossiers = await response.json();
        afficherDossiers(dossiers);
        offset += limit;
    } catch (error) {
        console.error('Erreur lors de la récupération des dossiers:', error);
    } finally {
        isLoading = false;
    }
};

const afficherDossiers = (dossiers) => {
    dossiers.forEach(dossier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dossier.nom}</td>
            <td>${dossier.description}</td>
            <td>${new Date(dossier.date_creation).toLocaleDateString()}</td>
        `;
        dossierList.appendChild(row);
    });
};

// Charger les premiers dossiers
chargerDossiers();

// Charger plus de dossiers au défilement
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        chargerDossiers();
    }
});

document.getElementById('logoutButton').addEventListener('click', () => {
    // Pas besoin de supprimer le token car on utilise des sessions
    window.location.href = '/logout'; // Redirige vers une route de déconnexion
});
