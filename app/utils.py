import pandas as pd
from typing import Dict, List, Union
import ast

class ReadExcelFile:
    def __init__(self, excel_file: str):
        # Use more efficient reading method
        self.df = pd.read_excel(excel_file, dtype={
            'orcid': 'str', 
            'doi': 'str', 
            'author_name': 'str', 
            'coauthors': 'str'
        })
        
        # Pre-allocate dictionaries
        self.orcid: Dict[str, List[dict]] = {}
        self.doi: Dict[str, dict] = {}
        self.coauthors: Dict[str, List[dict]] = {}
        self.connections: Dict[str, List[str]] = {}
        self.name_to_orcid: Dict[str, str] = {}
        
        self._build_lookup_dictionaries()

    def _build_lookup_dictionaries(self):
        # First pass: build name to ORCID mapping
        for _, row in self.df.iterrows():
            author_name = str(row['author_name'])
            orcid = str(row['orcid'])
            
            # Name to ORCID mapping (use first occurrence)
            if author_name not in self.name_to_orcid:
                self.name_to_orcid[author_name] = orcid

        # Second pass: build comprehensive connections
        for _, row in self.df.iterrows():
            author_name = str(row['author_name'])
            orcid = str(row['orcid'])
            doi = str(row['doi'])
            
            # Create record dictionary 
            record = {
                'author_name': author_name,
                'orcid': orcid,
                'doi': doi
            }
            for col in self.df.columns:
                if col not in ['author_name', 'orcid', 'doi']:
                    record[col] = row[col]
            
            # ORCID dictionary
            if orcid not in self.orcid:
                self.orcid[orcid] = []
            self.orcid[orcid].append(record)
            
            # DOI dictionary
            self.doi[doi] = record
            
            # Coauthors handling
            coauthors = row['coauthors']
            if pd.notna(coauthors):
                # Safer parsing of coauthors
                try:
                    # Use ast.literal_eval for safer list parsing
                    coauthors_list = ast.literal_eval(str(coauthors)) if isinstance(coauthors, str) else coauthors
                except:
                    coauthors_list = [coauthors]
                
                # Ensure coauthors_list is a list
                if not isinstance(coauthors_list, list):
                    coauthors_list = [coauthors_list]
                
                # Prepare full list of all authors for this record
                all_authors = [author_name] + [str(ca).strip() for ca in coauthors_list]
                
                # Update connections for each author
                for main_author in all_authors:
                    # Convert main author to ORCID if possible
                    main_author_id = self.name_to_orcid.get(main_author, main_author)
                    
                    # Initialize connections for this author if not exist
                    if main_author_id not in self.connections:
                        self.connections[main_author_id] = []
                    
                    # Add all other authors as connections
                    for other_author in all_authors:
                        if other_author != main_author:
                            # Convert other author to ORCID if possible
                            other_author_id = self.name_to_orcid.get(other_author, other_author)
                            
                            # Add to connections if not already present
                            if other_author_id not in self.connections[main_author_id]:
                                self.connections[main_author_id].append(other_author_id)
                
                # Coauthors dictionary
                for coauthor in all_authors:
                    coauthor_id = self.name_to_orcid.get(coauthor, coauthor)
                    
                    if coauthor_id not in self.coauthors:
                        self.coauthors[coauthor_id] = []
                    self.coauthors[coauthor_id].append(record)

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
    def __init__(self, excel_file: str):
        self.reader = ReadExcelFile(excel_file)
        self.orcid = self.reader.orcid
        self.doi = self.reader.doi
        self.coauthors = self.reader.coauthors
        self.connections = self.reader.connections
        self.name_to_orcid = self.reader.name_to_orcid



# Example usage
if __name__ == "__main__":
    obj = initializeReader("DataSet.xlsx")


    print(obj.connections["0000-0001-7523-0108"])  # printing all the connections of this author (calling by orcid NO NAME)

    print(obj.connections["Charles M Cai"])  # printing all the connections of this coauthos (calling bu name NO ORCID)

    # Demonstrating connections
    print("Connections for each author:")
    for author, connections in obj.connections.items():
        print(f"{author}: {connections}")


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
                if obj.orcid[orcid][0]["author_name"] == coauthor_name:
                    if orcid not in record["orcid"] and obj.orcid[orcid][0]["author_name"] != record["author_name"]:
                        print(record["orcid"])
                        print(record["doi"])
                        print(orcid)
                        result += 1
    print(f"Count of the connected authors = {result}")

