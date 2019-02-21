import csv
import pandas
import sys

'''
Replaces all the brackets in the _input fields of the target csv file
'''
if __name__ == "__main__":
    if( len(sys.argv) != 2 ):
        print("Usage: python3 dt.py <csv_filename>")
        quit()
    filename = sys.argv[1]
    df = pandas.read_csv(filename, encoding='utf-8')
    for column in df:
        if( "_input" in column ):
            df[column] = df[column].str.replace('[\[\]]','')
    df.to_csv(filename,  encoding='utf-8', quoting=csv.QUOTE_ALL)
