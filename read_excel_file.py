import pandas as pd

class ReadExcelFile:
    def __init__(self, excel_file, columns_config):
        """
        Initialize the class with the Excel file path, dataset, and column configuration.
        
        :param excel_file: Path to the Excel file.
        :param columns_config: An instance of ColumnsConfig.
        """
        self.excel_file = excel_file
        self.df = pd.read_excel(self.excel_file)
        self.columns_config = columns_config

    def get_data_by_id(self, id_value):
        """
        Search for the data by ID and extract specified columns.
        
        :param id_value: The ID to search for.
        :return: List of dictionaries containing data for all rows matching the ID.
        """
        # Search for all rows with the given ID
        result = self.df[self.df['orcid'] == id_value]
        
        if result.empty:
            return f"ID {id_value} not found in the dataset."

        # Prepare the extracted data as a list of dictionaries
        separated_data_list = []
        for _, row in result.iterrows():
            separated_data = {}
            for column in row.index:
                if column != 'orcid':  # Skip the 'orcid' column
                    if column in self.columns_config.columns_to_keep:
                        separated_data[column] = [row[column]]  # Keep as list
                    else:
                        separated_data[column] = row[column]  # Store as normal value
            separated_data_list.append(separated_data)
        
        return separated_data_list
