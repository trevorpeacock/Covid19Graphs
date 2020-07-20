
states = {
    'Alabama': {
       'name': 'AL',
       'population':4903185
    },
    'Alaska': {
       'name': 'AK',
       'population':731545
    },
    'Arizona': {
       'name': 'AZ',
       'population':7278717
    },
    'Arkansas': {
       'name': 'AR',
       'population':3017825
    },
    'California': {
       'name': 'CA',
       'population':39512223
    },
    'Colorado': {
       'name': 'CO',
       'population':5758736
    },
    'Connecticut': {
       'name': 'CT',
       'population':3565287
    },
    'Delaware': {
       'name': 'DE',
       'population':973764
    },
    'District of Columbia': {
       'name': 'DC',
       'population':705749
    },
    'Florida': {
       'name': 'FL',
       'population':21477737
    },
    'Georgia': {
       'name': 'GA',
       'population':10617423
    },
    'Hawaii': {
       'name': 'HI',
       'population':1415872
    },
    'Idaho': {
       'name': 'ID',
       'population':1787065
    },
    'Illinois': {
       'name': 'IL',
       'population':12671821
    },
    'Indiana': {
       'name': 'IN',
       'population':6732219
    },
    'Iowa': {
       'name': 'IA',
       'population':3155070
    },
    'Kansas': {
       'name': 'KS',
       'population':2913314
    },
    'Kentucky': {
       'name': 'KY',
       'population':4467673
    },
    'Louisiana': {
       'name': 'LA',
       'population':4648794
    },
    'Maine': {
       'name': 'ME',
       'population':1344212
    },
    'Maryland': {
       'name': 'MD',
       'population':6045680
    },
    'Massachusetts': {
       'name': 'MA',
       'population':6949503
    },
    'Michigan': {
       'name': 'MI',
       'population':9986857
    },
    'Minnesota': {
       'name': 'MN',
       'population':5639632
    },
    'Mississippi': {
       'name': 'MS',
       'population':2976149
    },
    'Missouri': {
       'name': 'MO',
       'population':6137428
    },
    'Montana': {
       'name': 'MT',
       'population':1068778
    },
    'Nebraska': {
       'name': 'NE',
       'population':1934408
    },
    'Nevada': {
       'name': 'NV',
       'population':3080156
    },
    'New Hampshire': {
       'name': 'NH',
       'population':1359711
    },
    'New Jersey': {
       'name': 'NJ',
       'population':8882190
    },
    'New Mexico': {
       'name': 'NM',
       'population':2096829
    },
    'New York': {
       'name': 'NY',
       'population':19453561
    },
    'North Carolina': {
       'name': 'NC',
       'population':10488084
    },
    'North Dakota': {
       'name': 'ND',
       'population':762062
    },
    'Ohio': {
       'name': 'OH',
       'population':11689100
    },
    'Oklahoma': {
       'name': 'OK',
       'population':3956971
    },
    'Oregon': {
       'name': 'OR',
       'population':4217737
    },
    'Pennsylvania': {
       'name': 'PA',
       'population':12801989
    },
    'Puerto Rico': {
       'name': 'PA',
       'population':3193694
    },
    'Rhode Island': {
       'name': 'RI',
       'population':1059361
    },
    'South Carolina': {
       'name': 'SC',
       'population':5148714
    },
    'South Dakota': {
       'name': 'SD',
       'population':884659
    },
    'Tennessee': {
       'name': 'TN',
       'population':6833174
    },
    'Texas': {
       'name': 'TX',
       'population':28995881
    },
    'Utah': {
       'name': 'UT',
       'population':3205958
    },
    'Vermont': {
       'name': 'VT',
       'population':623989
    },
    'Virginia': {
       'name': 'VA',
       'population':8535519
    },
    'Washington': {
       'name': 'WA',
       'population':7614893
    },
    'West Virginia': {
       'name': 'WV',
       'population':1792147
    },
    'Wisconsin': {
       'name': 'WI',
       'population':5822434
    },
    'Wyoming': {
       'name': 'WY',
       'population':578759
    }
}

