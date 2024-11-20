import pandas as pd
import mysql.connector

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/sf8custommerdb.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Colonnes à utiliser
company_column = 'Customer::Company_1_et_2'
address_columns = [
    'Customer_Address::Address_Type',
    'Customer_Address::Complete_Address',
    'Customer_Main_Address::Complete_Address'
]

# Initialiser les variables
company_addresses = {}

# Parcourir les lignes du DataFrame
for index, row in df.iterrows():
    # Si la colonne de la compagnie n'est pas vide, récupérer les informations d'adresse
    if pd.notna(row[company_column]) and row[company_column] != '':
        company_name = row[company_column]
        address_info = {col: row[col] for col in address_columns}
        if company_name not in company_addresses:
            company_addresses[company_name] = []
        company_addresses[company_name].append(address_info)

# Connexion à la base de données MySQL
conn = mysql.connector.connect(
    host='127.0.0.1',  # Remplacez par votre hôte MySQL
    user='root',  # Remplacez par votre nom d'utilisateur MySQL
    password='123456789',  # Remplacez par votre mot de passe MySQL
    database='PoC'  # Remplacez par votre base de données MySQL
)
cursor = conn.cursor()

# Créer la table company_address si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS company_address (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT,
        address_type VARCHAR(255),
        complete_address VARCHAR(255),
        main_address VARCHAR(255),
        FOREIGN KEY (company_id) REFERENCES companies(id)
    )
''')

# Insérer les adresses associées à chaque compagnie
for company, addresses in company_addresses.items():
    # Récupérer l'identifiant de la compagnie
    cursor.execute('SELECT id FROM companies WHERE company_name = %s', (company,))
    result = cursor.fetchone()
    cursor.fetchall()
    if result:
        company_id = result[0]
        for address in addresses:
            cursor.execute('''
                INSERT INTO company_address (company_id, address_type, complete_address, main_address)
                VALUES (%s, %s, %s, %s)
            ''', (
                company_id,
                address['Customer_Address::Address_Type'],
                address['Customer_Address::Complete_Address'],
                address['Customer_Main_Address::Complete_Address']
            ))

# Valider les transactions et fermer la connexion
conn.commit()
cursor.close()
conn.close()

print("Les adresses ont été insérées dans la table 'company_address' et associées aux compagnies existantes.")