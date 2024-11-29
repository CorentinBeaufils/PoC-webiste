import pandas as pd
import mysql.connector
from datetime import datetime

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/supplierMain.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Ajouter la date de modification actuelle
current_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
df['Date_Modification'] = current_date

# Remplacer les dates de création nulles ou inexistantes par la date actuelle
df['Supplier::Creation date'] = df['Supplier::Creation date'].apply(
    lambda x: current_date if pd.isna(x) else x.strftime('%Y-%m-%d %H:%M:%S')
)

# Filtrer les lignes où la colonne Supplier::Supplier 1 est non vide
filtered_df = df[pd.notna(df['Supplier::Supplier 1']) & (df['Supplier::Supplier 1'] != '')]

# Remplacer les valeurs NaN par des chaînes vides ou des valeurs par défaut
filtered_df = filtered_df.fillna({
    'Supplier::SupplierNickName': '',
    'Create_By': 'Unknown'
})

# Afficher le nombre de lignes filtrées
print(f"Nombre de lignes filtrées : {len(filtered_df)}")

# Connexion à la base de données MySQL
conn = mysql.connector.connect(
    host='127.0.0.1',  # Remplacez par votre hôte MySQL
    user='root',  # Remplacez par votre nom d'utilisateur MySQL
    password='123456789',  # Remplacez par votre mot de passe MySQL
    database='PoC'  # Remplacez par votre base de données MySQL
)
cursor = conn.cursor()

# Créer la table suppliers_2 si elle n'existe pas
cursor.execute('''
    CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_name VARCHAR(255),
        creation_date DATETIME,
        created_by VARCHAR(255),
        supplier_keywords VARCHAR(255),
        modification_date DATETIME
    )
''')

# Insérer les données dans la table suppliers_2
inserted_count = 0
excpeted_count = 0
for index, row in filtered_df.iterrows():
    try:
        cursor.execute('''
            INSERT INTO suppliers (supplier_name, creation_date, created_by, supplier_keywords, modification_date)
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            row['Supplier::Supplier 1'],
            row['Supplier::Creation date'],
            row['Create_By'],
            row['Supplier::SupplierNickName'],
            row['Date_Modification']
        ))
        inserted_count += 1
    except mysql.connector.errors.IntegrityError:
        excpeted_count += 1
        print(f"Duplicate entry found for supplier: {row['Supplier::Supplier 1']}")

# Valider les transactions
conn.commit()

# Afficher le nombre de lignes insérées et exceptées
print(f"Nombre de lignes insérées : {inserted_count}")
print(f"Nombre de lignes exceptées : {excpeted_count}")

# Fermer la connexion
cursor.close()
conn.close()