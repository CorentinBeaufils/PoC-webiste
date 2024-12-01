let currentPage = 1;
let isLoading = false;
let hasMoreSuppliers = true;
let selectedRow = null;

async function loadSuppliers(page = 1, filterType = '', filterValue = '') {
    if (isLoading || !hasMoreSuppliers) return;
    isLoading = true;

    try {
        const response = await fetch(`/api/suppliers?page=${page}&limit=20&filterType=${filterType}&filterValue=${filterValue}`);
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des fournisseurs.');
        }

        const suppliers = await response.json();
        if (suppliers.length < 20) {
            hasMoreSuppliers = false; // Arrêter le lazy loading s'il n'y a plus de fournisseurs
        }

        console.log('Fournisseurs récupérés:', suppliers);
        const supplierTableBody = document.getElementById('supplierTableBody');
        if (page === 1) {
            supplierTableBody.innerHTML = ''; // Vider le tableau si c'est la première page
        }
        suppliers.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.supplier_name}</td>
                <td>${supplier.supplier_keywords}</td>
                <td>
                    <button class="deleteButton">Delete</button>
                </td>
            `;
            row.addEventListener('click', () => {
                selectedRow = row;
                window.location.href = `/edit-supplier/${supplier.id}`;
            });
            // Ajouter un gestionnaire d'événements pour le bouton "Delete"
            const deleteButton = row.querySelector('.deleteButton');
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Empêcher la propagation de l'événement de clic
                deleteSupplier(supplier.id);
            });

            supplierTableBody.appendChild(row);
        });
        currentPage = page;
    } catch (error) {
        console.error('Erreur lors du chargement des fournisseurs:', error);
    } finally {
        isLoading = false;
    }
}

async function deleteSupplier(supplierId) {
    // Afficher une alerte de confirmation
    const confirmation = confirm('Are you sure you want to delete this supplier?');
    if (!confirmation) {
        return; // Si l'utilisateur annule, ne pas continuer
    }

    try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
            method: 'DELETE'
        });
        await response;
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du fournisseur.');
        }
        console.log(`Fournisseur avec l'ID ${supplierId} supprimé.`);
        location.reload(); // Recharger la page après la suppression
    } catch (error) {
        console.error('Erreur lors de la suppression du fournisseur:', error);
    }
}

function filterSuppliers() {
    const filterType = document.getElementById('filterType').value;
    const filterValue = document.getElementById('filterValue').value;
    currentPage = 1;
    hasMoreSuppliers = true;
    loadSuppliers(currentPage, filterType, filterValue);
}

async function submitSupplierForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    try {
        const response = await fetch('/api/suppliers', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json',
                'credentials': 'same-origin'
            }
        });
        const result = await response.json();
        if (response.ok) {
            alert('Supplier created successfully');
            console.log('response:', result);
            window.location.href = `/edit-supplier/${result.supplierId}`;
        } else {
            alert('Failed to create supplier.');
        }
    }
    catch (error) {
        console.error('Erreur lors de la création du client:', error);
        alert('Erreur lors de la création du client');
    }
}

// Charger les fournisseurs initiaux
loadSuppliers();

// Event listener pour le lazy scrolling
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMoreSuppliers) {
        const filterType = document.getElementById('filterType').value;
        const filterValue = document.getElementById('filterValue').value;
        loadSuppliers(currentPage + 1, filterType, filterValue);
    }
});