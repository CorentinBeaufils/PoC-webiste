let currentPage = 1;
let isLoading = false;
let hasMoreSuppliers = true;
let selectedRow = null;

async function loadSuppliers(page = 1, filterType = '', filterValue = '') {
    if (isLoading || !hasMoreSuppliers) return;
    isLoading = true;

    try {
        const response = await fetch(`/api/suppliers?page=${page}&limit=10&filterType=${filterType}&filterValue=${filterValue}`);
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des fournisseurs.');
        }

        const suppliers = await response.json();
        if (suppliers.length < 10) {
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
                    <button class="delete-button">Delete</button>
                </td>
            `;
            row.addEventListener('click', () => {
                row.classList.add('selected');
                selectedRow = row;
                window.location.href = `/edit-supplier/${supplier.id}`;
            });
            // Ajouter un gestionnaire d'événements pour le bouton "Delete"
            const deleteButton = row.querySelector('.delete-button');
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
    try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du fournisseur.');
        }
        console.log(`Fournisseur avec l'ID ${supplierId} supprimé.`);
        // Recharger la liste des fournisseurs après la suppression
        loadSuppliers(1);
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