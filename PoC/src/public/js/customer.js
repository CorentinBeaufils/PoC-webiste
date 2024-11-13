// 1. Importations et Variables Globales
let infos = [];
let addresses = [];
let contacts = [];
let communicationMethods = [];
let currentCustomer = null;

// 2. Fonctions Utilitaires
const showMessage = (message, isError = false) => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.style.color = isError ? 'red' : 'green';
};

function normalizeFieldValue(value) {
    return value.trim() === '' ? null : value;
}

function isBlockEmpty(block) {
    return Object.values(block).every(value => value === null);
}

// 3. Gestion des Clients
async function loadCustomers() {
    console.log('Chargement de la liste des clients...');
    try {
        const response = await fetch('/api/customers');
        if (response.ok) {
            const customers = await response.json();
            displayCustomerList(customers);
        } else {
            showMessage('Erreur lors du chargement des clients.', true);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
        showMessage('Erreur lors du chargement des clients.', true);
    }
}

async function loadCustomerDetails(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();
            console.log('Détails du client:', customer);
            displayCustomerDetails(customer);
        } else {
            showMessage('Erreur lors du chargement des détails du client.', true);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des détails du client:', error);
        showMessage('Erreur lors du chargement des détails du client.', true);
    }
}

function displayCustomerList(customers) {
    const customerListContainer = document.getElementById('customerList');
    customerListContainer.innerHTML = ''; // Réinitialiser la liste

    customers.forEach(customer => {
        const listItem = document.createElement('div');
        listItem.classList.add('customer-item');
        listItem.textContent = customer.name; // Afficher le nom du client

        // Ajouter un gestionnaire de clic pour afficher les détails
        listItem.addEventListener('click', () => {
            loadCustomerDetails(customer.id); // Charger les détails du client depuis le serveur
        });

        customerListContainer.appendChild(listItem);
    });
}

function displayCustomerDetails(customer) {
    console.log('customer : ', customer);
    currentCustomer = customer; // Stocker l'objet customer dans la variable globale

    // Affichage des infos clients de base
    const customerInfo = document.getElementById('detailsCustomerInfo');
    customerInfo.innerHTML = `
        <p><strong>Nom :</strong> ${customer.name}</p>
        <p><strong>Notes :</strong> ${customer.notes}</p>
    `;

    // Affichage des adresses
    const addressesContainer = document.getElementById('detailsAddressesContainer');
    addressesContainer.innerHTML = '';
    if (customer.addresses && Array.isArray(customer.addresses)) {
        console.log('Addresses: ', customer.addresses);
        customer.addresses.forEach((address, index) => {
            const addressDiv = document.createElement('div');
            addressDiv.classList.add('address-item');
            addressDiv.innerHTML = `
                <p><strong>Type :</strong> ${address.type === 'main' ? 'Principale' : 'Annexe'}</p>
                <p><strong>Adresse :</strong> ${address.address_line1}, ${address.address_line2}, ${address.city}, ${address.state}, ${address.zip_code}, ${address.country}</p>
                <button onclick="editAddress(${index})">Modifier</button>
                ${address.type !== 'main' ? `<button onclick="removeAddress(${index})">Supprimer</button>` : ''}
            `;
            addressesContainer.appendChild(addressDiv);
        });
    } else {
        console.log('No addresses found or addresses is not an array.');
    }

    // Affichage des contacts
    const contactsContainer = document.getElementById('detailsContactsContainer');
    contactsContainer.innerHTML = '';
    if (customer.contacts && Array.isArray(customer.contacts)) {
        console.log('Contacts: ', customer.contacts);
        customer.contacts.forEach((contact, index) => {
            const contactDiv = document.createElement('div');
            contactDiv.classList.add('contact-item');
            contactDiv.innerHTML = `
                <p><strong>Nom :</strong> ${contact.name}</p>
                <p><strong>Téléphone :</strong> ${contact.phone_number}</p>
                <p><strong>Email :</strong> ${contact.email}</p>
                <p><strong>Téléphone Direct :</strong> ${contact.direct_phone}</p>
                <button onclick="removeContact(${index})">Supprimer</button>
            `;
            contactsContainer.appendChild(contactDiv);
        });
    } else {
        console.log('No contacts found or contacts is not an array.');
    }

    // Affichage des méthodes de communication
    const communicationMethodsContainer = document.getElementById('detailsCommunicationMethodsContainer');
    communicationMethodsContainer.innerHTML = '';
    if (customer.communicationMethods && Array.isArray(customer.communicationMethods)) {
        console.log('Communication Methods: ', customer.communicationMethods);
        customer.communicationMethods.forEach((method, index) => {
            const methodDiv = document.createElement('div');
            methodDiv.classList.add('communication-method-item');
            methodDiv.innerHTML = `
                <p><strong>Type :</strong> ${method.method_type}</p>
                <p><strong>Détails :</strong> ${method.details}</p>
                <button onclick="removeCommunicationMethod(${index})">Supprimer</button>
            `;
            communicationMethodsContainer.appendChild(methodDiv);
        });
    } else {
        console.log('No communication methods found or communication methods is not an array.');
    }

    // Afficher les détails du client
    document.getElementById('customerDetails').style.display = 'block';
}

