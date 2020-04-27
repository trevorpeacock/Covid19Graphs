updatedata:
	rm covid-19-cases-by-notification-date-and-postcode-local-health-district-and-local-government-area.csv
	wget https://data.nsw.gov.au/data/dataset/aefcde60-3b0c-4bc0-9af1-6fe652944ec2/resource/21304414-1ff1-4243-a5d2-f52778048b29/download/covid-19-cases-by-notification-date-and-postcode-local-health-district-and-local-government-area.csv
	aws s3 cp --acl public-read covid-19-cases-by-notification-date-and-postcode-local-health-district-and-local-government-area.csv s3://transfer-tp/
