
states = {}

calculatorDaysToDouble = function(data) {
    var target = data[data.length-1]/2;
    if(target==0) return '-'
    if(target<4) return '-'
    for(var i = 0; ; i++) {
        if(data[data.length-i-1] < target) {
            var val = i-1 + (data[data.length-i]-target)/(data[data.length-i]-data[data.length-i-1]);
            return val.toFixed(2);
        }
    }
}

var calculateCumulative = function(data) {
    d = [];
    total = 0;
    for(var i=0; i<data.length; i++) {
        total += parseInt(data[i]);
        d.push(total);
    }
    return d;
}

var intArray = function(data) {
    d = [];
    for(var i=0; i<data.length; i++) {
        d.push(parseInt(data[i]));
    }
    return d;
}

var addArrays = function(d1, d2) {
    d = [];
    for(var i=0; i<d1.length; i++) {
        d.push(d1[i]+d2[i]);
    }
    return d;
}

drawDoubleTable = function(data) {
    var div = document.getElementById('doubleDays');
    lines = data.split('\n');
    for(var line in lines) {
        line = lines[line];
        if(line[line.length-1]=='\r')
            line = line.slice(0, -1);
        line = line.split(',');
        if(line[0]=='UID') continue;
        if(line[4]>56 && line[4]<1000) continue;
        if(line[4]>77777) continue;
        if(line[4]=="") continue;
        if(line[5]=="Unassigned") {
            states[line[6]] = {
                'data':intArray(line.slice(13)),
                'province':{}
            }
            console.log(line[6], states[line[6]]['data'][states[line[6]]['data'].length-1]);
        } else {
            states[line[6]]['province'][line[5]] = {
                'data':intArray(line.slice(13)),
            }
            states[line[6]]['data'] = addArrays(states[line[6]]['data'], states[line[6]]['province'][line[5]]['data'])
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
    for(var state in states) {
        var tr = document.createElement("tr");
        table.appendChild(tr);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(state);
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(states[state]['data'][states[state]['data'].length-1]);
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(calculatorDaysToDouble(states[state]['data']));
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
        for(var prov in states[state]['province']) {
            var tr = document.createElement("tr");
            table.appendChild(tr);
            var td = document.createElement("td");
            tr.appendChild(td);
            var text = document.createTextNode(prov);
            td.appendChild(text);
            var td = document.createElement("td");
            tr.appendChild(td);
            var text = document.createTextNode(states[state]['province'][prov]['data'][states[state]['province'][prov]['data'].length-1]);
            td.appendChild(text);
            var td = document.createElement("td");
            tr.appendChild(td);
            var text = document.createTextNode(calculatorDaysToDouble(states[state]['province'][prov]['data']));
            td.appendChild(text);
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
