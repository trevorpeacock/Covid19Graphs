#!/usr/bin/python3

data = {}

import csv
import datetime
import json


mindate = datetime.datetime.now()
maxdate = datetime.datetime(2020,1,1)

with open('covid-19-tests-by-date-and-location-and-result.csv', newline='') as csvfile:
    csvreader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
    for line in csvreader:
        loc = line['lga_name19']
        if loc=='': loc = 'other'
        if loc not in data:
            data[loc] = []
        date = datetime.datetime.strptime(line['test_date'], '%Y-%m-%d')
        if date < mindate: mindate = date
        if date > maxdate: maxdate = date
        data[loc].append(date)

total_series = [0] * ((maxdate-mindate).days + 1)

for loc in data:
    series = [0] * ((maxdate-mindate).days + 1)
    for dt in data[loc]:
        series[(dt-mindate).days]+=1
        total_series[(dt-mindate).days]+=1
    data[loc]=series[:-1]

#for loc in data:
#    print(loc, data[loc][-10:])
#print(total_series[:-1])
#print(maxdate)
with open('covid-19-tests-by-date-and-location-and-result.json', 'w') as jsonfile:
    jsonfile.write(json.dumps(data))
