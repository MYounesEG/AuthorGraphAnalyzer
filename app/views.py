import json
from django.shortcuts import render
from django.http import JsonResponse
from app.utils import initializeReader

def index(request):
    # Initialize the reader object (assuming the file path is correct)
    excel_file = 'Dataset.xlsx'  # Adjust this to your actual file path
    obj = initializeReader(excel_file)

    # Serialize the data to JSON format to pass it to the template
    context = {
        'obj_data': json.dumps({
            'orcid': obj.orcid,
            'doi': obj.doi,
            'author_name': obj.reader.df['author_name'].tolist()
        })
    }

    return render(request, 'index.html', context)
