import pandas as pd

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/sf8custommerdb.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Vérifier toutes les colonnes et compter le nombre de champs non vides
for column in df.columns:
    non_empty_values = df[column].notna() & (df[column] != '')
    non_empty_count = non_empty_values.sum()
    total_count = len(df[column])
    print(f"Column '{column}' has {non_empty_count} non-empty values out of {total_count} total values.")