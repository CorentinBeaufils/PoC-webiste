document.addEventListener('DOMContentLoaded', () => {
    const creationDateElement = document.getElementById('creationDate');

    if (creationDateElement) {
        const date = new Date(creationDateElement.textContent);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        creationDateElement.textContent = formattedDate;
    }

    // Récupérer les données du script JSON
    const supplierDataScript = document.getElementById('supplier-data');
    if (supplierDataScript) {
        window.supplierData = JSON.parse(supplierDataScript.textContent);
    }
});

function openModal(modalId, itemId = null) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';

        // Pré-remplir les champs si un itemId est fourni
        if (itemId && window.supplierData) {
            const { addresses, contacts, contactMethods } = window.supplierData;

            if (modalId === 'editAddressModal') {
                // Pré-remplir les champs pour l'adresse
                const address = addresses.find(addr => addr.id === itemId);
                if (address) {
                    document.getElementById('address_id').value = address.id;
                    document.getElementById('address_type').value = address.type;
                    document.getElementById('address_value').value = address.address;
                    document.getElementById('addressModalTitle').textContent = 'Edit Address';
                    document.getElementById('addressFormButton').textContent = 'Save Changes';
                    document.getElementById('addressForm').dataset.method = 'PUT';
                    document.getElementById('addressForm').dataset.url = `/api/supplier-addresses/${address.id}`;
                }
            } else if (modalId === 'editContactModal') {
                // Pré-remplir les champs pour le contact
                const contact = contacts.find(cont => cont.id === itemId);
                if (contact) {
                    document.getElementById('contact_id').value = contact.id;
                    document.getElementById('contact_name').value = contact.name;
                    document.getElementById('contact_mobile').value = contact.mobile;
                    document.getElementById('contact_email').value = contact.email;
                    document.getElementById('contactModalTitle').textContent = 'Edit Contact';
                    document.getElementById('contactFormButton').textContent = 'Save Changes';
                    document.getElementById('contactForm').dataset.method = 'PUT';
                    document.getElementById('contactForm').dataset.url = `/api/supplier-contacts/${contact.id}`;
                }
            } else if (modalId === 'editContactMethodModal') {
                // Pré-remplir les champs pour la méthode de contact
                const method = contactMethods.find(meth => meth.id === itemId);
                if (method) {
                    document.getElementById('contact_method_id').value = method.id;
                    document.getElementById('contact_method_type').value = method.contact_type;
                    document.getElementById('contact_method_value').value = method.contact_value;
                    document.getElementById('contact_method_address_type').value = method.address_type;
                    document.getElementById('contactMethodModalTitle').textContent = 'Edit Contact Method';
                    document.getElementById('contactMethodFormButton').textContent = 'Save Changes';
                    document.getElementById('contactMethodForm').dataset.method = 'PUT';
                    document.getElementById('contactMethodForm').dataset.url = `/api/supplier-contact-methods/${method.id}`;
                }
            }
        } else {
            // Réinitialiser les champs pour l'ajout d'une nouvelle adresse
            if (modalId === 'editAddressModal') {
                document.getElementById('address_id').value = '';
                document.getElementById('address_type').value = '';
                document.getElementById('address_value').value = '';
                document.getElementById('addressModalTitle').textContent = 'Add New Address';
                document.getElementById('addressFormButton').textContent = 'Add Address';
                document.getElementById('addressForm').dataset.method = 'POST';
                document.getElementById('addressForm').dataset.url = '/api/supplier-addresses';
            } else if (modalId === 'editContactModal') {
                document.getElementById('contact_id').value = '';
                document.getElementById('contact_name').value = '';
                document.getElementById('contact_mobile').value = '';
                document.getElementById('contact_email').value = '';
                document.getElementById('contactModalTitle').textContent = 'Add New Contact';
                document.getElementById('contactFormButton').textContent = 'Add Contact';
                document.getElementById('contactForm').dataset.method = 'POST';
                document.getElementById('contactForm').dataset.url = '/api/supplier-contacts';
            } else if (modalId === 'editContactMethodModal') {
                document.getElementById('contact_method_id').value = '';
                document.getElementById('contact_method_type').value = '';
                document.getElementById('contact_method_value'). value = '';
                document.getElementById('contact_method_address_type').value = '';
                document.getElementById('contactMethodModalTitle').textContent = 'Add New Contact Method';
                document.getElementById('contactMethodFormButton').textContent = 'Add Contact Method';
                document.getElementById('contactMethodForm').dataset.method = 'POST';
                document.getElementById('contactMethodForm').dataset.url = '/api/supplier-contact-methods';
            }
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function submitForm(event) {
    event.preventDefault();

    const form = event.target;
    const method = form.dataset.method;
    const url = form.dataset.url;
    const formData = new FormData(form);

    console.log('method:', method);

    fetch(url, {
        method: method,
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'same-origin'
        }
    })
    .then(response => {
        if (response.ok) {
            location.reload(); // Recharger la page après la soumission
        } else {
            alert('Failed to save data.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to save data.');
    });
}

function deleteAddress(addressId) {
    if (confirm('Are you sure you want to delete this address?')) {
        fetch(`/api/supplier-addresses/${addressId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                location.reload(); // Recharger la page après la suppression
            } else {
                alert('Failed to delete address.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete address.');
        });
    }
}

function deleteContact(contactId) {
    if (confirm('Are you sure you want to delete this contact?')) {
        fetch(`/api/supplier-contacts/${contactId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                location.reload(); // Recharger la page après la suppression
            } else {
                alert('Failed to delete contact.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete contact.');
        });
    }
}

function deleteContactMethod(methodId) {
    if (confirm('Are you sure you want to delete this contact method?')) {
        fetch(`/api/supplier-contact-methods/${methodId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                location.reload(); // Recharger la page après la suppression
            } else {
                alert('Failed to delete contact method.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete contact method.');
        });
    }
}