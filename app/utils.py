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
        self.connections: Dict[str, Dict[str, int]] = {}  # Modified to store counts
        self.name_to_orcid: Dict[str, str] = {}
        self.orcid_to_name: Dict[str, str] = {}
        
        self._build_lookup_dictionaries()

    def _build_lookup_dictionaries(self):
        def convert_to_list(coauthors_str):
            try:
                # Try to evaluate the string as a list using ast.literal_eval
                return ast.literal_eval(coauthors_str)
            except (ValueError, SyntaxError):
                # If the string is not a valid list, assume it's a comma-separated string and split it
                return [author.strip() for author in coauthors_str.split("','")]

        # First pass: build name to ORCID mapping
        for _, row in self.df.iterrows():
            author_name = str(row['author_name'])
            orcid = str(row['orcid'])
            
            # Name to ORCID mapping (use first occurrence)
            if author_name not in self.name_to_orcid:
                self.name_to_orcid[author_name] = orcid
            
            # ORCID to Name mapping (use first occurrence)
            if orcid not in self.orcid_to_name:
                self.orcid_to_name[orcid] = author_name

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
                try:
                    coauthors_list = ast.literal_eval(str(coauthors)) if isinstance(coauthors, str) else coauthors
                except:
                    coauthors_list = [coauthors]
                
                if not isinstance(coauthors_list, list):
                    coauthors_list = [coauthors_list]
                
                # Prepare full list of all authors for this record
                all_authors = [author_name] + [str(ca).strip() for ca in coauthors_list]
                
                # Update connections for each author
                for main_author in all_authors:
                    main_author_id = self.name_to_orcid.get(main_author, main_author)
                    
                    # Initialize connections dictionary for this author if not exist
                    if main_author_id not in self.connections:
                        self.connections[main_author_id] = {}
                    
                    # Add all other authors as connections with counts
                    for other_author in all_authors:
                        if other_author != main_author:
                            other_author_id = self.name_to_orcid.get(other_author, other_author)
                            
                            # Increment the connection count
                            if other_author_id in self.connections[main_author_id]:
                                self.connections[main_author_id][other_author_id] += 1
                            else:
                                self.connections[main_author_id][other_author_id] = 1
                
                # Coauthors dictionary
                for coauthor in all_authors:
                    coauthor_id = self.name_to_orcid.get(coauthor, coauthor)
                    
                    if coauthor_id not in self.coauthors:
                        self.coauthors[coauthor_id] = []

                    record["coauthors"] = convert_to_list(row['coauthors'])
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
        self.orcid = dict(sorted(self.reader.orcid.items(), key=lambda item: len(item[1]), reverse=True))
        self.doi = self.reader.doi
        self.coauthors = dict(sorted(self.reader.coauthors.items(), key=lambda item: len(item[1]), reverse=True))
        self.connections = dict(sorted(self.reader.connections.items(), key=lambda item: len(item[1]), reverse=True))
        self.name_to_orcid = self.reader.name_to_orcid
        self.orcid_to_name = self.reader.orcid_to_name



if __name__ == "__main__":
    obj = initializeReader("DataSet.xlsx")

    print(obj.connections['Amit Kumar'])  
    print("\n\n\n\n")
    print(obj.connections["0000-0003-3642-0392"])  
    print("\n\n\n\n")
    print(obj.connections["0000-0001-7085-2354"]) 