var populateData = function(data) {
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
            if(!(line[6] in states)) {
                console.log(line[6] + ' missing');
                continue;
            }
            states[line[6]]['data']=new TimeSeries(line.slice(13));
            states[line[6]]['province']={};
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
    for(var state in states) {
        var line = states[state].data.data.slice();
        while((line.length>0) && (line[0]<states[state]['population']/1000000))
            line = line.slice(1);
        states[state]['days_since_1ppm'] = new TimeSeries(line);
    }
}

var drawGraph = function() {
    var ctx = document.getElementById('myChart').getContext('2d');

    var colorHash = new ColorHash();
    var datasets = [];
    maxlen = 0;
    for(var state in states) {
        data = [];
        if(states[state]['days_since_1ppm'].data.length > maxlen)
            maxlen = states[state]['days_since_1ppm'].data.length;
        for(var i in states[state]['days_since_1ppm'].data) {
            data.push(1000000*states[state]['days_since_1ppm'].data[i]/states[state]['population']);
        }
        //console.log(data);
        datasets.push({
            data: data,
            label: states[state]['name'],
            borderColor: colorHash.hex(state),
            fill: false
        })
    }

    baselines = [1, 2, 3, 5, 10];
    baseline_colours = ['#888', '#999', '#aaa', '#bbb', '#ccc'];
    for(b in baselines) {
        data = [];
        for(var i = 0; i < maxlen; i++) {
            var base = Math.pow(2, 1/baselines[b])
            data.push(Math.pow(base, i));
        }
        datasets.push({
            data: data,
            label: 'Double every ' + baselines[b] + ' days',
            lineTension: 0,
            borderColor: baseline_colours[b],
            fill: false
        })
    }

    Chart.defaults.global.elements.line.tension = 0;
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...Array(maxlen).keys()],
            datasets: datasets
          },
          options: {
            title: {
              display: true,
              text: 'COVID-19 confirmed cases per million since 1 per million'
            },
            scales: {
                xAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Days since cases reached 1 per million'
                    }
                }],
                yAxes: [{
                    type: 'logarithmic',
                    ticks: {
                        min: 1,
                        max: 100000,
                         callback: function (value, index, values) {
                             return Number(value.toString());//pass tick values as a string into Number function
                         }
                    },
                    afterBuildTicks: function (chartObj) { //Build ticks labelling as per your need
                        chartObj.ticks = [];
                        chartObj.ticks.push(1);
                        chartObj.ticks.push(10);
                        chartObj.ticks.push(100);
                        chartObj.ticks.push(1000);
                        chartObj.ticks.push(10000);
                        chartObj.ticks.push(100000);
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Cases per million people'
                    }
                }]
            },
          }
    });
}

drawDoubleTable = function(data) {
    var div = document.getElementById('doubleDays');
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
    var td = document.createElement("td");
    tr.appendChild(td);
    var text = document.createTextNode('Daily Spread');
    td.appendChild(text);
    var sorted_states = sorted_locations_changerate(states);
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
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode(states[state]['data'].changerate(-1, 4, 14));
        td.appendChild(text);
        var td = document.createElement("td");
        tr.appendChild(td);
        td.appendChild(drawChangeRateGraph(states[state]['data']));
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
        var td = document.createElement("td");
        tr.appendChild(td);
        var text = document.createTextNode('Daily Spread');
        td.appendChild(text);
        var sorted_provinces = sorted_locations_changerate(states[state]['province']);
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
            var td = document.createElement("td");
            tr.appendChild(td);
            var text = document.createTextNode(states[state]['province'][prov]['data'].changerate(-1, 4, 14));
            td.appendChild(text);
            var td = document.createElement("td");
            tr.appendChild(td);
            td.appendChild(drawChangeRateGraph(states[state]['province'][prov]['data']));
        }
    }

}

window.onload = function() {
    var client = new XMLHttpRequest();

    client.open('GET', 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv');
    client.onreadystatechange = function() {
        if(client.readyState!=4) return;
        populateData(client.responseText);
        drawGraph();
        drawDoubleTable();
    }
    client.send();
}
