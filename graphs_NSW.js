
var locations = {
};

var populateData = function(data) {
    lines = data.split('\n');
    for(var line in lines) {
        line = lines[line];
        if(line[line.length-1]=='\r')
            line = line.slice(0, -1);
        line = line.split(',');
        if(line[0]=='notification_date')
            continue;
        if(line.length==1)
            continue;
        var loc = line[1];
        if(loc=='' || loc==0 || loc==9990 || loc==9999)
            loc = 'other';
        if(loc<2000 || loc>=3000)
            loc = 'other';
        if(!(loc in locations)) {
            locations[loc]=[];
        }
        locations[loc].push(line);
    }
}

drawTable = function(data) {
    populateData(data);
    console.log(locations);
    var table = document.getElementById('doubleDays');
}

window.onload = function() {
    var client = new XMLHttpRequest();

    client.open('GET', 'https://transfer-tp.s3-ap-southeast-2.amazonaws.com/covid-19-cases-by-notification-date-and-postcode-local-health-district-and-local-government-area.csv');
    client.onreadystatechange = function() {
        if(client.readyState!=4) return;
        drawTable(client.responseText);
    }
    client.send();
}
