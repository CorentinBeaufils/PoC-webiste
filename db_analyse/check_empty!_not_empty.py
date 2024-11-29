import pandas as pd

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/supplierMain.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Noms des colonnes à comparer
column1 = 'Supplier::Creation date'  # Remplacez par le nom de la première colonne
column2 = 'Supplier::Supplier 1'  # Remplacez par le nom de la deuxième colonne

# Vérifier si les colonnes existent dans le DataFrame
if column1 not in df.columns or column2 not in df.columns:
    print(f"One or both columns '{column1}' and '{column2}' do not exist in the file.")
else:
    # Filtrer les lignes où une colonne est pleine et l'autre est vide
    condition = (df[column1].notna() & (df[column1] != '') & (df[column2].isna() | (df[column2] == ''))) | \
                ((df[column1].isna() | (df[column1] == '')) & df[column2].notna() & (df[column2] != ''))
    differences = df[condition]

    # Afficher les résultats
    if not differences.empty:
        print(f"Differences found between columns '{column1}' and '{column2}':")
        print(differences[[column1, column2]])
    else:
        print(f"No differences found between columns '{column1}' and '{column2}'.")