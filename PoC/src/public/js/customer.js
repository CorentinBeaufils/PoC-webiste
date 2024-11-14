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
        showMessage('Erreur lors du chargement des détails du client:', true);
    }
}

function displayCustomerList(customers) {
    const customerListContainer = document.getElementById('customerContainer');
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
        <p><strong>Nom :</strong> <span id="customerName">${customer.name}</span></p>
        <p><strong>Notes :</strong> <span id="customerNotes">${customer.notes}</span></p>
        <button onclick="editCustomerInfo()">Modifier</button>
    `;

    // Affichage des adresses
    const addressesContainer = document.getElementById('detailsAddressesContainer');
    addressesContainer.innerHTML = '';
    if (customer.addresses && Array.isArray(customer.addresses)) {
        console.log('Addresses: ', customer.addresses);
        customer.addresses.forEach((address, index) => {
            const addressDiv = document.createElement('div');
            addressDiv.classList.add('address-block');
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
            contactDiv.classList.add('contact-block');
            contactDiv.innerHTML = `
                <p><strong>Nom :</strong> ${contact.name}</p>
                <p><strong>Téléphone :</strong> ${contact.phone_number}</p>
                <p><strong>Email :</strong> ${contact.email}</p>
                <p><strong>Téléphone Direct :</strong> ${contact.direct_phone}</p>
                <button onclick="editContact(${index})">Modifier</button>
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
            methodDiv.classList.add("communication-method-block");
            methodDiv.innerHTML = `
                <p><strong>Type :</strong> ${method.method_type}</p>
                <p><strong>Détails :</strong> ${method.details}</p>
                <button onclick="editCommunicationMethod(${index})">Modifier</button>
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

function editCustomerInfo() {
    const customerInfo = document.getElementById('detailsCustomerInfo');
    customerInfo.innerHTML = `
        <label for="editCustomerName">Nom :</label>
        <input type="text" id="editCustomerName" value="${currentCustomer.name}" required>

        <label for="editCustomerNotes">Notes :</label>
        <textarea id="editCustomerNotes">${currentCustomer.notes}</textarea>

        <button onclick="saveCustomerInfo()">Enregistrer</button>
        <button onclick="cancelEditCustomerInfo()">Annuler</button>
    `;
}

function saveCustomerInfo() {
    const newName = document.getElementById('editCustomerName').value;
    const newNotes = document.getElementById('editCustomerNotes').value;

    currentCustomer.name = newName;
    currentCustomer.notes = newNotes;

    // Envoyer les données mises à jour au serveur
    fetch(`/api/customers/${currentCustomer.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentCustomer)
    })
        .then(response => {
            if (response.ok) {
                displayCustomerDetails(currentCustomer);
                showMessage('Informations du client mises à jour avec succès.');
            } else {
                showMessage('Erreur lors de la mise à jour des informations du client.', true);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour des informations du client:', error);
            showMessage('Erreur lors de la mise à jour des informations du client.', true);
        });
}