// 4. Gestion des Adresses
function addNewAddressBlock() {
    const addressBlock = document.createElement('div');
    addressBlock.classList.add('address-block');
    addressBlock.innerHTML = `
        <label>Type d'Adresse :</label>
        <select name="type">
            <option value="secondary" selected>Annexe</option>
        </select>

        <label>Adresse Ligne 1 :</label>
        <input type="text" name="address_line1" required>

        <label>Adresse Ligne 2 :</label>
        <input type="text" name="address_line2">

        <label>Ville :</label>
        <input type="text" name="city">

        <label>État :</label>
        <input type="text" name="state">

        <label>Code Postal :</label>
        <input type="text" name="zip_code">

        <label>Pays :</label>
        <input type="text" name="country">

        <button onclick="saveNewAddress(this)">Enregistrer</button>
    `;
    document.getElementById('detailsAddressesContainer').appendChild(addressBlock);
}

function saveNewAddress(button) {
    const addressBlock = button.parentElement;

    const newAddress = {
        type: addressBlock.querySelector('select[name="type"]').value,
        address_line1: addressBlock.querySelector('input[name="address_line1"]').value,
        address_line2: addressBlock.querySelector('input[name="address_line2"]').value,
        city: addressBlock.querySelector('input[name="city"]').value,
        state: addressBlock.querySelector('input[name="state"]').value,
        zip_code: addressBlock.querySelector('input[name="zip_code"]').value,
        country: addressBlock.querySelector('input[name="country"]').value
    };

    // Ajoutez la nouvelle adresse à l'objet customer
    currentCustomer.addresses.push(newAddress);

    // Réaffichez les détails du client
    displayCustomerDetails(currentCustomer);
}

function editAddress(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    const addressesContainer = document.getElementById('detailsAddressesContainer');
    const addressDiv = addressesContainer.children[index];
    const address = customer.addresses[index];

    addressDiv.innerHTML = `
        <label>Type d'Adresse :</label>
        <select name="type" disabled>
            <option value="main" ${address.type === 'main' ? 'selected' : ''}>Principale</option>
            <option value="secondary" ${address.type === 'secondary' ? 'selected' : ''}>Annexe</option>
        </select>

        <label>Adresse Ligne 1 :</label>
        <input type="text" name="address_line1" value="${address.address_line1}" required>

        <label>Adresse Ligne 2 :</label>
        <input type="text" name="address_line2" value="${address.address_line2}">

        <label>Ville :</label>
        <input type="text" name="city" value="${address.city}">

        <label>État :</label>
        <input type="text" name="state" value="${address.state}">

        <label>Code Postal :</label>
        <input type="text" name="zip_code" value="${address.zip_code}">

        <label>Pays :</label>
        <input type="text" name="country" value="${address.country}">

        <button onclick="saveAddress(${index})">Enregistrer</button>
        ${address.type !== 'main' ? `<button onclick="removeAddress(${index})">Supprimer</button>` : ''}
    `;
}

