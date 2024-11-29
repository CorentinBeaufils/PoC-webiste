import pandas as pd

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/supplierMain.xlsx'  # Remplacez par le chemin de votre fichier

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Nom de la colonne à vérifier pour les redondances
column_name = 'Supplier::Supplier 1'  # Remplacez par le nom de votre colonne

# Exclure les champs vides
df_non_empty = df[df[column_name].notna() & (df[column_name] != '')]

# Vérifier les redondances
duplicates = df_non_empty[df_non_empty.duplicated(subset=[column_name], keep=False)]

# Compter le nombre d'éléments différents en ignorant les répétitions
unique_count = df_non_empty[column_name].nunique()

# Afficher les valeurs dupliquées
if not duplicates.empty:
    print(f"Redundancies found in column '{column_name}':")
    print(duplicates[[column_name]])
else:
    print(f"No redundancies found in column '{column_name}'.")

# Afficher le nombre d'éléments différents
print(f"Number of different elements in column '{column_name}': {unique_count}")