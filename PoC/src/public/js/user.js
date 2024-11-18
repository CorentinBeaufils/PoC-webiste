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
        if (response.ok) {
            document.getElementById('createMessage').textContent = 'Utilisateur créé avec succès.';
            fetchUsers(); // Recharge la liste des utilisateurs
        } else {
            document.getElementById('createMessage').textContent = data.message || 'Erreur lors de la création de l\'utilisateur.';
        }
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
        
        fetchUsers(); // Recharge la liste des utilisateurs
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

// Fonction pour récupérer et afficher les utilisateurs
async function fetchUsers() {
    try {
        const response = await fetch('/get_users', {
            method: 'GET',
            credentials: 'same-origin' // Inclut les cookies de session dans la requête
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des utilisateurs.');
        }

        const users = await response.json();
        console.log("Utilisateurs reçus du serveur :", users); // Affiche les utilisateurs reçus du serveur

        const userList = document.getElementById('users');
        userList.innerHTML = ''; // Vide la liste actuelle des utilisateurs

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.nom}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="openEditModal('${user.nom}', '${user.email}', '${user.role}')" class="userBtn">Modify</button>
                    <button onclick="deleteUser('${user.email}')" class="userBtn">Delete</button>
                </td>
            `;
            userList.appendChild(row);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Fonction pour ouvrir le modal de modification
function openEditModal(nom, email, role) {
    document.getElementById('editNom').value = nom;
    document.getElementById('editEmail').value = email;
    document.getElementById('editNewEmail').value = email;
    document.getElementById('editRole').value = role;
    document.getElementById('editUserModal').style.display = 'block';
}

// Fonction pour fermer le modal de modification
function closeModal() {
    document.getElementById('editUserModal').style.display = 'none';
}

// Gestion de la mise à jour d'un utilisateur
document.getElementById('editUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('editEmail').value;
    const nom = document.getElementById('editNom').value;
    const newEmail = document.getElementById('editNewEmail').value;
    const role = document.getElementById('editRole').value;

    try {
        const response = await fetch('/update_user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                 credentials: 'same-origin' // Inclut les cookies de session dans la requête
            },
            body: JSON.stringify({ email, nom, newEmail, role })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Utilisateur mis à jour avec succès.');
            closeModal();
            fetchUsers(); // Recharge la liste des utilisateurs
        } else {
            alert(data.message || 'Erreur lors de la mise à jour de l\'utilisateur.');
        }
    } catch (error) {
        alert('Erreur lors de la mise à jour de l\'utilisateur.');
        console.error('Erreur:', error);
    }
});

// Fonction pour supprimer un utilisateur
async function deleteUser(email) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        try {
            const response = await fetch(`/supprimer_utilisateur?email=${encodeURIComponent(email)}`, {
                method: 'DELETE',
                credentials: 'same-origin' // Inclut les cookies de session dans la requête
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression.');
            }

            const data = await response.json();
            alert('Utilisateur supprimé avec succès.');
            fetchUsers(); // Recharge la liste des utilisateurs
        } catch (error) {
            alert('Erreur lors de la suppression de l\'utilisateur.');
            console.error('Erreur:', error);
        }
    }
}

// Appel de la fonction pour récupérer et afficher les utilisateurs au chargement de la page
document.addEventListener('DOMContentLoaded', fetchUsers);