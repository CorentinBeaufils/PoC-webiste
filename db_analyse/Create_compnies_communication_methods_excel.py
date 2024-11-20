import pandas as pd

def process_contacts(file_path, output_path):
    # Lire le fichier Excel
    df = pd.read_excel(file_path, usecols=[
        'Customer_Number::Number_Type',
        'Customer_Number::Number_Value',
        'Customer_Main_Address_Number::Number_Type',
        'Customer_Main_Address_Number::Number_Value',
        'Customer::Company_1_et_2'
    ])

    # Initialiser un DataFrame pour stocker les résultats
    result_df = pd.DataFrame(columns=[
        'Number_Type',
        'Number_Value',
        'Company'
    ])

    # Parcourir les lignes du DataFrame
    for index, row in df.iterrows():
        company = row['Customer::Company_1_et_2']
        
        # Ajouter les contacts de Customer_Number
        if pd.notna(row['Customer_Number::Number_Type']) and pd.notna(row['Customer_Number::Number_Value']):
            new_row = pd.DataFrame({
                'Number_Type': [row['Customer_Number::Number_Type']],
                'Number_Value': [row['Customer_Number::Number_Value']],
                'Company': [company]
            })
            result_df = pd.concat([result_df, new_row], ignore_index=True)
        
        # Ajouter les contacts de Customer_Main_Address_Number
        if pd.notna(row['Customer_Main_Address_Number::Number_Type']) and pd.notna(row['Customer_Main_Address_Number::Number_Value']):
            new_row = pd.DataFrame({
                'Number_Type': [row['Customer_Main_Address_Number::Number_Type']],
                'Number_Value': [row['Customer_Main_Address_Number::Number_Value']],
                'Company': [company]
            })
            result_df = pd.concat([result_df, new_row], ignore_index=True)

    # Supprimer les doublons
    result_df.drop_duplicates(subset=['Number_Type', 'Number_Value', 'Company'], inplace=True)

    # Enregistrer les résultats dans un nouveau fichier Excel
    result_df.to_excel(output_path, index=False)

# Chemin vers votre fichier Excel d'entrée
input_file_path = 'C:/Users/trice/Documents/sf8custommerdb.xlsx'
# Chemin vers votre fichier Excel de sortie
output_file_path = 'C:/Users/trice/Documents/processed_contacts.xlsx'

# Appeler la fonction pour traiter les contacts
process_contacts(input_file_path, output_file_path)

print("Les contacts ont été traités et enregistrés dans le fichier 'processed_contacts.xlsx'.")