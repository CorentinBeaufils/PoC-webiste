// Variables pour stocker temporairement les informations des sous-formulaires
let infos = [];
let addresses = [];
let contacts = [];
let communicationMethods = [];

// Fonction pour afficher un message (de succès ou d'erreur)
const showMessage = (message, isError = false) => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.style.color = isError ? 'red' : 'green';
};

// Fonction pour afficher une section et masquer les autres (navigation interne)
function showSection(sectionId) {
    console.log(sectionId);
    const sections = document.querySelectorAll('.customer-section');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });

    // Charger la liste des clients si la section 'viewCustomers' est sélectionnée
    if (sectionId === 'viewCustomers') {
        loadCustomers();
    }
}


async function loadCustomers() {
    console.log('Chargement de la liste des clients...');
    try {
        const response = await fetch('/api/customers');
        if (response.ok) {
            const customers = await response.json();
            console.log('Liste des clients récupérée:', customers);
            displayCustomerList(customers);
        } else {
            showMessage('Erreur lors du chargement des clients.', true);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
        showMessage('Erreur lors du chargement des clients.', true);
    }
}


// Fonction pour charger et afficher les détails d'un client spécifique
async function loadCustomerDetails(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();
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
    const customerContainer = document.getElementById('customerContainer');
    customerContainer.innerHTML = ''; // Effacer la liste précédente

    if (customers.length === 0) {
        customerContainer.innerHTML = '<p>Aucun client trouvé.</p>';
        return;
    }

    customers.forEach(customer => {
        const customerDiv = document.createElement('div');
        customerDiv.classList.add('customer-item');
        customerDiv.textContent = `${customer.name} - Notes: ${customer.notes}`;
        customerDiv.onclick = () => loadCustomerDetails(customer.id); // Charger les détails du client au clic
        customerContainer.appendChild(customerDiv);
    });
}


// Fonction pour afficher les détails du client
function displayCustomerDetails(customer) {
    console.log('customer : ', customer);
    
    //affichage des infos customers basic
    const customerInfo = document.getElementById('detailsCustomerInfo');
    customerInfo.innerHTML = '';
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('info-item');
    infoDiv.innerHTML =`<p><strong>Nom :</strong> ${customer.name} <span class="editable-field" data-key="name"
                            id="detailsCustomerName"></span></p>
                    <p><strong>Notes :</strong> ${customer.notes} <span class="editable-field" data-key="notes"
                            id="detailsCustomerNotes"></span></p>`;
    customerInfo.appendChild(infoDiv);

    // Affichage des adresses
    const addressesContainer = document.getElementById('detailsAddressesContainer');
    addressesContainer.innerHTML = '';
    customer.addresses.forEach(address => {
        const addressDiv = document.createElement('div');
        addressDiv.classList.add('address-item');
        addressDiv.innerHTML = `
            <p><strong>Type :</strong> ${address.type}<span class="editable-field" data-key="contactAddressType"></p>
            <p><strong>Adresse :</strong> ${address.address_line1}, ${address.city}, ${address.zip_code}, ${address.country}<span class="editable-field" data-key="contactAddress"></p>
        `;
        addressesContainer.appendChild(addressDiv);
    });

    // Affichage des contacts
    const contactsContainer = document.getElementById('detailsContactsContainer');
    contactsContainer.innerHTML = '';
    customer.contacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.classList.add('contact-item');
        contactDiv.innerHTML = `
            <p><strong>Nom :</strong> ${contact.name} <span class="editable-field" data-key="contactName"></span></p>
            <p><strong>Téléphone :</strong> ${contact.phone_number}<span class="editable-field" data-key="contactNumber"></span></p>
            <p><strong>Email :</strong> ${contact.email}<span class="editable-field" data-key="contactEmail"></p>
        `;
        contactsContainer.appendChild(contactDiv);
    });

    // Affichage des moyens de communication
    const communicationContainer = document.getElementById('detailsCommunicationContainer');
    communicationContainer.innerHTML = '';
    customer.communicationMethods.forEach(method => {
        const methodDiv = document.createElement('div');
        methodDiv.classList.add('communication-item');
        methodDiv.innerHTML = `
            <p><strong>Type :</strong> ${method.method_type}<span class="editable-field" data-key="contactCommunicationType"></p>
            <p><strong>Détails :</strong> ${method.details}<span class="editable-field" data-key="contactCommunicationDetails"></p>
        `;
        communicationContainer.appendChild(methodDiv);
    });

    document.getElementById('customerDetails').style.display = 'block';
}


// Fonction pour ajouter un nouveau bloc d'adresse annexe
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
    `;
    document.getElementById('addressesContainer').appendChild(addressBlock);
    showMessage('Adresse annexe ajoutée.');
}

// Fonction pour ajouter un nouveau bloc de contact
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
    `;
    document.getElementById('contactsContainer').appendChild(contactBlock);
    showMessage('Nouveau contact ajouté.');
}


//-----------------------------------------------------------------------------------------------------
//button interaction
// Fonction pour activer l'édition des champs
function enableEditing(button) {
    const sectionId = button.getAttribute('data-section');
    const sectionContainer = document.getElementById(sectionId);
    const inputs = sectionContainer.querySelectorAll('.editable-field');

    inputs.forEach(input => {
        if (input.tagName === 'SPAN') {
            const text = input.textContent;
            const inputElement = document.createElement('input');
            inputElement.value = text;
            inputElement.setAttribute('data-original-value', text);
            inputElement.setAttribute('data-key', input.getAttribute('data-key'));
            input.replaceWith(inputElement);
        }
    });

    // Masquer le bouton Edit et afficher le bouton Save
    button.style.display = 'none';
    sectionContainer.querySelector('.saveButton').style.display = 'inline-block';
}


