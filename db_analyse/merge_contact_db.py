import pandas as pd
import mysql.connector

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/sf8custommerdb.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Colonnes à utiliser
company_column = 'Customer::Company_1_et_2'
contact_columns = [
    'Customer_Main_Address_Number::Number_Type',
    'Customer_Main_Address_Number::Number_Value',
    'Customer_Number::Number_Type',
    'Customer_Number::Number_Value'
]

# Initialiser les variables
company_contacts = {}

# Parcourir les lignes du DataFrame
for index, row in df.iterrows():
    # Si la colonne de la compagnie n'est pas vide, récupérer les informations de contact
    if pd.notna(row[company_column]) and row[company_column] != '':
        company_name = row[company_column]
        contact_info = {
            'Main_Address_Number_Type': row['Customer_Main_Address_Number::Number_Type'],
            'Main_Address_Number_Value': row['Customer_Main_Address_Number::Number_Value'],
            'Number_Type': row['Customer_Number::Number_Type'],
            'Number_Value': row['Customer_Number::Number_Value']
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
    CREATE TABLE IF NOT EXISTS company_contacts_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT,
        contact_type VARCHAR(255),
        contact_value VARCHAR(255),
        FOREIGN KEY (company_id) REFERENCES companies(id)
    )
''')

# Insérer les contacts associés à chaque compagnie
for company, contacts in company_contacts.items():
    # Récupérer l'identifiant de la compagnie
    cursor.execute('SELECT id FROM companies WHERE company_name = %s', (company,))
    result = cursor.fetchone()
    cursor.fetchall()
    if result:
        company_id = result[0]
        unique_contacts = set()
        for contact in contacts:
            # Ajouter les contacts principaux
            if pd.notna(contact['Main_Address_Number_Type']) and pd.notna(contact['Main_Address_Number_Value']):
                unique_contacts.add((contact['Main_Address_Number_Type'], contact['Main_Address_Number_Value']))
            # Ajouter les autres contacts
            if pd.notna(contact['Number_Type']) and pd.notna(contact['Number_Value']):
                unique_contacts.add((contact['Number_Type'], contact['Number_Value']))
        
        # Insérer les contacts uniques dans la base de données
        for contact_type, contact_value in unique_contacts:
            cursor.execute('''
                INSERT INTO company_contacts_methods (company_id, contact_type, contact_value)
                VALUES (%s, %s, %s)
            ''', (
                company_id,
                contact_type,
                contact_value
            ))

# Valider les transactions et fermer la connexion
conn.commit()
cursor.close()
conn.close()

print("Les contacts ont été insérés dans la table 'company_contacts' et associés aux compagnies existantes.")