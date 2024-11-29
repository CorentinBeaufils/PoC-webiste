import pandas as pd
import mysql.connector

def insert_contacts(file_path):
    # Lire le fichier Excel
    df = pd.read_excel(file_path)

    # Remplacer les valeurs NaN par None
    df = df.where(pd.notna(df), None)

    # Connexion à la base de données MySQL
    conn = mysql.connector.connect(
        host='127.0.0.1',  # Remplacez par votre hôte MySQL
        user='root',  # Remplacez par votre nom d'utilisateur MySQL
        password='123456789',  # Remplacez par votre mot de passe MySQL
        database='PoC'  # Remplacez par votre base de données MySQL
    )
    cursor = conn.cursor()

    # Créer la table supplier_contacts si elle n'existe pas déjà
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS supplier_contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            supplier_id INT,
            name VARCHAR(255) NOT NULL,
            mobile VARCHAR(255),
            contact_position VARCHAR(255),
            email VARCHAR(255),
            direct_phone VARCHAR(255),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
        )
    ''')
    nb_inserted = 0
    nb_not_found = 0
    # Insérer les contacts associés à chaque compagnie
    for index, row in df.iterrows():
        # Ignorer les lignes où Supplier_Contacts::Name complet est vide
        if not row['Supplier_Contacts::Name complet']:
            continue
        # Récupérer l'identifiant de la compagnie
        cursor.execute('SELECT id FROM suppliers WHERE supplier_name = %s', (row['Supplier::Supplier 1'],))
        result = cursor.fetchone()
        cursor.fetchall()
        if result:
            supplier_id = result[0]
            cursor.execute('''
                INSERT INTO supplier_contacts (supplier_id, name, mobile, contact_position, email, direct_phone)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                supplier_id,
                row['Supplier_Contacts::Name complet'],
                row['Supplier_Contacts::Mobile'],
                row['Supplier_Contacts::Mobile'],
                row['Supplier_Contacts::Direct E mail'],
                row['Supplier_Contacts::Direct Tel']
            ))
            nb_inserted += 1
        else:
            nb_not_found += 1
            print(f"Company '{row['Supplier::Supplier 1']}' not found in the suppliers table.")

    # Valider les transactions et fermer la connexion
    conn.commit()
    cursor.close()
    conn.close()

    print("Les contacts ont été insérés dans la table 'supplier_contacts' et associés aux compagnies existantes.")
    print(f"Nombre total de lignes dans le fichier Excel : {len(df)}")
    print(f"Nombre de contacts insérés : {nb_inserted}")
    print(f"Nombre de compagnies non trouvées : {nb_not_found}")

# Chemin vers votre fichier Excel d'entrée
input_file_path = 'C:/Users/trice/Documents/supplierMain.xlsx'

# Appeler la fonction pour insérer les contacts
insert_contacts(input_file_path)