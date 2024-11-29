import pandas as pd

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/supplierMain.xlsx'
output_file_path = 'C:/Users/trice/Documents/supplier_all_addresses.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Colonnes à utiliser
address_type_column = 'Supplier_Address::Address_Type'
complete_address_column = 'Supplier_Address::Complete_Address'
main_address_column = 'Supplier_Main_Address::Complete_Address'
company_column = 'Supplier::Supplier 1'

# Nettoyer les données en supprimant les espaces blancs et en remplissant les cellules vides
df[company_column] = df[company_column].str.strip().fillna(method='ffill')

# Préparer les données pour le fichier de sortie
output_data = []

# Ajouter les lignes où les adresses sont identiques
matched_rows = df[(df[complete_address_column] == df[main_address_column]) & pd.notna(df[address_type_column]) & (df[address_type_column] != '')]
for index, row in matched_rows.iterrows():
    output_data.append({
        'Type': row[address_type_column],
        'Address': row[complete_address_column],
        'Company': row[company_column]
    })

# Ajouter toutes les autres lignes
for index, row in df.iterrows():
    if row[complete_address_column] != row[main_address_column] and pd.notna(row[address_type_column]) and row[address_type_column] != '':
        output_data.append({
            'Type': row[address_type_column],
            'Address': row[complete_address_column],
            'Company': row[company_column]
        })

# Créer un DataFrame pour les données de sortie
output_df = pd.DataFrame(output_data)

# Écrire les données dans un nouveau fichier Excel
output_df.to_excel(output_file_path, index=False)

print(f"Toutes les adresses ont été copiées dans le fichier '{output_file_path}'.")