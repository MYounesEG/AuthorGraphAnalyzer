import pandas as pd
from typing import Dict, List, Union

class ReadExcelFile:
    def __init__(self, excel_file: str):
        self.df = pd.read_excel(excel_file)
        self.orcid: Dict[str, List[dict]] = {}
        self.doi: Dict[str, dict] = {}
        self.coauthors: Dict[str, List[dict]] = {}
        self._build_lookup_dictionaries()

    def _build_lookup_dictionaries(self):
        list_columns = ['orcid', 'doi', 'author_position', 'author_name', 'coauthors']
        for _, row in self.df.iterrows():
            record = {
                column: ([row[column]] if column in list_columns else row[column])
                for column in row.index
            }
            # ORCID dictionary
            orcid = row['orcid']
            if orcid not in self.orcid:
                self.orcid[orcid] = []
            self.orcid[orcid].append(record)

            # DOI dictionary
            doi = row['doi']
            self.doi[doi] = record

            # Coauthors dictionary
            coauthors = row['coauthors']
            if pd.notna(coauthors):  # Handle NaN
                # Assuming coauthors are stored as a Python list string in the cell
                coauthors_list = eval(coauthors) if isinstance(coauthors, str) else coauthors
                for coauthor in coauthors_list:
                    coauthor = coauthor.strip()
                    if coauthor not in self.coauthors:
                        self.coauthors[coauthor] = []
                    self.coauthors[coauthor].append(record)

    def get_data_by_id(self, id_type: str, id_value: str) -> Union[str, List[dict]]:
        if id_type not in ['orcid', 'doi', 'author_name']:
            return f"Invalid identifier type: {id_type}. Use 'orcid', 'doi', or 'author_name'."

        if id_type == 'author_name':
            matching_orcids = self.df[self.df['author_name'] == id_value]['orcid']
            if matching_orcids.empty:
                return f"Author name '{id_value}' not found."
            return matching_orcids.iloc[0]

        lookup_dict = getattr(self, id_type)
        if id_value not in lookup_dict:
            return f"{id_type.upper()} {id_value} not found in the dataset."
        return lookup_dict[id_value]

class initializeReader:
    def __init__(self, excel_file: str = None):
        if excel_file is None:
            raise ValueError("Excel file is required")

        self.reader = ReadExcelFile(excel_file)
        self.orcid = self.reader.orcid
        self.doi = self.reader.doi
        self.coauthors = self.reader.coauthors

# Example usage
if __name__ == "__main__":
    # Auto-detect Excel file
    obj = initializeReader("Dataset.xlsx")

    # Access data by ORCID
    print("\nData by ORCID:")
    print(obj.orcid['0000-0003-0901-5076']) # printing all the papers that this author writed with informtion (using author id (orcid) ) 

    print("\n\n\n\n")

    # Access data by DOI
    print("\nData by DOI:")
    print(obj.doi['10.1021/jp209208e']) # printing the paper's informitions
    # Access data by Author Name and get just one ORCID

    print("\n\n\n\n")

    print(obj.coauthors["Mustafa R. Bashir"]) # printing all the papers that this coauthors writed with informtion (using coauthor's name)

    print("\n\n\n\n")

    result = 0

    for coauthor_name, coauthor_records in obj.coauthors.items():
        for record in coauthor_records:
            for orcid, orcid_records in obj.orcid.items():
                if obj.orcid[orcid][0]["author_name"][0] == coauthor_name:
                    if orcid not in record["orcid"] and obj.orcid[orcid][0]["author_name"][0] != record["author_name"][0]:
                        print(record["orcid"])
                        print(record["doi"])
                        print(orcid)
                        result += 1
    print(f"Count of the connected authors = {result}")

