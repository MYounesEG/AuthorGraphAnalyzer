import pandas as pd
from os import listdir

class ReadExcelFile:
    def __init__(self, excel_file):
        """
        Initialize the class with the Excel file path and column configuration.
        :param excel_file: Path to the Excel file.
        """
        self.df = pd.read_excel(excel_file)
        self.columns_config = ['orcid', 'doi', 'author_position', 'author_name', 'coauthors']

    def get_data_by_id(self, id_value):
        """
        Extract rows matching the given ID and return data in a structured format.
        :param id_value: The ID to search for.
        :return: List of dictionaries containing the extracted data or an error message.
        """
        result = self.df[self.df['orcid'] == id_value]
        if result.empty:
            return f"ID {id_value} not found in the dataset."

        return [
            {
                column: ([row[column]] if column in self.columns_config else row[column])
                for column in row.index if column != 'orcid'
            }
            for _, row in result.iterrows()
        ]

    def get_all_data(self):
        """
        Extract all data grouped by IDs and return a dictionary structure.
        :return: A dictionary grouping columns by their values for all rows.
        """
        grouped_data = {column: {} for column in self.columns_config}
        for _, row in self.df.iterrows():
            for column in self.columns_config:
                value = row[column]
                if pd.notna(value):  # Avoid NaN values
                    if value not in grouped_data[column]:
                        grouped_data[column][value] = []
                    grouped_data[column][value].append(dict(row))
        return grouped_data

class initializeReader:
    def __init__(self, excel_file):
        """
        Initialize the main program, loading data and making it accessible by ID attributes.
        :param excel_file: The Excel file to load.
        """
        self.reader = ReadExcelFile(excel_file)
        self.data = self.reader.get_all_data()

        # Create attributes for each column in columns_config
        for column in self.reader.columns_config:
            setattr(self, column, self.data[column])

# Detect .xlsx files in the current directory
excel_files = [file for file in listdir() if file.endswith('.xlsx')]
if not excel_files:
    raise ValueError("No .xlsx files found in the folder")
excel_file = excel_files[0] if len(excel_files) == 1 else excel_files[int(input("Select file index: ") or 0) - 1]
print(f"Data set selected: {excel_file}")

# Example usage
if __name__ == "__main__":
    obj = initializeReader(excel_file)

    # Access data by ID attributes
    print(obj.orcid.get('0000-0003-0901-5076', "ID not found"))
    
    print("\n\n\n\n!\n\n\n\n\n\n")
    
    print(obj.doi.get('10.1021/jp209208e', "DOI not found"))
