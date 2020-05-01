
states = {}


drawDoubleTable = function(data) {
    var div = document.getElementById('doubleDays');
    lines = data.split('\n');
    for(var line in lines) {
        line = lines[line];
        if(line[line.length-1]=='\r')
            line = line.slice(0, -1);
        line = line.split(',');
        if(line.length==1) continue;
        if(line[0]=='UID') continue;
        if(line[4]<1000) continue;
        if(line[4]>80000 && line[4]<90000) continue;
        if(line[4]>91000) continue;
        if(line[4]=="") continue;
        if(line[5]=="Unassigned") {
            states[line[6]] = {
                'data':new TimeSeries(line.slice(13)),
                'province':{}
            }
        }
    }
    for(var line in lines) {
        line = lines[line];
        if(line[line.length-1]=='\r')
            line = line.slice(0, -1);
        line = line.split(',');
        if(line.length==1) continue;
        if(line[0]=='UID') continue;
        if(line[4]<1000) continue;
        if(line[4]>80000 && line[4]<90000) continue;
        if(line[4]>91000) continue;
        if(line[4]=="") continue;
        if(line[5]!="Unassigned") {
            states[line[6]]['province'][line[5]] = {
                'data':new TimeSeries(line.slice(13)),
            }
            states[line[6]]['data'].add(states[line[6]]['province'][line[5]]['data']);
        }
    }
    var table = document.createElement("table");
    div.appendChild(table);
    var tr = document.createElement("tr");
    table.appendChild(tr);
    var td = document.createElement("td");
    tr.appendChild(td);
    var text = document.createTextNode('State');
    td.appendChild(text);
    var td = document.createElement("td");
    tr.appendChild(td);
    var text = document.createTextNode('Cases');
    td.appendChild(text);
    var td = document.createElement("td");
    tr.appendChild(td);
    var text = document.createTextNode('Days to double');
    td.appendChild(text);
    var sorted_states = sorted_locations(states);
    for(var state_id in sorted_states) {
        var state = sorted_states[state_id];
        var tr = document.createElement("tr");
        table.appendChild(tr);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(state);
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(states[state]['data'].current());
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(states[state]['data'].days_to_double());
        td.appendChild(text);
    }

    for(var state in states) {
        var h = document.createElement("h2");
        div.appendChild(h);
        var text = document.createTextNode(state);
        h.appendChild(text);

        var table = document.createElement("table");
        div.appendChild(table);
        var tr = document.createElement("tr");
        table.appendChild(tr);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode('State');
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode('Cases');
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode('Days to double');
        td.appendChild(text);
        var sorted_provinces = sorted_locations(states[state]['province']);
        for(var prov_id in sorted_provinces) {
            var prov = sorted_provinces[prov_id];
            var tr = document.createElement("tr");
            table.appendChild(tr);
            var td = document.createElement("td");
            tr.appendChild(td);
            var text = document.createTextNode(prov);
            td.appendChild(text);
            var td = document.createElement("td");
            tr.appendChild(td);
            var text = document.createTextNode(states[state]['province'][prov]['data'].current());
            td.appendChild(text);
            var td = document.createElement("td");
            tr.appendChild(td);
            var text = document.createTextNode(states[state]['province'][prov]['data'].days_to_double());
            td.appendChild(text);
            /*var td = document.createElement("td");
            tr.appendChild(td);
            var text = document.createTextNode(states[state]['province'][prov]['data'].changerate());
            td.appendChild(text);*/
        }
    }

}

window.onload = function() {
    var client = new XMLHttpRequest();

    client.open('GET', 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv');
    client.onreadystatechange = function() {
        if(client.readyState!=4) return;
        drawDoubleTable(client.responseText);
    }
    client.send();
}