async function saveCustomerDetails(button) {
    const sectionId = button.getAttribute('data-section');
    const sectionContainer = document.querySelector(`[data-section="${sectionId}"]`);
    const updatedData = {};

    const inputs = sectionContainer.querySelectorAll('input');
    inputs.forEach(input => {
        const key = input.getAttribute('data-key');
        updatedData[key] = input.value.trim() || null; // Remplace les valeurs vides par null
    });

    try {
        const customerId = currentCustomerId; // ID du client actuellement affiché
        const response = await fetch(`/api/customers/${customerId}/${sectionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        if (response.ok) {
            alert('Modifications sauvegardées avec succès !');
            inputs.forEach(input => {
                const span = document.createElement('span');
                span.textContent = input.value;
                span.setAttribute('data-key', input.getAttribute('data-key'));
                input.replaceWith(span);
            });

            button.style.display = 'none';
            sectionContainer.querySelector('.editButton').style.display = 'inline-block';
        } else {
            alert('Erreur lors de la sauvegarde des modifications.');
        }
    } catch (error) {
        console.error(`Erreur lors de la sauvegarde des détails de ${sectionId}:`, error);
        alert('Erreur lors de la sauvegarde des modifications.');
    }
}

//-----------------------------------------------------------------------------------------------------
//section des requetes


// Fonction utilitaire pour gérer les champs vides et les convertir en null
function normalizeFieldValue(value) {
    return value.trim() === '' ? null : value;
}


// Fonction pour vérifier si un bloc est vide
function isBlockEmpty(block) {
    // Vérifie si tous les champs de l'objet block sont null ou vides
    return Object.values(block).every(value => value === null);
}

// Modifier la collecte des données pour appliquer la normalisation et le filtrage
document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // // Collecte des informations de base du client
    // const name = normalizeFieldValue(document.getElementById('customerName').value);
    // const notes = normalizeFieldValue(document.getElementById('customerNotes').value);

    const infosElements = document.querySelectorAll('.info-block');
    infos = Array.from(infosElements)
        .map(block => ({
            name: normalizeFieldValue(block.querySelector('input[name="name"]').value),
            notes: normalizeFieldValue(block.querySelector('textarea[name="notes"]').value),
            
        }))
        .filter(block => !isBlockEmpty(block));


    // Collecte des adresses avec normalisation et filtrage des blocs vides
    const addressElements = document.querySelectorAll('.address-block');
    addresses = Array.from(addressElements)
        .map(block => ({
            type: normalizeFieldValue(block.querySelector('select[name="type"]').value),
            address_line1: normalizeFieldValue(block.querySelector('input[name="address_line1"]').value),
            address_line2: normalizeFieldValue(block.querySelector('input[name="address_line2"]').value),
            city: normalizeFieldValue(block.querySelector('input[name="city"]').value),
            state: normalizeFieldValue(block.querySelector('input[name="state"]').value),
            zip_code: normalizeFieldValue(block.querySelector('input[name="zip_code"]').value),
            country: normalizeFieldValue(block.querySelector('input[name="country"]').value)
        }))
        .filter(block => !isBlockEmpty(block));

    // Collecte des contacts avec normalisation et filtrage des blocs vides
    const contactElements = document.querySelectorAll('.contact-block');
    contacts = Array.from(contactElements)
        .map(block => ({
            name: normalizeFieldValue(block.querySelector('input[name="name"]').value),
            phone_number: normalizeFieldValue(block.querySelector('input[name="phone_number"]').value),
            email: normalizeFieldValue(block.querySelector('input[name="email"]').value),
            direct_phone: normalizeFieldValue(block.querySelector('input[name="direct_phone"]').value)
        }))
        .filter(block => !isBlockEmpty(block));

    // Collecte des moyens de communication avec normalisation et filtrage des blocs vides
    const communicationMethodElements = document.querySelectorAll('.communication-method-block');
    communicationMethods = Array.from(communicationMethodElements)
        .map(block => ({
            method_type: normalizeFieldValue(block.querySelector('input[name="method_type"]').value),
            details: normalizeFieldValue(block.querySelector('input[name="details"]').value)
        }))
        .filter(block => !isBlockEmpty(block));

    // Structure des données envoyées vers le serveur
    const customerData = {
        infos,
        addresses,
        contacts,
        communicationMethods
    };
    console.log(customerData);

    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData)
        });

        if (response.ok) {
            showMessage('Client et ses informations créés avec succès.');
            addresses = [];
            contacts = [];
            communicationMethods = [];
            infos = [];
        } else {
            showMessage('Erreur lors de la création du client.', true);
        }
    } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        showMessage('Erreur lors de la création du client.', true);
    }
});


// Fonction pour charger et afficher les détails d'un client spécifique
async function loadCustomerDetails(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();
            displayCustomerDetails(customer);
        } else {
            showMessage('Erreur lors du chargement des détails du client.', true);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des détails du client:', error);
        showMessage('Erreur lors du chargement des détails du client.', true);
    }
}