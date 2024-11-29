import pandas as pd
import mysql.connector

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/supplier_all_addresses.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path, usecols=['Type', 'Address', 'Company'])

# Remplacer les valeurs NaN par des chaînes vides ou des valeurs par défaut
df = df.fillna({
    'Type': '',
    'Address': '',
    'Company': ''
})

# Connexion à la base de données MySQL
conn = mysql.connector.connect(
    host='127.0.0.1',  # Remplacez par votre hôte MySQL
    user='root',  # Remplacez par votre nom d'utilisateur MySQL
    password='123456789',  # Remplacez par votre mot de passe MySQL
    database='PoC'  # Remplacez par votre base de données MySQL
)
cursor = conn.cursor()

# Créer la table supplier_addresses si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS supplier_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(255),
        address VARCHAR(255),
        supplier_id INT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
    )
''')

# Insérer les données dans la table supplier_addresses
for index, row in df.iterrows():
    # Récupérer l'identifiant de la compagnie
    cursor.execute('SELECT id FROM suppliers WHERE supplier_name LIKE %s', ('%' + row['Company'] + '%',))
    result = cursor.fetchone()
    if result:
        company_id = result[0]
        cursor.execute('''
            INSERT INTO supplier_addresses (type, address, supplier_id)
            VALUES (%s, %s, %s)
        ''', (row['Type'], row['Address'], company_id))
    else:
        print(f"Company '{row['Company']}' not found in the suppliers table.")

# Valider les transactions et fermer la connexion
conn.commit()
cursor.close()
conn.close()

print("Les données ont été insérées dans la table 'supplier_addresses'.")