import displayData as dn

# Define columns to keep
from displayData import ColumnsConfig  # Import the ColumnsConfig class if it’s in the same module

columns_to_keep = ['orcid','doi','author_position','author_name', 'coauthors']  # List of columns you want to keep
column_config = ColumnsConfig(columns_to_keep=columns_to_keep)

# Pass the column_config as a parameter
dn = dn.MainProgram('veriSet.xlsx',columns_to_keep, '0000-0003-0901-5076')
dn.run()

