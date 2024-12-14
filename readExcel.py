import pandas as pd
from os import listdir
from typing import Dict, List, Union

class ReadExcelFile:
    def __init__(self, excel_file: str):
        """
        Initialize the class with the Excel file path and load the DataFrame.
        
        :param excel_file: Path to the Excel file.
        """
        # Read the Excel file
        self.df = pd.read_excel(excel_file)
        
        # Create dictionaries for quick lookup by different identifiers
        self.orcid: Dict[str, List[dict]] = {}
        self.doi: Dict[str, List[dict]] = {}
        
        # Populate the dictionaries
        self._build_lookup_dictionaries()

    def _build_lookup_dictionaries(self):
        """
        Build lookup dictionaries for ORCID and DOI with full record details.
        """
        # Columns to convert to lists
        list_columns = ['orcid', 'doi', 'author_position', 'author_name', 'coauthors']
        
        for _, row in self.df.iterrows():
            # Prepare the record
            record = {
                column: ([row[column]] if column in list_columns else row[column])
                for column in row.index
            }
            
            # Add to ORCID lookup
            orcid = row['orcid']
            if orcid not in self.orcid:
                self.orcid[orcid] = []
            self.orcid[orcid].append(record)
            
            # Add to DOI lookup
            doi = row['doi']
            self.doi[doi] = record

    def get_data_by_id(self, id_type: str, id_value: str) -> Union[List[dict], str]:
        """
        Extract rows matching the given ID and identifier type.
        
        :param id_type: Type of identifier ('orcid' or 'doi')
        :param id_value: The ID to search for
        :return: List of dictionaries containing the extracted data or an error message
        """
        if id_type not in ['orcid', 'doi']:
            return f"Invalid identifier type: {id_type}. Use 'orcid' or 'doi'."
        
        lookup_dict = getattr(self, id_type)
        
        if id_value not in lookup_dict:
            return f"{id_type.upper()} {id_value} not found in the dataset."
        
        return lookup_dict[id_value]

class initializeReader:
    def __init__(self, excel_file: str = None):
        """
        Initialize the main program with an Excel file.
        
        :param excel_file: Optional path to the Excel file. 
                           If not provided, will auto-detect .xlsx files.
        """
        # Detect .xlsx files if no file is provided
        if excel_file is None:
            excel_files = [file for file in listdir() if file.endswith('.xlsx')]
            if not excel_files:
                raise ValueError("No .xlsx files found in the folder")
            excel_file = excel_files[0] if len(excel_files) == 1 else \
                excel_files[int(input("Select file index: ") or 0) - 1]
        
        print(f"Data set selected: {excel_file}")
        
        # Create the reader with the selected file
        self.reader = ReadExcelFile(excel_file)
        
        # Expose dictionaries directly
        self.orcid = self.reader.orcid
        self.doi = self.reader.doi

    def get_data(self, id_type: str, id_value: str):
        """
        Convenience method to get data by ID.
        
        :param id_type: Type of identifier ('orcid' or 'doi')
        :param id_value: The ID to search for
        :return: List of matching records or error message
        """
        return self.reader.get_data_by_id(id_type, id_value)

# Example usage
if __name__ == "__main__":
    # Auto-detect Excel file
    obj = initializeReader()
    
    # Access data by ORCID
    print("\nData by ORCID:")
    print(obj.orcid['0000-0003-0901-5076'])
    print("\n\n\n\n\n\n\n\n")
    # Access data by DOI
    print("\nData by DOI:")
    print(obj.doi['10.1021/jp209208e'])
    print("\n\n\n\n\n\n\n\n")
    
    # Alternative method to get data
    print("\nUsing get_data method:")
    print(obj.get_data('orcid', '0000-0003-0901-5076'))