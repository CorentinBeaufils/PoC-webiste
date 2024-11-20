//1. global variables
let infos = [];
let addresses = [];
let contacts = [];
let communicationMethods = [];
let currentCustomer = null;
let currentPage = 1;
const limit = 50;
let isLoading = false;
let hasMoreCustomers = true;
let currentFilter = ''; //filter variable by name


// 2.utils
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

//logout function
document.getElementById('logoutButton')?.addEventListener('click', () => {
    fetch('/logout', { method: 'POST' })
        .then(() => {
            window.location.href = '/login';
        })
        .catch(error => {
            console.error('Erreur lors de la déconnexion:', error);
        });
});
// 3. Customer Management
// Function to load and display the list of customers with pagination
async function loadCustomers(filter = '', page = 1, append = false) {
    if (isLoading || !hasMoreCustomers) return;
    isLoading = true;

    try {
        const response = await fetch(`/api/customers?company_name=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
        if (response.ok) {
            const customers = await response.json();
            if (customers.length < limit) {
                hasMoreCustomers = false; // stop lazy loading if there are no more customers
            }
            displayCustomerList(customers, append);
            currentPage = page;
            currentFilter = filter; //update the current filter
        } else {
            showMessage('Erreur lors du chargement des clients.', true);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
        showMessage('Erreur lors du chargement des clients.', true);
    } finally {
        isLoading = false;
    }
}

async function loadCustomerDetails(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();
            console.log('Détails du client:', customer);
            displayCustomerDetails(customer);
            document.getElementById('customerList').style.display = 'none'; // Hide the customer list
        } else {
            showMessage('Erreur lors du chargement des détails du client.', true);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des détails du client:', error);
        showMessage('Erreur lors du chargement des détails du client.', true);
    }
}

// Function to display the list of customers
function displayCustomerList(customers, append) {
    const customerListContainer = document.getElementById('customerContainer');
    if (!append) {
        customerListContainer.innerHTML = ''; // Clear the list of customers
    }

    customers.forEach(customer => {
        const listItem = document.createElement('div');
        listItem.classList.add('customer-item');
        listItem.textContent = customer.company_name; // Display the customer name

        // Add a click event listener to load the customer details
        listItem.addEventListener('click', () => {
            loadCustomerDetails(customer.id); // Load the details of the selected customer
        });

        customerListContainer.appendChild(listItem);
    });
}

// Function to load the next page of customers when scrolling
function filterCustomers() {
    const filterName = document.getElementById('filterName').value;
    hasMoreCustomers = true; // Reset the flag to allow loading more customers
    loadCustomers(filterName);
}

function displayCustomerDetails(customer) {
    console.log('customer details: ', customer);
    currentCustomer = customer; // Store the current customer in a global variable

    // display the customer details
    const customerInfo = document.getElementById('detailsCustomerInfo');
    customerInfo.innerHTML = `
        <p><strong>Nom :</strong> <span id="customerName">${customer.company_name}</span></p>
        <p><strong>Created By :</strong> <span id="customerNotes">${customer.created_by}</span></p>
        <button onclick="editCustomerInfo()">Edit</button>
    `;

    // display the addresses
    const addressesContainer = document.getElementById('detailsAddressesContainer');
    addressesContainer.innerHTML = '';

    if (customer.addresses && Array.isArray(customer.addresses)) {
        console.log('Addresses: ', customer.addresses);
        customer.addresses.forEach((address, index) => {
            addressesContainer.appendChild(createAddressDiv(address, index));
        });
    } else {
        console.log('No addresses found or addresses is not an array.');
    }

    // display the contacts
    const contactsContainer = document.getElementById('detailsContactsContainer');
    contactsContainer.innerHTML = '';

    if (customer.contacts && Array.isArray(customer.contacts)) {
        console.log('Contacts: ', customer.contacts);
        customer.contacts.forEach((contact, index) => {
            contactsContainer.appendChild(createContactDiv(contact, index));
        });
    } else {
        console.log('No contacts found or contacts is not an array.');
    }

    // display the communication methods
    const communicationMethodsContainer = document.getElementById('detailsCommunicationMethodsContainer');
    communicationMethodsContainer.innerHTML = '';

    if (customer.communicationMethods && Array.isArray(customer.communicationMethods)) {
        console.log('Communication Methods: ', customer.communicationMethods);
        customer.communicationMethods.forEach((method, index) => {
            console.log('Method:', method);
            communicationMethodsContainer.appendChild(createCommunicationMethodDiv(method, index));
        });
    } else {
        console.log('No communication methods found or communication methods is not an array.');
    }

    // Show the customer details section
    document.getElementById('customerDetails').style.display = 'block';
}

/**
 * Edits the customer information by replacing the inner HTML of the element
 * with id 'detailsCustomerInfo' with input fields for the customer name and notes.
 * It also adds buttons to save or cancel the changes.
 *
 * The function assumes that there is a global variable `currentCustomer` 
 * which contains the current customer's name and notes.
 */
function editCustomerInfo() {
    const customerInfo = document.getElementById('detailsCustomerInfo');
    customerInfo.innerHTML = `
        <label for="editCustomerName">Nom :</label>
        <input type="text" id="editCustomerName" value="${currentCustomer.company_name}" required>

        <label for="editCustomerNotes">Notes :</label>
        <textarea id="editCustomerNotes">${currentCustomer.created_by}</textarea>

        <button onclick="saveCustomerInfo()">Enregistrer</button>
        <button onclick="cancelEditCustomerInfo()">Annuler</button>
    `;
}

/**
 * Updates the current customer's information with the values from the input fields
 * and sends the updated data to the server.
 *
 * This function retrieves the new customer name and notes from the input fields,
 * updates the currentCustomer object, and sends a PUT request to the server
 * to save the updated information. If the update is successful, it displays
 * the updated customer details and a success message. If there is an error,
 * it logs the error and displays an error message.
 *
 * @function
 */
function saveCustomerInfo() {
    const newName = document.getElementById('editCustomerName').value;
    const newNotes = document.getElementById('editCustomerNotes').value;

    currentCustomer.company_name = newName;
    currentCustomer.created_by = newNotes;

    //send the updated customer data to the server
    fetch(`/api/customers/${currentCustomer.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
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

// 4. address management
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

/**
 * Saves a new address for the current customer.
 *
 * This function retrieves the address details from the input fields within the same parent element as the button,
 * normalizes the values, and sends them to the server to be saved. If the server returns a new address ID,
 * the address is added to the current customer's address list and the customer details are re-displayed.
 * If an error occurs, an error message is shown.
 *
 * @param {HTMLButtonElement} button - The button element that triggered the save action.
 */
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

    // Send the new address data to the server
    fetch(`/api/customers/${currentCustomer.id}/addresses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
        },
        body: JSON.stringify(newAddress)
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                // Add the new address to the customer object with the ID returned by the server
                newAddress.id = data.id;
                currentCustomer.addresses.push(newAddress);

                // Re-display the customer details
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

/**
 * Opens a modal by setting its display style to 'block'.
 *
 * @param {string} modalId - The ID of the modal element to be opened.
 */
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

/**
 * Closes the modal dialog by setting its display style to 'none'.
 *
 * @param {string} modalId - The ID of the modal element to be closed.
 */
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

/**
 * Resets the add address form and sets the address type to "secondary".
 * Then, displays the modal for adding a new address.
 * 
 * Resets the form in the add address modal.
 * Ensures the address type is always set to "secondary".
 * Displays the add address modal.
 */
function addNewAddress() {
    // Reset the add address form
    const form = document.getElementById('addAddressForm');
    form.reset();
    form.elements['type'].value = 'secondary';

    // Display the add address modal
    openModal('addAddressModal');
}

/**
 * Saves a new address by sending the form data to the server.
 * 
 * This function collects the address details from the form with ID 'addAddressForm',
 * sends the data to the server to create a new address for the current customer,
 * and updates the customer object with the new address if the server returns a valid ID.
 * 
 * @function
 * @name saveNewAddress
 * 
 * @example
 * // Call this function when the user submits the form to add a new address
 * saveNewAddress();
 * 
 * @throws Will display an error message if there is an issue adding the new address.
 */
function saveNewAddress() {
    const form = document.getElementById('addAddressForm');

    const newAddress = {
        type: form.elements['type'].value,
        address: form.elements['company-address'].value
    };

    // Send the new address data to the server
    fetch(`/api/customers/${currentCustomer.id}/addresses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
        },
        body: JSON.stringify(newAddress)
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                // Add the new address to the customer object with the ID returned by the server
                newAddress.id = data.id;
                currentCustomer.addresses.push(newAddress);

                // Re-display the customer details
                displayCustomerDetails(currentCustomer);
                showMessage('Nouvelle adresse ajoutée avec succès.');
                closeModal('addAddressModal');
            } else {
                showMessage('Erreur lors de l\'ajout de la nouvelle adresse.', true);
            }
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout de la nouvelle adresse:', error);
            showMessage('Erreur lors de l\'ajout de la nouvelle adresse.', true);
        });
}

