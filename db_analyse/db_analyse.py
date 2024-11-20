import pandas as pd

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/sf8custommerdb.xlsx'  # Remplacez par le chemin de votre fichier

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Nom de la colonne à vérifier pour les redondances
column_name = 'Customer::Company_1_et_2'  # Remplacez par le nom de votre colonne

# Exclure les champs vides
df_non_empty = df[df[column_name].notna() & (df[column_name] != '')]

# Vérifier les redondances
duplicates = df_non_empty[df_non_empty.duplicated(subset=[column_name], keep=False)]

# Afficher les valeurs dupliquées
if not duplicates.empty:
    print(f"Redundancies found in column '{column_name}':")
    print(duplicates[[column_name]])
else:
    print(f"No redundancies found in column '{column_name}'.")