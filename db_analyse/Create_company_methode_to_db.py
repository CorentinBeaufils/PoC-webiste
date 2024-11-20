import pandas as pd
import mysql.connector

def insert_communication_methods(file_path):
    # Lire le fichier Excel
    df = pd.read_excel(file_path)

    # Connexion à la base de données MySQL
    conn = mysql.connector.connect(
        host='127.0.0.1',  # Remplacez par votre hôte MySQL
        user='root',  # Remplacez par votre nom d'utilisateur MySQL
        password='123456789',  # Remplacez par votre mot de passe MySQL
        database='PoC'  # Remplacez par votre base de données MySQL
    )
    cursor = conn.cursor()

    # Créer la table company_contacts_methods si elle n'existe pas déjà
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS company_contacts_methods (
            id INT AUTO_INCREMENT PRIMARY KEY,
            contact_type VARCHAR(255),
            contact_value VARCHAR(255),
            company_id INT,
            FOREIGN KEY (company_id) REFERENCES companies(id)
        )
    ''')

    # Insérer les moyens de communication dans la table company_contacts_methods
    for index, row in df.iterrows():
        # Récupérer l'identifiant de la compagnie
        cursor.execute('SELECT id FROM companies WHERE company_name = %s', (row['Company'],))
        result = cursor.fetchone()
        cursor.fetchall()
        if result:
            company_id = result[0]
            cursor.execute('''
                INSERT INTO company_contacts_methods (contact_type, contact_value, company_id)
                VALUES (%s, %s, %s)
            ''', (row['Number_Type'], row['Number_Value'], company_id))
        else:
            print(f"Company '{row['Company']}' not found in the companies table.")

    # Valider les transactions et fermer la connexion
    conn.commit()
    cursor.close()
    conn.close()

    print("Les moyens de communication ont été insérés dans la table 'company_contacts_methods'.")

# Chemin vers votre fichier Excel d'entrée
input_file_path = 'C:/Users/trice/Documents/processed_contacts.xlsx'

# Appeler la fonction pour insérer les moyens de communication
insert_communication_methods(input_file_path)