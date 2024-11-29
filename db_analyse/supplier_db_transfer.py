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

# Créer la table suppliers si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_name VARCHAR(255) UNIQUE,
        creation_date DATETIME,
        created_by VARCHAR(255),
        supplier_nickname VARCHAR(255),
        modification_date DATETIME
    )
''')

# Insérer les données dans la table suppliers
inserted_count = 0
excpeted_count = 0
for index, row in filtered_df.iterrows():
    try:
        cursor.execute('''
            INSERT INTO suppliers (supplier_name, creation_date, created_by, supplier_nickname, modification_date)
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
    cursor.fetchall()
    
# Afficher le nombre de lignes insérées
print(f"Nombre de lignes insérées : {inserted_count}")
print(f"Nombre de lignes exclues : {excpeted_count}")
# Calculer le nombre de lignes exclues par le filtre
total_rows = len(df)
filtered_rows = len(filtered_df)
excluded_rows = total_rows - filtered_rows

# Afficher le nombre de lignes filtrées et exclues
print(f"Nombre total de lignes : {total_rows}")
print(f"Nombre de lignes filtrées : {filtered_rows}")
print(f"Nombre de lignes exclues : {excluded_rows}")

# Valider les transactions et fermer la connexion
conn.commit()
cursor.close()
conn.close()

print("Les données ont été insérées dans la table 'suppliers'.")