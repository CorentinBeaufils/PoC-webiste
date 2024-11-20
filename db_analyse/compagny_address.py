import pandas as pd
import mysql.connector

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/all_addresses.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path, usecols=['Type', 'Address', 'Company'])

# Connexion à la base de données MySQL
conn = mysql.connector.connect(
    host='127.0.0.1',  # Remplacez par votre hôte MySQL
    user='root',  # Remplacez par votre nom d'utilisateur MySQL
    password='123456789',  # Remplacez par votre mot de passe MySQL
    database='PoC'  # Remplacez par votre base de données MySQL
)
cursor = conn.cursor()

# Créer la table company_addresses si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS company_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(255),
        address VARCHAR(255),
        company_id INT,
        FOREIGN KEY (company_id) REFERENCES companies(id)
    )
''')

# Insérer les données dans la table company_addresses
for index, row in df.iterrows():
    # Récupérer l'identifiant de la compagnie
    cursor.execute('SELECT id FROM companies WHERE company_name = %s', (row['Company'],))
    result = cursor.fetchone()
    cursor.fetchall()
    if result:
        company_id = result[0]
        cursor.execute('''
            INSERT INTO company_addresses (type, address, company_id)
            VALUES (%s, %s, %s)
        ''', (row['Type'], row['Address'], company_id))
    else:
        print(f"Company '{row['Company']}' not found in the companies table.")

# Valider les transactions et fermer la connexion
conn.commit()
cursor.close()
conn.close()

print("Les données ont été insérées dans la table 'company_addresses'.")
