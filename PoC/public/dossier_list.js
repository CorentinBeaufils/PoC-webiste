const token = localStorage.getItem('token');

let offset = 0;
const limit = 20;  // Nombre de dossiers à charger par lot
let isLoading = false;  // Évite les requêtes en double
const dossierList = document.getElementById('dossierList');
const loader = document.getElementById('loader');


const chargerDossiers = async () => {
    if (isLoading) return;  // Évite de lancer plusieurs requêtes à la fois

    isLoading = true;

    try {
        const response = await fetch(`http://localhost:3100/dossiers?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const dossiers = await response.json();
        afficherDossiers(dossiers);

        // Mettre à jour l'offset pour éviter de recharger les mêmes dossiers
        offset += limit;
    } catch (error) {
        console.error('Erreur lors de la récupération des dossiers:', error);
    } finally {
        isLoading = false;
    }
};

// Charger les premiers dossiers au démarrage
chargerDossiers();

const afficherDossiers = (dossiers) => {
    dossiers.forEach(dossier => {
        const row = document.createElement('tr');
        
        const nomCell = document.createElement('td');
        nomCell.textContent = dossier.nom;

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = dossier.description;

        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(dossier.date_creation).toLocaleDateString();

        // Ajouter les cellules à la ligne
        row.appendChild(nomCell);
        row.appendChild(descriptionCell);
        row.appendChild(dateCell);

        // Ajouter la ligne au tableau
        dossierList.appendChild(row);  // Assure-toi que tu utilises appendChild et non innerHTML = ''
    });
};


// Détection du scroll pour charger plus de dossiers
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        chargerDossiers();
    }
});

// Charger les premiers dossiers au démarrage
chargerDossiers();

document.getElementById('logoutButton').addEventListener('click', () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('token');
    // Rediriger vers la page de connexion
    window.location.href = 'login.html';
});


window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        chargerDossiers();
    }
});