function cancelEditCustomerInfo() {
    displayCustomerDetails(currentCustomer);
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
        <button onclick="cancelEditAddress(this)">Annuler</button>
        
    `;
    document.getElementById('detailsAddressesContainer').appendChild(addressBlock);
}

function saveNewAddress(button) {
    const addressBlock = button.parentElement;

    const newAddress = {
        type: normalizeFieldValue(addressBlock.querySelector('select[name="type"]').value),
        address_line1: normalizeFieldValue(addressBlock.querySelector('input[name="address_line1"]').value),
        address_line2: normalizeFieldValue(addressBlock.querySelector('input[name="address_line2"]').value),
        city: normalizeFieldValue(addressBlock.querySelector('input[name="city"]').value),
        state: normalizeFieldValue(addressBlock.querySelector('input[name="state"]').value),
        zip_code: normalizeFieldValue(addressBlock.querySelector('input[name="zip_code"]').value),
        country: normalizeFieldValue(addressBlock.querySelector('input[name="country"]').value)
    };

    // Envoyer les données de la nouvelle adresse au serveur
    fetch(`/api/customers/${currentCustomer.id}/addresses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAddress)
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                // Ajoutez la nouvelle adresse à l'objet customer avec l'ID retourné par le serveur
                newAddress.id = data.id;
                currentCustomer.addresses.push(newAddress);

                // Réaffichez les détails du client
                displayCustomerDetails(currentCustomer);
                showMessage('Nouvelle adresse ajoutée avec succès.');
            } else {
                showMessage('Erreur lors de l\'ajout de la nouvelle adresse.', true);
            }
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout de la nouvelle adresse:', error);
            showMessage('Erreur lors de l\'ajout de la nouvelle adresse.', true);
        });
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
        <button onclick="cancelEditAddress(${index})">Annuler</button>
        ${address.type !== 'main' ? `<button onclick="removeAddress(${index})">Supprimer</button>` : ''}
    `;
}

function saveAddress(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    const addressesContainer = document.getElementById('detailsAddressesContainer');
    const addressDiv = addressesContainer.children[index];
    const addressId = customer.addresses[index].id; // Assurez-vous que chaque adresse a un identifiant unique

    const updatedAddress = {
        type: customer.addresses[index].type, // Ne pas permettre la modification du type
        address_line1: normalizeFieldValue(addressDiv.querySelector('input[name="address_line1"]').value),
        address_line2: normalizeFieldValue(addressDiv.querySelector('input[name="address_line2"]').value),
        city: normalizeFieldValue(addressDiv.querySelector('input[name="city"]').value),
        state: normalizeFieldValue(addressDiv.querySelector('input[name="state"]').value),
        zip_code: normalizeFieldValue(addressDiv.querySelector('input[name="zip_code"]').value),
        country: normalizeFieldValue(addressDiv.querySelector('input[name="country"]').value)
    };

    // Mettez à jour l'adresse dans l'objet customer
    customer.addresses[index] = updatedAddress;

    // Envoyer les données mises à jour au serveur
    fetch(`/api/customers/${customer.id}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedAddress)
    })
        .then(response => {
            if (response.ok) {
                displayCustomerDetails(customer);
                showMessage('Adresse mise à jour avec succès.');
            } else {
                showMessage('Erreur lors de la mise à jour de l\'adresse.', true);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour de l\'adresse:', error);
            showMessage('Erreur lors de la mise à jour de l\'adresse.', true);
        });
}

function cancelEditAddress(index) {
    displayCustomerDetails(currentCustomer);
}

