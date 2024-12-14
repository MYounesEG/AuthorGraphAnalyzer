from read_excel_file import ReadExcelFile
from columnsConfig import ColumnsConfig

class MainProgram:
    def __init__(self, excel_file, columns_to_keep,id_to_search):
        """
        Initialize the main program with an Excel file and column configuration.
        
        :param excel_file: Path to the Excel file.
        :param columns_to_keep: List of column names to treat as lists.
        """
        self.columns_config = ColumnsConfig(columns_to_keep)
        self.reader = ReadExcelFile(excel_file, self.columns_config)
        self.id_to_search = id_to_search


    def run(self):
        """Run the main program."""
        # Define the ID to search
        # Replace with the ID you want to search
        
        # Extract data for the given ID
        extracted_data_list = self.reader.get_data_by_id(self.id_to_search)
        
        # Display the extracted data
        if isinstance(extracted_data_list, list):  # If data was successfully found
            print(f"\nExtracted Data for ID {self.id_to_search}:\n")
            for index, extracted_data in enumerate(extracted_data_list, start=1):
                print(f"Record {index}:")
                for column, value in extracted_data.items():
                    print(f"  {column}: {value}")
                print()  # Print a blank line for readability
        else:
            print(extracted_data_list)  # Print the error message


# Run the main program
if __name__ == "__main__":
    excel_file = 'veriSet.xlsx'  # Ensure this file is in the correct directory
    columns_to_keep = ['coauthors', 'author_name']  # Define columns to keep as lists
    main_program = MainProgram(excel_file, columns_to_keep)
    main_program.run()
