import json
from django.shortcuts import render
from app.utils import initializeReader

def index(request):
    # Initialize the reader object (assuming the file path is correct)
    excel_file = 'DataSet.xlsx'  # Adjust this to your actual file path
    obj = initializeReader(excel_file)

    # Serialize the data to JSON format to pass it to the template
    context = {
        'obj_data': json.dumps({
            'orcid': obj.orcid,                                     # orcid : Dict[str:list]   list[dic]
            'doi': obj.doi,                                         # doi : Dict[str:Dict[str:list]]
            'author_name': obj.reader.df['author_name'].tolist(),   # author_name : Dict[str:Dict[str:list]]
            'coauthors': obj.coauthors,                             # coauthors : Dict[str:list]
            'connections':obj.connections,                          # connections : Dict[str:List[str]]
            'name_to_orcid':obj.name_to_orcid,                      # name_to_orcid : Dict[str, str]
            'orcid_to_name':obj.orcid_to_name                       # name_to_orcid : Dict[str, str]
        })
    }

    return render(request, 'index.html', context)
