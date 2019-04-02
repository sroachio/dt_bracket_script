import pdb
import pandas
import json
import requests
import datetime
import csv
import os
from io import StringIO
import dt
import subprocess
import time


g_apikey = ""


g_extractor_ids = ["4fe38a72-aceb-4cc2-ad37-c58e9f60cd59",
                    "cd0ac3a0-5126-4538-bb07-13c119f265ac",
                    "6b6b6b3d-5e62-49dc-af27-01d7e36e449e",
                    "1858c86f-2f48-4305-815e-f867fa98a012",
                    "91bb88a4-c34a-4d7b-8361-1d33c82b5b65",
                    "13a0148d-ff78-499a-aba4-c46f9ab61aad",
                    "d07fc7fc-7c2e-4016-845b-6cbb1970310c",
                    "6684018f-a8fa-4705-bca3-3e6f36819874",
                    "670ef868-0ea4-4fd9-9d87-8b43b96badcb",
                    "1cad4678-3eae-4339-94a4-6064415e0a33",
                    "b7a5178f-7d0f-4a4c-92b0-9eda2f354713",
                    "2b8ace02-fdec-496c-b018-ff88b6e8c744",
                    "194f13c5-0e76-492b-b138-2ac6ad189ace",
                    "2a210d52-0b90-4e28-9eb7-d52e31c0eb0d",
                    "a52ccc5b-94b4-45a6-97c7-8a8b7320dd3d",
                    "10b1fc90-3b93-4e74-945d-80749aafffb8",
                    "04dccb18-5640-468b-8ba9-445167f4da72",
                    "b8c17e45-a7f7-4fd3-b6f6-c2a054748337",
                    "e8b69147-2bfb-465b-88b3-71f93d91d336",
                    "e7115cbb-d992-46e6-86df-b2005f4a2c44",
                    "1603643d-83d2-4460-8de7-528812fb66ed",
                    "271446b9-d769-4554-9549-d19fc38ee0c0",
                    "f03b24bb-0517-4c15-8452-e97f8eb895d1",
                    "15ff3d58-4867-4895-a79e-6956124c53aa"]

g_energy_extractor_ids = ["96fcec61-d5fc-4d43-9507-782f447ea8c7",
                    "b24d7d16-62ef-4810-a510-c317b78709c2",
                    "2e04c1c1-5e3f-4971-9bf9-39a1727b67a1",
                    "72e30af2-0dd9-40c3-a7a5-8e8933e51eb0",
                    "26793cb2-1166-4481-b236-a9dca313bfe0"]


def get_latest_crawl_data(crawl_run_id, date):
    #url_template = "https://store.import.io/store/crawlRun/{}/_attachment/csv/?_apikey={}"
    url_tempalte = "https://store.import.io/store/crawlrun/_search?_sort=_meta.creationTimestamp&_page=1&_perpage=1&extractorId={}&_apikey={}"
    url = url_template.format(crawl_run_id, g_apikey)
    r = requests.get(url)
    r.encoding = 'utf-8'
    print(r.encoding)
    df = pandas.read_csv(StringIO(r.text), encoding='utf-8')
    return df

def start_crawl_run(extractor_id):
    url_template="https://run.import.io/extractor/{}/start?_apikey={}"
    url = url_template.format(extractor_id, g_apikey)
    r = requests.post(url)
    print(r.text)

def get_crawl_list(extractor_id, output_prefix):
    #url_template = "https://api.import.io/maestro/extractor/{}/crawlRun?_apikey={}"
    url_template = "https://api.import.io/maestro/extractor/{}/crawlRun/latest?type=extractor&_apikey={}"
    ret_obj = []
    ret_dates = []
    #for extractor_id in g_extractor_ids:
    url = url_template.format(extractor_id, g_apikey)
    r = requests.get(url)
    #print(r.text)
    obj = json.loads(r.text)
    #print(obj["guid"])
    #print(obj["_meta"]["timestamp"])

    url_template2 = "https://api.import.io/maestro/extractor/{}?_apikey={}"
    url = url_template2.format(extractor_id, g_apikey)
    r = requests.get(url)
    obj2 = json.loads(r.text)
    print(obj2["name"])

    #if( not "guid" in obj ):
    #    pdb.set_trace()

    url_template3 = "https://store.import.io/store/crawlRun/{}/_attachment/csv/?_apikey={}"
    url = url_template3.format(obj["guid"], g_apikey)
    r = requests.get(url)
    r.encoding = 'utf-8'
    print(r.text)

    filename = "{}//{}_{}.csv".format(output_prefix,obj2["name"],obj["_meta"]["timestamp"])
    f = open(filename, "w")
    f.write(r.text)
    f.close()
    return filename

def make_directories(root_dir):
    new_dirs = [root_dir, root_dir+"//energy", root_dir+"//broadband"]
    for new_dir in new_dirs:
        if not os.path.exists(new_dir):
            os.mkdir(new_dir)

def string_between_tokens(instr, str1, str2):
    ix1 = instr.index(str1) + len(str1)
    ix2 = instr.index(str2, ix1)

    return instr[ix1:ix2]


if __name__ == "__main__":
    for extractor_id in g_extractor_ids:
        start_crawl_run(extractor_id)


    time.sleep(600)

    today = datetime.datetime.today().strftime('%Y-%m-%d')
    root = "//Users/shaunroach/Documents/Decision Tech/delivery"
    make_directories(root+"//"+today)
    prefix = "{}//{}//broadband".format(root,today)
    for extractor_id in g_extractor_ids:
        #start_crawl_run(extractor_id)
        get_crawl_list(extractor_id, prefix)


    energy_prefix = "{}//{}//energy".format(root,today)
    for extractor_id in g_energy_extractor_ids:
        filename = get_crawl_list(extractor_id, energy_prefix)
        dt.convert_file(filename)


    #today = datetime.datetime.today().strftime('%Y-%m-%d')
    #root = "//Users/shaunroach/Documents/Decision Tech/delivery"

    command = "aws s3 cp '{}/{}' s3://dtl-market-data/delivery/{} --acl bucket-owner-full-control --profile new --recursive".format(root, today,today)
    subprocess.run(command, check=True, shell=True, stdout=subprocess.PIPE)