function removeAddress(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    const addressId = customer.addresses[index].id; // Assurez-vous que chaque adresse a un identifiant unique

    if (customer.addresses[index].type === 'main') {
        alert("Vous ne pouvez pas supprimer l'adresse principale.");
        return;
    }

    // Envoyer la requête de suppression au serveur
    fetch(`/api/customers/${customer.id}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                // Supprimez l'adresse de l'objet customer
                customer.addresses.splice(index, 1);
                displayCustomerDetails(customer);
                showMessage('Adresse supprimée avec succès.');
            } else {
                showMessage('Erreur lors de la suppression de l\'adresse.', true);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la suppression de l\'adresse:', error);
            showMessage('Erreur lors de la suppression de l\'adresse.', true);
        });
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

        <button onclick="saveNewContact(this)">Enregistrer</button>
        <button onclick="removeContactBlock(this)">Annuler</button>
    `;
    document.getElementById('detailsContactsContainer').appendChild(contactBlock);
}

function saveNewContact(button) {
    const contactBlock = button.parentElement;

    const newContact = {
        name: normalizeFieldValue(contactBlock.querySelector('input[name="name"]').value),
        phone_number: normalizeFieldValue(contactBlock.querySelector('input[name="phone_number"]').value),
        email: normalizeFieldValue(contactBlock.querySelector('input[name="email"]').value),
        direct_phone: normalizeFieldValue(contactBlock.querySelector('input[name="direct_phone"]').value)
    };

    // Si direct_phone est null, il prendra la valeur de phone_number et inversement
    if (!newContact.direct_phone) {
        newContact.direct_phone = newContact.phone_number;
    } else if (!newContact.phone_number) {
        newContact.phone_number = newContact.direct_phone;
    }

    // Envoyer les données du nouveau contact au serveur
    fetch(`/api/customers/${currentCustomer.id}/contacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContact)
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                // Ajoutez le nouveau contact à l'objet customer avec l'ID retourné par le serveur
                newContact.id = data.id;
                currentCustomer.contacts.push(newContact);

                // Réaffichez les détails du client
                displayCustomerDetails(currentCustomer);
                showMessage('Nouveau contact ajouté avec succès.');
            } else {
                showMessage('Erreur lors de l\'ajout du nouveau contact.', true);
            }
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout du nouveau contact:', error);
            showMessage('Erreur lors de l\'ajout du nouveau contact.', true);
        });
}

function editContact(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    const contactsContainer = document.getElementById('detailsContactsContainer');
    const contactDiv = contactsContainer.children[index];
    const contact = customer.contacts[index];

    contactDiv.innerHTML = `
        <label>Nom du Contact :</label>
        <input type="text" name="name" value="${contact.name}" required>

        <label>Numéro de Téléphone :</label>
        <input type="tel" name="phone_number" value="${contact.phone_number}">

        <label>Email :</label>
        <input type="email" name="email" value="${contact.email}">

        <label>Téléphone Direct :</label>
        <input type="tel" name="direct_phone" value="${contact.direct_phone}">

        <button onclick="saveContact(${index})">Enregistrer</button>
        <button onclick="cancelEditContact(${index})">Annuler</button>
        <button onclick="removeContact(${index})">Supprimer</button>
    `;
}

function saveContact(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    const contactsContainer = document.getElementById('detailsContactsContainer');
    const contactDiv = contactsContainer.children[index];
    const contactId = customer.contacts[index].id; // Assurez-vous que chaque contact a un identifiant unique

    const updatedContact = {
        name: normalizeFieldValue(contactDiv.querySelector('input[name="name"]').value),
        phone_number: normalizeFieldValue(contactDiv.querySelector('input[name="phone_number"]').value),
        email: normalizeFieldValue(contactDiv.querySelector('input[name="email"]').value),
        direct_phone: normalizeFieldValue(contactDiv.querySelector('input[name="direct_phone"]').value)
    };

    // Si direct_phone est null, il prendra la valeur de phone_number et inversement
    if (!updatedContact.direct_phone) {
        updatedContact.direct_phone = updatedContact.phone_number;
    } else if (!updatedContact.phone_number) {
        updatedContact.phone_number = updatedContact.direct_phone;
    }

    // Mettez à jour le contact dans l'objet customer
    customer.contacts[index] = updatedContact;

    // Envoyer les données mises à jour au serveur
    fetch(`/api/customers/${customer.id}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedContact)
    })
        .then(response => {
            if (response.ok) {
                displayCustomerDetails(customer);
                showMessage('Contact mis à jour avec succès.');
            } else {
                showMessage('Erreur lors de la mise à jour du contact.', true);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du contact:', error);
            showMessage('Erreur lors de la mise à jour du contact.', true);
        });
}

function cancelEditContact(index) {
    displayCustomerDetails(currentCustomer);
}

function removeContact(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    const contactId = customer.contacts[index].id; // Assurez-vous que chaque contact a un identifiant unique

    // Envoyer la requête de suppression au serveur
    fetch(`/api/customers/${customer.id}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                // Supprimez le contact de l'objet customer
                customer.contacts.splice(index, 1);
                displayCustomerDetails(customer);
                showMessage('Contact supprimé avec succès.');
            } else {
                showMessage('Erreur lors de la suppression du contact.', true);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la suppression du contact:', error);
            showMessage('Erreur lors de la suppression du contact.', true);
        });
}

function removeContactBlock(button) {
    const contactBlock = button.parentElement;
    contactBlock.remove();
}

// 6. Gestion des Méthodes de Communication
function addCommunicationMethodBlock() {
    const methodBlock = document.createElement('div');
    methodBlock.classList.add('communication-method-block');
    methodBlock.innerHTML = `
        <label>Type de Méthode :</label>
        <input type="text" name="method_type" required>

        <label>Détails :</label>
        <input type="text" name="details" required>

        <button onclick="saveCommunicationMethod(this)">Enregistrer</button>
        <button onclick="removeCommunicationMethodBlock(this)">Annuler</button>
    `;
    document.getElementById('detailsCommunicationMethodsContainer').appendChild(methodBlock);
}

function removeCommunicationMethodBlock(button) {
    const communicationtBlock = button.parentElement;
    communicationtBlock.remove();
}


function removeCommunicationMethod(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    const methodId = customer.communicationMethods[index].id; // Assurez-vous que chaque méthode de communication a un identifiant unique

    // Envoyer la requête de suppression au serveur
    fetch(`/api/customers/${customer.id}/communicationMethods/${methodId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Supprimez la méthode de communication de l'objet customer
            customer.communicationMethods.splice(index, 1);
            displayCustomerDetails(customer);
            showMessage('Méthode de communication supprimée avec succès.');
        } else {
            showMessage('Erreur lors de la suppression de la méthode de communication.', true);
        }
    })
    .catch(error => {
        console.error('Erreur lors de la suppression de la méthode de communication:', error);
        showMessage('Erreur lors de la suppression de la méthode de communication.', true);
    });
}

