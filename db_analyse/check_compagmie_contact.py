import pandas as pd
import mysql.connector

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/sf8custommerdb.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Colonnes à utiliser
company_column = 'Customer::Company_1_et_2'
contact_columns = [
    'CO_Customer_Contacts::Name_Complet_Including_Title',
    'CO_Customer_Contacts::Mobile',
    'CO_Customer_Contacts::Fonction',
    'CO_Customer_Contacts::Email_Main',
    'CO_Customer_Contacts::Direct Tel',
    'CO_Customer_Contacts::Department'
]

# Initialiser les variables
current_company = None
company_contacts = {}
all_nan_lines = []

# Parcourir les lignes du DataFrame
for index, row in df.iterrows():
    # Vérifier si toutes les colonnes de contact sont NaN ou vides
    if all(pd.isna(row[col]) or row[col] == '' for col in contact_columns):
        all_nan_lines.append(index + 2)  # +2 pour correspondre à l'index de la ligne Excel (1-based index)
        continue  # Ignorer cette ligne et passer à la suivante

    # Si la colonne de la compagnie n'est pas vide, mettre à jour la compagnie actuelle
    if pd.notna(row[company_column]) and row[company_column] != '':
        current_company = row[company_column]
        if current_company not in company_contacts:
            company_contacts[current_company] = []

    # Ajouter le contact à la compagnie actuelle
    if current_company:
        contact_info = {col: row[col] for col in contact_columns}
        company_contacts[current_company].append(contact_info)

# Connexion à la base de données MySQL
conn = mysql.connector.connect(
    host='127.0.0.1',  # Remplacez par votre hôte MySQL
    user='root',  # Remplacez par votre nom d'utilisateur MySQL
    password='123456789',  # Remplacez par votre mot de passe MySQL
    database='PoC'  # Remplacez par votre base de données MySQL
)
cursor = conn.cursor()

# Créer la table contacts si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS compagny_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT,
        name VARCHAR(255),
        mobile VARCHAR(255),
        contact_function VARCHAR(255),
        email VARCHAR(255),
        direct_tel VARCHAR(255),
        department VARCHAR(255),
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
        for contact in contacts:
            # Vérifier si toutes les colonnes de contact sont NaN ou vides
            if all(pd.isna(contact[col]) or contact[col] == '' for col in contact_columns):
                continue  # Ignorer ce contact et passer au suivant

            cursor.execute('''
                INSERT INTO compagny_contacts (company_id, name, mobile, contact_function, email, direct_tel, department)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (
                company_id,
                contact['CO_Customer_Contacts::Name_Complet_Including_Title'],
                contact['CO_Customer_Contacts::Mobile'],
                contact['CO_Customer_Contacts::Fonction'],
                contact['CO_Customer_Contacts::Email_Main'],
                contact['CO_Customer_Contacts::Direct Tel'],
                contact['CO_Customer_Contacts::Department']
            ))
            

# Valider les transactions et fermer la connexion
conn.commit()
cursor.close()
conn.close()

print("Les contacts ont été insérés dans la table 'contacts' et associés aux compagnies existantes.")