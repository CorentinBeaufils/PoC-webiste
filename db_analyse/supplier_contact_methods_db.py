import pandas as pd
import mysql.connector

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/supplierMain.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Colonnes à utiliser
company_column = 'Supplier::Supplier 1'
contact_columns = [
    'Supplier_Main_Address_Number::Number_Type',
    'Supplier_Main_Address_Number::Number_Value',
    'Supplier_Number::Number_Type',
    'Customer_Number::Number_Value',
    "Supplier_Number::Address_Type"
]

# Initialiser les variables
company_contacts = {}

# Parcourir les lignes du DataFrame
for index, row in df.iterrows():
    # Si la colonne de la compagnie n'est pas vide, récupérer les informations de contact
    if pd.notna(row[company_column]) and row[company_column] != '':
        company_name = row[company_column]
        contact_info = {
            'Main_Address_Number_Type': row['Supplier_Main_Address_Number::Number_Type'],
            'Main_Address_Number_Value': row['Supplier_Main_Address_Number::Number_Value'],
            'Number_Type': row['Supplier_Number::Number_Type'],
            'Number_Value': row['Supplier_Number::Number_Value'],
            'Address_Type': row['Supplier_Number::Address_Type']
        }
        if company_name not in company_contacts:
            company_contacts[company_name] = []
        company_contacts[company_name].append(contact_info)

# Connexion à la base de données MySQL
conn = mysql.connector.connect(
    host='127.0.0.1',  # Remplacez par votre hôte MySQL
    user='root',  # Remplacez par votre nom d'utilisateur MySQL
    password='123456789',  # Remplacez par votre mot de passe MySQL
    database='PoC'  # Remplacez par votre base de données MySQL
)
cursor = conn.cursor()

# Créer la table company_contacts si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS supplier_contact_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT,
        contact_type VARCHAR(255),
        contact_value VARCHAR(255),
        address_type VARCHAR(255),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
    )
''')

# Variables pour les logs
total_rows = len(df)
inserted_count = 0
ignored_count = 0

# Insérer les contacts associés à chaque compagnie
for supplier, contacts in company_contacts.items():
    # Récupérer l'identifiant de la compagnie
    cursor.execute('SELECT id FROM suppliers WHERE supplier_name = %s', (supplier,))
    result = cursor.fetchone()
    cursor.fetchall()
    if result:
        supplier_id = result[0]
        unique_contacts = set()
        for contact in contacts:
            # Ajouter les contacts principaux
            if pd.notna(contact['Main_Address_Number_Type']) and pd.notna(contact['Main_Address_Number_Value']):
                unique_contacts.add((contact['Main_Address_Number_Type'], contact['Main_Address_Number_Value'], contact['Address_Type']))
            # Ajouter les autres contacts
            if pd.notna(contact['Number_Type']) and pd.notna(contact['Number_Value']):
                unique_contacts.add((contact['Number_Type'], contact['Number_Value'], contact['Address_Type']))
        
        # Insérer les contacts uniques dans la base de données
        for contact_type, contact_value, address_type in unique_contacts:
            cursor.execute('''
                INSERT INTO supplier_contact_methods (supplier_id, contact_type, contact_value, address_type)
                VALUES (%s, %s, %s, %s)
            ''', (
                supplier_id,
                contact_type,
                contact_value,
                address_type
            ))
            inserted_count += 1
    else:
        ignored_count += 1
        print(f"Company '{supplier}' not found in the suppliers table.")

# Valider les transactions et fermer la connexion
conn.commit()
cursor.close()
conn.close()

# Afficher les logs
print("Les contacts ont été insérés dans la table 'supplier_contact_methods' et associés aux compagnies existantes.")
print(f"Nombre total de lignes dans le fichier Excel : {total_rows}")
print(f"Nombre de contacts insérés : {inserted_count}")
print(f"Nombre de contacts ignorés : {ignored_count}")