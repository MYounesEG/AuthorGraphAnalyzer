import pandas as pd

class ReadExcelFile:
    def __init__(self, excel_file, columns_config):
        """Initialize the class with the Excel file path, load the dataset, and the columns configuration."""
        self.excel_file = excel_file
        self.df = pd.read_excel(self.excel_file)
        self.df = self.df.drop_duplicates(subset=['orcid'])
        self.columns_config = columns_config

    def get_data_by_id(self, id_value):
        """Search for the data by ID and extract specified columns."""
        result = self.df[self.df['orcid'] == id_value]
        
        if result.empty:
            return f"ID {id_value} not found in the dataset."
        
        result_data = result.iloc[0]  # Get the first row (since IDs are unique)
        
        # Prepare the extracted data, keeping only specified columns
        separated_data = {}
        for column in result_data.index:
            if column != 'orcid':  # Skip the 'orcid' column
                if column in self.columns_config.columns_to_keep:
                    separated_data[column] = [result_data[column]]  # Keep as list
                else:
                    separated_data[column] = result_data[column]  # Store as normal value
        
        return separated_data
