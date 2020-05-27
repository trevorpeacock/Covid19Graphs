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
        try:
            date = datetime.datetime.strptime(line['test_date'], '%Y-%m-%d')
        except:
            date = datetime.datetime.strptime(line['test_date'], '%d/%m/%Y')
        if date < mindate: mindate = date
        if date > maxdate: maxdate = date
        data[loc].append(date)

total_series = [0] * ((maxdate-mindate).days + 1)

mindate = datetime.datetime(2020,1,22)

for loc in data:
    series = [0] * ((maxdate-mindate).days + 1)
    for dt in data[loc]:
        day=(dt-mindate).days
        if day<0: continue
        series[day]+=1
        total_series[day]+=1
    data[loc]=series[:-1]

#for loc in data:
#    print(loc, data[loc][-10:])
#print(total_series[:-1])
#print(mindate)
#print(maxdate)
with open('covid-19-tests-by-date-and-location-and-result.json', 'w') as jsonfile:
    jsonfile.write(json.dumps(data))
