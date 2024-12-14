from read_excel_file import ReadExcelFile
from columnsConfig import ColumnsConfig

class MainClass:
    def __init__(self, excel_file, columns_config):
        """Initialize the main class and create instances of ReadExcelFile and ColumnsConfig."""
        self.reader = ReadExcelFile(excel_file, columns_config)
    
    def run(self):
        id_to_search = '0000-0002-9907-5795'  # Change this to the ID you want
        extracted_data = self.reader.get_data_by_id(id_to_search)

        # Display the extracted data
        if isinstance(extracted_data, dict):
            print(f"\nExtracted Data for ID {id_to_search}:")
            for column, value in extracted_data.items():
                print(f"{column}: {value}")
        else:
            print(extracted_data)

if __name__ == "__main__":
    excel_file = 'veriSet.xlsx'  # Ensure this file is in your working directory
    
    # Define the columns to keep as lists
    columns_config = ColumnsConfig(columns_to_keep=['author_name', 'coauthors',''])

    main_program = MainClass(excel_file, columns_config)
    main_program.run()