/**
 * Edits the address of a customer at the specified index.
 * 
 * This function populates a form within a modal with the address data of the customer.
 * It uses the global variable `currentCustomer` to access the customer's addresses.
 * 
 * @param {number} index - The index of the address to be edited.
 * 
 * The form fields are filled with the address data:
 * - type
 * - address_line1
 * - address_line2
 * - city
 * - state
 * - zip_code
 * - country
 * 
 * The form is given a data attribute `data-index` to store the index of the address.
 * Finally, the modal is displayed.
 */
function editAddress(index) {
    const customer = currentCustomer; // Use the global variable
    const address = customer.addresses[index];

    // Fill the modal form with the address data
    const form = document.getElementById('editAddressForm');
    form.elements['type'].value = address.type;
    form.elements['company-address'].value = address.address;

    // Add a data-index attribute to store the address index
    form.setAttribute('data-index', index);

    // Display the modal
    openModal('editAddressModal');
}

function saveAddress() {
    const form = document.getElementById('editAddressForm');
    const index = form.getAttribute('data-index');
    const customer = currentCustomer; // Utiliser la variable globale
    const addressId = customer.addresses[index].id; // Assurez-vous que chaque adresse a un identifiant unique

    const updatedAddress = {
        type: form.elements['type'].value, // Ne pas permettre la modification du type
        address: form.elements['company-address'].value
    };

    // Mettez à jour l'adresse dans l'objet customer
    customer.addresses[index] = updatedAddress;

    // Envoyer les données mises à jour au serveur
    fetch(`/api/customers/${customer.id}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
        },
        body: JSON.stringify(updatedAddress)
    })
        .then(response => {
            if (response.ok) {
                displayCustomerDetails(customer);
                showMessage('Adresse mise à jour avec succès.');
                closeModal('editAddressModal');
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
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
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

function createAddressTypeSection(address) {
    const addressTypeDiv = document.createElement('div');
    addressTypeDiv.classList.add('address-type');
    addressTypeDiv.innerHTML = `<p>${address.type}</p>`;
    return addressTypeDiv;
}

function createAddressElementsSection(address) {
    const addressElementsDiv = document.createElement('div');
    addressElementsDiv.classList.add('address-elements');

    let addressContent = '';

    addressContent += `<span>${address.address}</span>`;

    addressElementsDiv.innerHTML = addressContent;
    return addressElementsDiv;
}

function createAddressButtonsSection(address, index) {
    const addressButtonsDiv = document.createElement('div');
    addressButtonsDiv.classList.add('address-buttons');
    addressButtonsDiv.innerHTML = `
        ${address.type !== 'main' ? `<button onclick="event.stopPropagation(); removeAddress(${index})">Delete</button>` : ''}
    `;
    return addressButtonsDiv;
}

function createAddressDiv(address, index) {
    const addressDiv = document.createElement('div');
    addressDiv.classList.add('customer-detail-address');

    addressDiv.appendChild(createAddressTypeSection(address));
    addressDiv.appendChild(createAddressElementsSection(address));
    addressDiv.appendChild(createAddressButtonsSection(address, index));

    // Ajouter un gestionnaire d'événements click pour éditer l'adresse
    addressDiv.addEventListener('click', () => {
        editAddress(index);
    });

    return addressDiv;
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
        mobile: normalizeFieldValue(contactBlock.querySelector('input[name="mobile"]').value),
        email: normalizeFieldValue(contactBlock.querySelector('input[name="email"]').value),
        direct_phone: normalizeFieldValue(contactBlock.querySelector('input[name="direct_phone"]').value),
        contact_function: normalizeFieldValue(contactBlock.querySelector('input[name="contact-function"]').value)
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
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
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

function addNewContact() {
    // Réinitialiser le formulaire du modal d'ajout de contact
    const form = document.getElementById('addContactForm');
    form.reset();

    // Afficher le modal
    openModal('addContactModal');
}

function saveNewContact() {
    const form = document.getElementById('addContactForm');

    const newContact = {
        name: form.elements['name'].value,
        phone_number: form.elements['mobile'].value,
        email: form.elements['email'].value,
        direct_phone: form.elements['direct_phone'].value,
        contact_function: form.elements['contact-function'].value
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
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
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
                closeModal('addContactModal');
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
    const contact = customer.contacts[index];
    console.log('contact:', contact);

    // Remplir le formulaire du modal avec les données du contact
    const form = document.getElementById('editContactForm');
    form.elements['name'].value = contact.name;
    form.elements['mobile'].value = contact.mobile;
    form.elements['email'].value = contact.email;
    form.elements['direct_phone'].value = contact.direct_phone;
    form.elements['contact-function'].value = contact.contact_function;

    // Ajouter un attribut data-index pour stocker l'index du contact
    form.setAttribute('data-index', index);

    // Afficher le modal
    openModal('editContactModal');
}

function saveContact() {
    const form = document.getElementById('editContactForm');
    const index = form.getAttribute('data-index');
    const customer = currentCustomer; // Utiliser la variable globale
    const contactId = customer.contacts[index].id; // Assurez-vous que chaque contact a un identifiant unique

    const updatedContact = {
        name: form.elements['name'].value,
        mobile: form.elements['mobile'].value,
        email: form.elements['email'].value,
        direct_phone: form.elements['direct_phone'].value,
        contact_function: form.elements['contact-function'].value
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
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
        },
        body: JSON.stringify(updatedContact)
    })
        .then(response => {
            if (response.ok) {
                displayCustomerDetails(customer);
                showMessage('Contact mis à jour avec succès.');
                closeModal('editContactModal');
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
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
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

function createContactDiv(contact, index) {
    const contactDiv = document.createElement('div');
    contactDiv.classList.add('customer-detail-contact');

    contactDiv.appendChild(createContactNameSection(contact));
    contactDiv.appendChild(createContactDetailsSection(contact));
    contactDiv.appendChild(createContactButtonsSection(contact, index));

    // Ajouter un gestionnaire d'événements click pour éditer le contact
    contactDiv.addEventListener('click', () => {
        editContact(index);
    });

    return contactDiv;
}

function createContactNameSection(contact) {
    const contactNameDiv = document.createElement('div');
    contactNameDiv.classList.add('contact-name');
    contactNameDiv.innerHTML = `<p>${contact.name}</p>`;
    return contactNameDiv;
}

function createContactDetailsSection(contact) {
    const contactDetailsDiv = document.createElement('div');
    contactDetailsDiv.classList.add('contact-details');
    contactDetailsDiv.innerHTML = `
        <p><strong>Function :</strong> ${contact.contact_function}</p>
        <p><strong>Mobile :</strong> ${contact.mobile}</p>
        <p><strong>Email :</strong> ${contact.email}</p>
        <p><strong>Direct Phone :</strong> ${contact.direct_phone}</p>
    `;
    return contactDetailsDiv;
}

function createContactButtonsSection(contact, index) {
    const contactButtonsDiv = document.createElement('div');
    contactButtonsDiv.classList.add('contact-buttons');
    contactButtonsDiv.innerHTML = `
        <button onclick="event.stopPropagation(); removeContact(${index})">Delete</button>
    `;
    return contactButtonsDiv;
}

function createContactHeader() {
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('customer-detail-contact', 'header');

    const nameHeader = document.createElement('div');
    nameHeader.classList.add('contact-name');
    nameHeader.innerHTML = '<strong>Nom</strong>';
    headerDiv.appendChild(nameHeader);

    const detailsHeader = document.createElement('div');
    detailsHeader.classList.add('contact-details');
    detailsHeader.innerHTML = '<strong>Détails</strong>';
    headerDiv.appendChild(detailsHeader);

    const actionHeader = document.createElement('div');
    actionHeader.classList.add('contact-buttons');
    actionHeader.innerHTML = '<strong>Action</strong>';
    headerDiv.appendChild(actionHeader);

    return headerDiv;
}

// 6. Gestion des Méthodes de Communication
/**
 * Adds a new communication method block to the container.
 * This function creates a new block with input fields for method type and details,
 * and appends it to the communication methods container.
 */
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

/**
 * Removes a communication method block from the container.
 *
 * @param {HTMLButtonElement} button - The button element that triggered the remove action.
 */
function removeCommunicationMethodBlock(button) {
    const communicationtBlock = button.parentElement;
    communicationtBlock.remove();
}

/**
 * Removes a communication method from the customer's communication methods.
 * Sends a DELETE request to the server to remove the communication method.
 *
 * @param {number} index - The index of the communication method to be removed.
 */
function removeCommunicationMethod(index) {
    const customer = currentCustomer; // Use the global variable
    const methodId = customer.communicationMethods[index].id; // Ensure each communication method has a unique ID

    // Send the delete request to the server
    fetch(`/api/customers/${customer.id}/communicationMethods/${methodId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
        }
    })
        .then(response => {
            if (response.ok) {
                // Remove the communication method from the customer object
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

/**
 * Saves a new communication method for the current customer.
 * This function retrieves the method details from the input fields within the same parent element as the button,
 * normalizes the values, and sends them to the server to be saved. If the server returns a new method ID,
 * the method is added to the current customer's communication methods list and the customer details are re-displayed.
 * If an error occurs, an error message is shown.
 *
 * @param {HTMLButtonElement} button - The button element that triggered the save action.
 */
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

    // Send the new communication method data to the server
    fetch(`/api/customers/${currentCustomer.id}/communicationMethods`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
        },
        body: JSON.stringify(newMethod)
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                // Add the new communication method to the customer object with the ID returned by the server
                newMethod.id = data.id;
                currentCustomer.communicationMethods.push(newMethod);

                // Re-display the customer details
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

/**
 * Opens the modal to edit a communication method.
 * This function fills the modal form with the communication method data and displays the modal.
 *
 * @param {number} index - The index of the communication method to be edited.
 */
function editCommunicationMethod(index) {
    const customer = currentCustomer; // Use the global variable
    const method = customer.communicationMethods[index];

    // Fill the modal form with the communication method data
    const form = document.getElementById('editCommunicationMethodForm');
    form.elements['contact_type'].value = method.method_type;
    form.elements['contact_value'].value = method.contact_value;

    // Add a data-index attribute to store the index of the communication method
    form.setAttribute('data-index', index);

    // Display the modal
    openModal('editCommunicationMethodModal');
}

/**
 * Saves the edited communication method for the current customer.
 * This function retrieves the updated method details from the modal form,
 * normalizes the values, and sends them to the server to be updated. If the server confirms the update,
 * the method is updated in the current customer's communication methods list and the customer details are re-displayed.
 * If an error occurs, an error message is shown.
 */
function saveCommunicationMethod() {
    const form = document.getElementById('editCommunicationMethodForm');
    const index = form.getAttribute('data-index');
    const customer = currentCustomer; // Use the global variable
    const methodId = customer.communicationMethods[index].id; // Ensure each communication method has a unique ID

    const updatedMethod = {
        method_type: form.elements['contact_type'].value,
        details: form.elements['contact_value'].value
    };

    // Update the communication method in the customer object
    customer.communicationMethods[index] = updatedMethod;

    // Send the updated data to the server
    fetch(`/api/customers/${customer.id}/communicationMethods/${methodId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
        },
        body: JSON.stringify(updatedMethod)
    })
        .then(response => {
            if (response.ok) {
                displayCustomerDetails(customer);
                showMessage('Méthode de communication mise à jour avec succès.');
                closeModal('editCommunicationMethodModal');
            } else {
                showMessage('Erreur lors de la mise à jour de la méthode de communication.', true);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour de la méthode de communication:', error);
            showMessage('Erreur lors de la mise à jour de la méthode de communication.', true);
        });
}

/**
 * Cancels the edit of a communication method and re-displays the customer details.
 */
function cancelEditCommunicationMethod() {
    displayCustomerDetails(currentCustomer);
}

/**
 * Creates a communication method div element with type, details, and buttons sections.
 * Adds a click event listener to edit the communication method when the div is clicked.
 *
 * @param {object} method - The communication method object.
 * @param {number} index - The index of the communication method.
 * @returns {HTMLDivElement} The created communication method div element.
 */
function createCommunicationMethodDiv(method, index) {
    const methodDiv = document.createElement('div');
    methodDiv.classList.add('customer-communication-method');

    methodDiv.appendChild(createCommunicationMethodTypeSection(method));
    methodDiv.appendChild(createCommunicationMethodDetailsSection(method));
    methodDiv.appendChild(createCommunicationMethodButtonsSection(method, index));

    // Add a click event listener to edit the communication method
    methodDiv.addEventListener('click', () => {
        editCommunicationMethod(index);
    });

    return methodDiv;
}

/**
 * Creates a div element for the communication method type section.
 *
 * @param {object} method - The communication method object.
 * @returns {HTMLDivElement} The created communication method type div element.
 */
function createCommunicationMethodTypeSection(method) {
    const methodTypeDiv = document.createElement('div');
    methodTypeDiv.classList.add('customer-communication-method-type');
    methodTypeDiv.innerHTML = `<p><strong>Type :</strong> ${method.contact_type}</p>`;
    return methodTypeDiv;
}

/**
 * Creates a div element for the communication method details section.
 *
 * @param {object} method - The communication method object.
 * @returns {HTMLDivElement} The created communication method details div element.
 */
function createCommunicationMethodDetailsSection(method) {
    const methodDetailsDiv = document.createElement('div');
    methodDetailsDiv.classList.add('customer-communication-method-details');
    methodDetailsDiv.innerHTML = `<p><strong>Détails :</strong> ${method.contact_value}</p>`;
    return methodDetailsDiv;
}

/**
 * Creates a div element for the communication method buttons section.
 * Adds buttons for editing and removing the communication method.
 *
 * @param {object} method - The communication method object.
 * @param {number} index - The index of the communication method.
 * @returns {HTMLDivElement} The created communication method buttons div element.
 */
function createCommunicationMethodButtonsSection(method, index) {
    const methodButtonsDiv = document.createElement('div');
    methodButtonsDiv.classList.add('customer-communication-method-buttons');
    methodButtonsDiv.innerHTML = `
        <button onclick="event.stopPropagation(); removeCommunicationMethod(${index})">Delete</button>
    `;
    return methodButtonsDiv;
}

/**
 * Opens the modal to add a new communication method.
 * Resets the form fields and displays the modal.
 */
function addNewCommunicationMethod() {
    // Reset the form fields
    const form = document.getElementById('addCommunicationMethodForm');
    form.reset();

    // Display the modal
    openModal('addCommunicationMethodModal');
}

/**
 * Saves a new communication method for the current customer.
 * This function retrieves the method details from the modal form,
 * normalizes the values, and sends them to the server to be saved. If the server returns a new method ID,
 * the method is added to the current customer's communication methods list and the customer details are re-displayed.
 * If an error occurs, an error message is shown.
 */
function saveNewCommunicationMethod() {
    const form = document.getElementById('addCommunicationMethodForm');

    const newMethod = {
        contact_type: form.elements['contact_type'].value,
        contact_value: form.elements['contact_value'].value
    };

    // Send the new communication method data to the server
    fetch(`/api/customers/${currentCustomer.id}/communicationMethods`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
        },
        body: JSON.stringify(newMethod)
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                // Add the new communication method to the customer object with the ID returned by the server
                newMethod.id = data.id;
                currentCustomer.communicationMethods.push(newMethod);

                // Re-display the customer details
                displayCustomerDetails(currentCustomer);
                showMessage('Nouvelle méthode de communication ajoutée avec succès.');
                closeModal('addCommunicationMethodModal');
            } else {
                showMessage('Erreur lors de l\'ajout de la nouvelle méthode de communication.', true);
            }
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout de la nouvelle méthode de communication:', error);
            showMessage('Erreur lors de l\'ajout de la nouvelle méthode de communication.', true);
        });
}

// 7. Gestion des Sections
/**
 * Shows the specified section and hides others.
 * If the 'viewCustomers' section is selected, it loads the customer list.
 *
 * @param {string} sectionId - The ID of the section to be displayed.
 */
function showSection(sectionId) {
    const sections = document.querySelectorAll('.customer-section, .sub-section');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });

    // Load the customer list if the 'viewCustomers' section is selected
    if (sectionId === 'viewCustomers') {
        loadCustomers();
        document.getElementById('customerList').style.display = 'block'; // Re-display the customerList section
        document.getElementById('customerDetails').style.display = 'none'; // Hide the customerDetails section
    }
}

// // 8. Gestion des Formulaires
// /**
//  * Handles the form submission for creating or updating a customer.
//  * Collects customer information, addresses, contacts, and communication methods,
//  * and sends the data to the server.
//  */
// document.getElementById('customerForm').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     // Collect basic customer information
//     const infos = {
//         name: normalizeFieldValue(document.getElementById('customerName').value),
//         notes: normalizeFieldValue(document.getElementById('customerNotes').value)
//     };

//     // Collect addresses
//     const addressElements = document.querySelectorAll('#addressesContainer .address-block');
//     const addresses = Array.from(addressElements).map(addressElement => {
//         return {
//             type: normalizeFieldValue(addressElement.querySelector('select[name="type"]').value),
//             address_line1: normalizeFieldValue(addressElement.querySelector('input[name="address_line1"]').value),
//             address_line2: normalizeFieldValue(addressElement.querySelector('input[name="address_line2"]').value),
//             city: normalizeFieldValue(addressElement.querySelector('input[name="city"]').value),
//             state: normalizeFieldValue(addressElement.querySelector('input[name="state"]').value),
//             zip_code: normalizeFieldValue(addressElement.querySelector('input[name="zip_code"]').value),
//             country: normalizeFieldValue(addressElement.querySelector('input[name="country"]').value)
//         };
//     });

//     // Collect contacts
//     const contactElements = document.querySelectorAll('#contactsContainer .contact-block');
//     const contacts = Array.from(contactElements).map(contactElement => {
//         return {
//             name: normalizeFieldValue(contactElement.querySelector('input[name="name"]').value),
//             phone_number: normalizeFieldValue(contactElement.querySelector('input[name="phone_number"]').value),
//             email: normalizeFieldValue(contactElement.querySelector('input[name="email"]').value),
//             direct_phone: normalizeFieldValue(contactElement.querySelector('input[name="direct_phone"]').value)
//         };
//     });

//     // Collect communication methods
//     const methodElements = document.querySelectorAll('#communicationMethodForm .communication-method-block');
//     const communicationMethods = Array.from(methodElements).map(methodElement => {
//         return {
//             method_type: normalizeFieldValue(methodElement.querySelector('input[name="method_type"]').value),
//             details: normalizeFieldValue(methodElement.querySelector('input[name="details"]').value)
//         };
//     });

//     // Send the data to the server
//     try {
//         const response = await fetch('/api/customers', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ infos, addresses, contacts, communicationMethods })
//         });

//         if (response.ok) {
//             showMessage('Client enregistré avec succès.');
//             loadCustomers();
//         } else {
//             showMessage('Erreur lors de l\'enregistrement du client.', true);
//         }
//     } catch (error) {
//         console.error('Erreur lors de l\'enregistrement du client:', error);
//         showMessage('Erreur lors de l\'enregistrement du client.', true);
//     }
// });

document.getElementById('createCustomerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Empêcher le rechargement de la page

    const formData = new FormData(this);
    const customerData = {
        name: normalizeFieldValue(formData.get('name')),
        keyword: normalizeFieldValue(formData.get('keyword'))
    };
    console.log('customerData:', customerData);
    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'credentials': 'same-origin'
            },
            body: JSON.stringify(customerData)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Client créé avec succès');
            showSection('viewCustomers');
            loadCustomerDetails(result.customerId);
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        alert('Erreur lors de la création du client');
    }
});

// 9. Initialisation
/**
 * Initializes the page by loading the customers and setting up the scroll event listener for lazy loading.
 */
document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();

    // Ajouter un écouteur de défilement pour le lazy loading
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            loadCustomers(currentFilter, currentPage + 1, true); // Utiliser le filtre actuel
        }
    });
});