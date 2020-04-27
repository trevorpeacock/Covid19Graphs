
var locations = {
};

var datemillis_to_day = function(m) {
    return m/1000/3600/24-18283;
}

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
        line[0]=datemillis_to_day(Date.parse(line[0]));
        var loc = line[5];//+'/'+line[1];
        if(loc=='' || loc==0 || loc==9990 || loc==9999)
            loc = 'other';
        if(loc<2000 || loc>=3000)
            loc = 'other';
        if(!(loc in locations)) {
            locations[loc]=[];
        }
        locations[loc].push(line);
    }
    for(var pc in locations) {
        var raw_data = locations[pc];
        var data = Array.from({length: datemillis_to_day(Date.now())+1}, (v, i) => 0);
        for(var i=0; i<raw_data.length; i++) {
            data[raw_data[i][0]]++;
        }
        locations[pc]={'raw_data': raw_data, 'data':new TimeSeries_from_daily(data)};
    }
}

drawTable = function(data) {
    populateData(data);
    //console.log(locations);
    var total=0;
    for(var pc in locations) {
        //console.log(pc, locations[pc]);
        total+=locations[pc].length;
    }
    //console.log(total);
    var table = document.getElementById('doubleDays');
    var sorted_locations = Object.keys(locations);
    sorted_locations.sort(function(a,b){
        var process_dtd = function(d) {
            if(d=='-') return 100000;
            return d;
        }
        if(process_dtd(locations[a].data.days_to_double())<process_dtd(locations[b].data.days_to_double())) return -1;
        if(process_dtd(locations[a].data.days_to_double())>process_dtd(locations[b].data.days_to_double())) return 1;
        if(locations[a].data.current()<locations[b].data.current()) return 1;
        if(locations[a].data.current()>locations[b].data.current()) return -1;
        return 0;
    });
    for(var pc in sorted_locations) {
        var line = locations[sorted_locations[pc]];
        var tr = document.createElement("tr");
        table.appendChild(tr);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(sorted_locations[pc]);
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(line.data.current());
        td.appendChild(text);
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(line.data.days_to_double());
        td.appendChild(text);
    }
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
