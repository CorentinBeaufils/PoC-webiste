import pandas as pd

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/supplierMain.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Noms des colonnes à comparer
column1 = 'Supplier_Address::Complete_Address'  # Remplacez par le nom de la première colonne
column2 = 'Supplier_Main_Address::Complete_Address'  # Remplacez par le nom de la deuxième colonne

# Vérifier si les colonnes existent dans le DataFrame
if column1 not in df.columns or column2 not in df.columns:
    print(f"One or both columns '{column1}' and '{column2}' do not exist in the file.")
else:
    # Filtrer les lignes où les deux colonnes ne sont pas toutes les deux vides ou NaN
    filtered_df = df[~(df[column1].isna() & df[column2].isna()) & ~(df[column1] == '') & ~(df[column2] == '')]

    # Comparer les colonnes
    identical = filtered_df[column1].equals(filtered_df[column2])

    if identical:
        print(f"The columns '{column1}' and '{column2}' are identical (excluding rows where both are empty or NaN).")
    else:
        print(f"The columns '{column1}' and '{column2}' are not identical (excluding rows where both are empty or NaN).")

        # Afficher les différences
        differences = filtered_df[filtered_df[column1] != filtered_df[column2]]
        print("Differences found in the following rows:")
        print(differences[[column1, column2]])