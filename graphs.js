var locations = {
    'Australia/Australian Capital Territory': {
        'name': 'ACT',
        'population':426709
    },
    'Australia/New South Wales': {
        'name': 'NSW',
        'population':8089526
    },
    'Australia/Northern Territory': {
        'name': 'NT',
        'population':245869
    },
    'Australia/Queensland': {
        'name': 'QLD',
        'population':5095100
    },
    'Australia/South Australia': {
        'name': 'SA',
        'population':5095100
    },
    'Australia/Tasmania': {
        'name': 'Tas',
        'population':534281
    },
    'Australia/Victoria': {
        'name': 'Vic',
        'population':6594804
    },
    'Australia/Western Australia': {
        'name': 'WA',
        'population':2621680
    },
};

var populateData = function(data) {
    lines = data.split('\n');
    for(var line in lines) {
        line = lines[line];
        if(line[line.length-1]=='\r')
            line = line.slice(0, -1);
        line = line.split(',');
        //console.log(line);
        var region = line[1];
        if(line[0]!='')
            region = line[1] + '/' + line[0];
        line = line.slice(4);
        if(!(region in locations))
            continue;
        locations[region]['data'] = new TimeSeries(line);
        while((line.length>0) && (line[0]<locations[region]['population']/1000000))
            line = line.slice(1);
        locations[region]['days_since_1ppm'] = new TimeSeries(line);
    }
    //console.log(locations);
}

var drawGraph = function() {
    var ctx = document.getElementById('myChart').getContext('2d');
    
    var colorHash = new ColorHash();
    var datasets = [];
    maxlen = 0;
    for(var loc in locations) {
        data = [];
        if(locations[loc]['days_since_1ppm'].data.length > maxlen)
            maxlen = locations[loc]['days_since_1ppm'].data.length;
        for(var i in locations[loc]['days_since_1ppm'].data) {
            data.push(1000000*locations[loc]['days_since_1ppm'].data[i]/locations[loc]['population']);
        }
        //console.log(data);
        datasets.push({ 
            data: data,
            label: locations[loc]['name'],
            borderColor: colorHash.hex(loc),
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
                        max: 1000,
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
        drawGraph();
        drawDoubleTable();
    }
    client.send();
}
