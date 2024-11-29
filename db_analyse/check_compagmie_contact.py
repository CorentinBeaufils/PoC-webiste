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

    # Créer la table compagny_contacts si elle n'existe pas déjà
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS compagny_contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            supplier_id INT,
            name VARCHAR(255),
            mobile VARCHAR(255),
            contact_function VARCHAR(255),
            email VARCHAR(255),
            direct_phone VARCHAR(255),
            department VARCHAR(255),
            FOREIGN KEY (company_id) REFERENCES companies(id)
        )
    ''')

    # Insérer les contacts associés à chaque compagnie
    for index, row in df.iterrows():
        # Récupérer l'identifiant de la compagnie
        cursor.execute('SELECT id FROM companies WHERE company_name = %s', (row['Company'],))
        result = cursor.fetchone()
        cursor.fetchall()
        if result:
            company_id = result[0]
            cursor.execute('''
                INSERT INTO compagny_contacts (company_id, name, mobile, contact_function, email, direct_phone, department)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (
                company_id,
                row['CO_Customer_Contacts::Name_Complet_Including_Title'],
                row['CO_Customer_Contacts::Mobile'],
                row['CO_Customer_Contacts::Fonction'],
                row['CO_Customer_Contacts::Email_Main'],
                row['CO_Customer_Contacts::Direct Tel'],
                row['CO_Customer_Contacts::Department']
            ))
        else:
            print(f"Company '{row['Company']}' not found in the companies table.")

    # Valider les transactions et fermer la connexion
    conn.commit()
    cursor.close()
    conn.close()

    print("Les contacts ont été insérés dans la table 'compagny_contacts' et associés aux compagnies existantes.")

# Chemin vers votre fichier Excel d'entrée
input_file_path = 'C:/Users/trice/Documents/contacts.xlsx'

# Appeler la fonction pour insérer les contacts
insert_contacts(input_file_path)