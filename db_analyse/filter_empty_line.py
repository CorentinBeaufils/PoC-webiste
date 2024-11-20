import pandas as pd
import re

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/sf8custommerdb.xlsx'

# Lire le fichier Excel
df = pd.read_excel(file_path)

# Nom de la colonne à vérifier
column_to_check = 'RecordStatus'

# Fonction pour vérifier si une valeur suit le format "Record X of Y"
def is_valid_record_status(value):
    if pd.isna(value) or value == '':
        return False
    return bool(re.match(r'^Record \d+ of \d+$', str(value)))

# Fonction pour extraire le numéro de record
def extract_record_number(value):
    match = re.match(r'^Record (\d+) of (\d+)$', str(value))
    if match:
        return int(match.group(1)), int(match.group(2))
    return None, None

# Filtrer les lignes non nulles et non vides
filtered_df = df[df[column_to_check].notna() & (df[column_to_check] != '')]

# Initialiser les variables
invalid_rows = []

# Parcourir les lignes filtrées du DataFrame
for i in range(len(filtered_df) - 1):
    current_value = filtered_df.iloc[i][column_to_check]
    next_value = filtered_df.iloc[i + 1][column_to_check]

    if is_valid_record_status(current_value) and is_valid_record_status(next_value):
        current_record, total_records = extract_record_number(current_value)
        next_record, _ = extract_record_number(next_value)

        if next_record != current_record + 1:
            invalid_rows.append((filtered_df.index[i + 1], next_value))

# Afficher les résultats
if invalid_rows:
    print(f"Lignes où la colonne '{column_to_check}' ne suit pas le format 'Record X+1 of Y':")
    for index, value in invalid_rows:
        print(f"Ligne {index + 2}: {value}")  # +2 pour correspondre à l'index de la ligne Excel (1-based index)
else:
    print(f"Toutes les lignes de la colonne '{column_to_check}' suivent le format 'Record X+1 of Y'.")