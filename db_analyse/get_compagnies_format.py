import pandas as pd
import mysql.connector

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/sf8custommerdb.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Colonnes à utiliser
company_column = 'Customer::Company_1_et_2'
fields_to_display = [
    'Date_Creation',
    'Create_By',
    'Date_Modification',
    'Customer::Company_1_et_2',
    'KeyWordCustomerDisplay::Keyword_Value'
]

# Filtrer les lignes où la colonne Customer::Company_1_et_2 est non vide
filtered_df = df[pd.notna(df[company_column]) & (df[company_column] != '')]

# Initialiser les variables
company_info = {}
company_id_counter = 1

# Parcourir les lignes filtrées du DataFrame
for index, row in filtered_df.iterrows():
    company_name = row[company_column]
    if company_name not in company_info:
        company_info[company_name] = {
            'company_id': company_id_counter,
            'Date_Creation': row['Date_Creation'].strftime('%Y-%m-%d') if pd.notna(row['Date_Creation']) else None,
            'Date_Modification': row['Date_Modification'].strftime('%Y-%m-%d') if pd.notna(row['Date_Modification']) else None,
            'Create_By': row['Create_By'],
            'KeyWordCustomerDisplay::Keyword_Value': row['KeyWordCustomerDisplay::Keyword_Value']
        }
        company_id_counter += 1

# Trier les compagnies pour afficher "Rabourdin Industrie" et "Multigate GmbH" à la fin
sorted_companies = sorted(company_info.keys(), key=lambda x: (x in ['Rabourdin Industrie', 'Multigate GmbH'], x))

# Connexion à la base de données MySQL
conn = mysql.connector.connect(
    host='127.0.0.1',  # Remplacez par votre hôte MySQL
    user='root',  # Remplacez par votre nom d'utilisateur MySQL
    password='123456789',  # Remplacez par votre mot de passe MySQL
    database='PoC'  # Remplacez par votre base de données MySQL
)
cursor = conn.cursor()

# Créer la table si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255),
        creation_date DATE,
        modification_date DATE,
        created_by VARCHAR(255),
        keyword VARCHAR(255)
    )
''')

# Insérer les données dans la table
for company in sorted_companies:
    info = company_info[company]
    cursor.execute('''
        INSERT INTO companies (company_name, creation_date, modification_date, created_by, keyword)
        VALUES (%s, %s, %s, %s, %s)
    ''', (
        company,
        info['Date_Creation'],
        info['Date_Modification'],
        info['Create_By'],
        info['KeyWordCustomerDisplay::Keyword_Value']
    ))

# Créer la table company_addresses si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS company_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT,
        type VARCHAR(255),
        address VARCHAR(255),
        FOREIGN KEY (company_id) REFERENCES companies(id)
    )
''')

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/all_addresses.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Colonnes à utiliser
type_column = 'Type'
address_column = 'Address'
company_column = 'Company'

# Insérer les adresses associées à chaque compagnie
for index, row in df.iterrows():
    # Récupérer l'identifiant de la compagnie
    cursor.execute('SELECT id FROM companies WHERE company_name = %s', (row[company_column],))
    result = cursor.fetchone()
    cursor.fetchall()
    if result:
        company_id = result[0]
        cursor.execute('''
            INSERT INTO company_addresses (company_id, type, address)
            VALUES (%s, %s, %s)
        ''', (
            company_id,
            row[type_column],
            row[address_column]
        ))

# Valider les transactions et fermer la connexion
conn.commit()
cursor.close()
conn.close()

print("Les données ont été insérées dans la table 'companies'.")
print("Les adresses ont été insérées dans la table 'company_addresses' et associées aux compagnies existantes.")
