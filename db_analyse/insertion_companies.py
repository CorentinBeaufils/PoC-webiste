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

# Filtrer les lignes où la colonne Customer::Company_1_et_2 est non vide et Date_Creation est non nulle
filtered_df = df[pd.notna(df[company_column]) & (df[company_column] != '') & pd.notna(df['Date_Creation'])]

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
    database='PoC'  # Remplacez par le nom de votre base de données
)

cursor = conn.cursor()

# Insérer les données dans la base de données
for company_name, info in company_info.items():
    try:
        cursor.execute('''
            INSERT INTO companies (id, company_name, creation_date, modification_date, created_by, keyword)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (info['company_id'], company_name, info['Date_Creation'], info['Date_Modification'], info['Create_By'], info['KeyWordCustomerDisplay::Keyword_Value']))
    except mysql.connector.errors.IntegrityError:
        print(f"Duplicate entry found for company: {company_name}")

conn.commit()
cursor.close()
conn.close()

print("Les données ont été insérées dans la table 'companies'.")