function saveAddress(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    const addressesContainer = document.getElementById('detailsAddressesContainer');
    const addressDiv = addressesContainer.children[index];

    const updatedAddress = {
        type: customer.addresses[index].type, // Ne pas permettre la modification du type
        address_line1: addressDiv.querySelector('input[name="address_line1"]').value,
        address_line2: addressDiv.querySelector('input[name="address_line2"]').value,
        city: addressDiv.querySelector('input[name="city"]').value,
        state: addressDiv.querySelector('input[name="state"]').value,
        zip_code: addressDiv.querySelector('input[name="zip_code"]').value,
        country: addressDiv.querySelector('input[name="country"]').value
    };

    // Mettez à jour l'adresse dans l'objet customer
    customer.addresses[index] = updatedAddress;

    // Réaffichez les détails du client
    displayCustomerDetails(customer);
}

function removeAddress(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    if (customer.addresses[index].type === 'main') {
        alert("Vous ne pouvez pas supprimer l'adresse principale.");
        return;
    }
    customer.addresses.splice(index, 1);
    displayCustomerDetails(customer);
}

// 5. Gestion des Contacts
function addNewContactBlock() {
    const contactBlock = document.createElement('div');
    contactBlock.classList.add('contact-block');
    contactBlock.innerHTML = `
        <label>Nom du Contact :</label>
        <input type="text" name="name" required>

        <label>Numéro de Téléphone :</label>
        <input type="tel" name="phone_number">

        <label>Email :</label>
        <input type="email" name="email">

        <label>Téléphone Direct :</label>
        <input type="tel" name="direct_phone">

        <button onclick="removeContactBlock(this)">Supprimer</button>
    `;
    document.getElementById('detailsContactsContainer').appendChild(contactBlock);
}

function removeContact(index) {
    const contactsContainer = document.getElementById('detailsContactsContainer');
    contactsContainer.removeChild(contactsContainer.children[index]);
}

function removeContactBlock(button) {
    const contactBlock = button.parentElement;
    contactBlock.remove();
}

// 6. Gestion des Méthodes de Communication
function addNewCommunicationMethodBlock() {
    const methodBlock = document.createElement('div');
    methodBlock.classList.add('communication-method-block');
    methodBlock.innerHTML = `
        <label>Type de Méthode :</label>
        <input type="text" name="method_type" required>

        <label>Détails :</label>
        <input type="text" name="details" required>

        <button onclick="saveNewCommunicationMethod(this)">Enregistrer</button>
    `;
    document.getElementById('detailsCommunicationMethodsContainer').appendChild(methodBlock);
}

function saveNewCommunicationMethod(button) {
    const methodBlock = button.parentElement;

    const newMethod = {
        method_type: methodBlock.querySelector('input[name="method_type"]').value,
        details: methodBlock.querySelector('input[name="details"]').value
    };

    // Ajoutez la nouvelle méthode de communication à l'objet customer
    currentCustomer.communicationMethods.push(newMethod);

    // Réaffichez les détails du client
    displayCustomerDetails(currentCustomer);
}

function removeCommunicationMethod(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    customer.communicationMethods.splice(index, 1);
    displayCustomerDetails(customer);
}

// 7. Gestion des Sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('.customer-section');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });

    // Charger la liste des clients si la section 'viewCustomers' est sélectionnée
    if (sectionId === 'viewCustomers') {
        loadCustomers();
    }
}

// 8. Gestion des Formulaires
document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const infosElements = document.querySelectorAll('.info-block');
    infos = Array.from(infosElements).map(infoElement => {
        return {
            name: normalizeFieldValue(infoElement.querySelector('input[name="name"]').value),
            notes: normalizeFieldValue(infoElement.querySelector('input[name="notes"]').value)
        };
    });

    // Envoyer les données au serveur
    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ infos })
        });

        if (response.ok) {
            showMessage('Client enregistré avec succès.');
            loadCustomers();
        } else {
            showMessage('Erreur lors de l\'enregistrement du client.', true);
        }
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du client:', error);
        showMessage('Erreur lors de l\'enregistrement du client.', true);
    }
});

// 9. Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Charger la liste des clients au démarrage
    loadCustomers();
});