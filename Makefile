updatedata:
	rm covid-19-cases-by-notification-date-and-postcode-local-health-district-and-local-government-area.csv || exit 0
	wget https://data.nsw.gov.au/data/dataset/aefcde60-3b0c-4bc0-9af1-6fe652944ec2/resource/21304414-1ff1-4243-a5d2-f52778048b29/download/covid-19-cases-by-notification-date-and-postcode-local-health-district-and-local-government-area.csv
	aws s3 cp --acl public-read covid-19-cases-by-notification-date-and-postcode-local-health-district-and-local-government-area.csv s3://transfer-tp/

	rm covid-19-tests-by-date-and-postcode-local-health-district-and-local-government-area.csv || exit 0
	wget https://data.nsw.gov.au/data/dataset/60616720-3c60-4c52-b499-751f31e3b132/resource/945c6204-272a-4cad-8e33-dde791f5059a/download/covid-19-tests-by-date-and-postcode-local-health-district-and-local-government-area.csv
	./process_nsw_tests.py
	aws s3 cp --acl public-read covid-19-tests-by-date-and-location-and-result.json s3://transfer-tp/
	aws s3 cp --acl public-read covid-19-tests-by-date-and-postcode-local-health-district-and-local-government-area.csv s3://transfer-tp/
