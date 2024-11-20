import pandas as pd

# Chemin vers votre fichier Excel
file_path = 'C:/Users/trice/Documents/sf8custommerdb.xlsx'


# Lire le fichier Excel
df = pd.read_excel(file_path)

# Extraire la première ligne
first_row = df.iloc[0]

# Nettoyer les valeurs en supprimant les espaces en début et fin de chaîne
cleaned_first_row = first_row.astype(str).str.strip()

# Filtrer les valeurs qui commencent par "Customer"
customer_values = cleaned_first_row[cleaned_first_row.str.startswith('Customer')]

# Afficher les résultats
print("Values in the first row that start with 'Customer':")
print(customer_values)