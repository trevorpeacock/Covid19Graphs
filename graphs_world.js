var locations = {
};

var populateData = function(data) {
    lines = Papa.parse(data).data;
    for(var line in lines) {
        line = lines[line];
        if(line.length==1) continue
        //console.log(line);
        var region = line[1];
        if(region=='Country/Region') continue;
        line = line.slice(4);
        if(region in locations) {
            locations[region]['data'].add(new TimeSeries(line));
        } else {
            locations[region] = {'name': region};
            locations[region]['data'] = new TimeSeries(line);
        }
    }
    //console.log(locations);
}

drawDoubleTable = function() {
    var table = document.getElementById('doubleDays');
    var sorted_states = sorted_locations(locations);
    //sorted_states=['Australia/New South Wales'];
    for(var loc_id in sorted_states) {
        var loc = sorted_states[loc_id];
        var tr = document.createElement("tr");
        table.appendChild(tr);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(locations[loc]['name']);
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(locations[loc]['data'].current());
        td.appendChild(text);
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(locations[loc]['data'].days_to_double());
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        //var text = document.createTextNode(locations[loc]['data'].changerate());
        //td.appendChild(text);
        //console.log(loc);
        td.appendChild(drawChangeRateGraph(locations[loc]['data']));
        //console.log(locations[loc]['data'].data.splice(locations[loc]['data'].data.length-6));
    }
}

window.onload = function() {
    var client = new XMLHttpRequest();

    client.open('GET', 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv');
    //client.open('GET', 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv');
    client.onreadystatechange = function() {
        if(client.readyState!=4) return;
        populateData(client.responseText);
        drawDoubleTable();
    }
    client.send();
}