function saveCommunicationMethod(button) {
    const methodBlock = button.parentElement;

    const newMethod = {
        method_type: normalizeFieldValue(methodBlock.querySelector('input[name="method_type"]').value),
        details: normalizeFieldValue(methodBlock.querySelector('input[name="details"]').value)
    };

    if (!newMethod.method_type) {
        showMessage('Le type de méthode ne peut pas être vide.', true);
        return;
    }

    // Envoyer les données de la nouvelle méthode de communication au serveur
    fetch(`/api/customers/${currentCustomer.id}/communicationMethods`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMethod)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            // Ajoutez la nouvelle méthode de communication à l'objet customer avec l'ID retourné par le serveur
            newMethod.id = data.id;
            currentCustomer.communicationMethods.push(newMethod);

            // Réaffichez les détails du client
            displayCustomerDetails(currentCustomer);
            showMessage('Nouvelle méthode de communication ajoutée avec succès.');
        } else {
            showMessage('Erreur lors de l\'ajout de la nouvelle méthode de communication.', true);
        }
    })
    .catch(error => {
        console.error('Erreur lors de l\'ajout de la nouvelle méthode de communication:', error);
        showMessage('Erreur lors de l\'ajout de la nouvelle méthode de communication.', true);
    });
}

function editCommunicationMethod(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    const communicationMethodsContainer = document.getElementById('detailsCommunicationMethodsContainer');
    const methodDiv = communicationMethodsContainer.children[index];
    const method = customer.communicationMethods[index];

    methodDiv.innerHTML = `
        <label>Type de Méthode :</label>
        <input type="text" name="method_type" value="${method.method_type}" required>

        <label>Détails :</label>
        <input type="text" name="details" value="${method.details}" required>

        <button onclick="updateCommunicationMethod(${index})">Enregistrer</button>
        <button onclick="cancelEditCommunicationMethod(${index})">Annuler</button>
    `;
}

function updateCommunicationMethod(index) {
    const customer = currentCustomer; // Utiliser la variable globale
    const communicationMethodsContainer = document.getElementById('detailsCommunicationMethodsContainer');
    const methodDiv = communicationMethodsContainer.children[index];
    const methodId = customer.communicationMethods[index].id; // Assurez-vous que chaque méthode de communication a un identifiant unique

    const updatedMethod = {
        method_type: normalizeFieldValue(methodDiv.querySelector('input[name="method_type"]').value),
        details: normalizeFieldValue(methodDiv.querySelector('input[name="details"]').value)
    };

    if (!updatedMethod.method_type) {
        showMessage('Le type de méthode ne peut pas être vide.', true);
        return;
    }

    // Mettez à jour la méthode de communication dans l'objet customer
    customer.communicationMethods[index] = updatedMethod;

    // Envoyer les données mises à jour au serveur
    fetch(`/api/customers/${customer.id}/communicationMethods/${methodId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedMethod)
    })
    .then(response => {
        if (response.ok) {
            displayCustomerDetails(customer);
            showMessage('Méthode de communication mise à jour avec succès.');
        } else {
            showMessage('Erreur lors de la mise à jour de la méthode de communication.', true);
        }
    })
    .catch(error => {
        console.error('Erreur lors de la mise à jour de la méthode de communication:', error);
        showMessage('Erreur lors de la mise à jour de la méthode de communication.', true);
    });
}

function cancelEditCommunicationMethod(index) {
    displayCustomerDetails(currentCustomer);
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