

var locations = {
    'US/Washington': {
        'population':426709
    },
    'US/New York': {
        'population':426709
    },
    'US/California': {
        'population':426709
    },
    'US/Massachusetts': {
        'population':426709
    },
    'US/Grand Princess': {
        'population':426709
    },
    'US/Georgia': {
        'population':426709
    },
    'US/Colorado': {
        'population':426709
    },
    'US/Florida': {
        'population':426709
    },
    'US/New Jersey': {
        'population':426709
    },
    'US/Oregon': {
        'population':426709
    },
    'US/Texas': {
        'population':426709
    },
    'US/Illinois': {
        'population':426709
    },
    'US/Pennsylvania': {
        'population':426709
    },
    'US/Iowa': {
        'population':426709
    },
    'US/Maryland': {
        'population':426709
    },
    'US/North Carolina': {
        'population':426709
    },
    'US/South Carolina': {
        'population':426709
    },
    'US/Tennessee': {
        'population':426709
    },
    'US/Virginia': {
        'population':426709
    },
    'US/Arizona': {
        'population':426709
    },
    'US/Indiana': {
        'population':426709
    },
    'US/Kentucky': {
        'population':426709
    },
    'US/District of Columbia': {
        'population':426709
    },
    'US/Nevada': {
        'population':426709
    },
    'US/New Hampshire': {
        'population':426709
    },
    'US/Minnesota': {
        'population':426709
    },
    'US/Nebraska': {
        'population':426709
    },
    'US/Ohio': {
        'population':426709
    },
    'US/Rhode Island': {
        'population':426709
    },
    'US/Wisconsin': {
        'population':426709
    },
    'US/Connecticut': {
        'population':426709
    },
    'US/Hawaii': {
        'population':426709
    },
    'US/Oklahoma': {
        'population':426709
    },
    'US/Utah': {
        'population':426709
    },
    'US/Kansas': {
        'population':426709
    },
    'US/Louisiana': {
        'population':426709
    },
    'US/Missouri': {
        'population':426709
    },
    'US/Vermont': {
        'population':426709
    },
    'US/Alaska': {
        'population':426709
    },
    'US/Arkansas': {
        'population':426709
    },
    'US/Delaware': {
        'population':426709
    },
    'US/Idaho': {
        'population':426709
    },
    'US/Maine': {
        'population':426709
    },
    'US/Michigan': {
        'population':426709
    },
    'US/Mississippi': {
        'population':426709
    },
    'US/Montana': {
        'population':426709
    },
    'US/New Mexico': {
        'population':426709
    },
    'US/North Dakota': {
        'population':426709
    },
    'US/South Dakota': {
        'population':426709
    },
    'US/West Virginia': {
        'population':426709
    },
    'US/Wyoming': {
        'population':426709
    },
    'US/Alabama': {
        'population':426709
    },
    'US/Puerto Rico': {
        'population':426709
    },
    'US/Guam': {
        'population':426709
    },
    'US/Virgin Islands': {
        'population':426709
    },
    'US/United States Virgin Islands': {
        'population':426709
    },
    'US/US': {
        'population':426709
    },
};

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
        var region = line[1];
        if(line[0]!='')
            region = line[1] + '/' + line[0];
        line = line.slice(4);
        if(!(region in locations))
            continue;
        while((line.length>0) && (line[0]<locations[region]['population']/1000000))
            line = line.slice(1);
        locations[region]['days_since_1ppm'] = line;
    }
}

var drawGraph = function(data) {
    populateData(data);
    var ctx = document.getElementById('myChart').getContext('2d');
    
    var colorHash = new ColorHash();
    var datasets = [];
    maxlen = 0;
    for(var loc in locations) {
        data = [];
        if(locations[loc]['days_since_1ppm'].length > maxlen)
            maxlen = locations[loc]['days_since_1ppm'].length;
        for(var i in locations[loc]['days_since_1ppm']) {
            data.push(1000000*locations[loc]['days_since_1ppm'][i]/locations[loc]['population']);
        }
        console.log(data);
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

drawDoubleTable = function(data) {
    var table = document.getElementById('doubleDays');
    lines = data.split('\n');
    for(var line in lines) {
        line = lines[line];
        if(line[line.length-1]=='\r')
            line = line.slice(0, -1);
        line = line.split(',');
        var region = line[1];
        if(line[0]!='')
            region = line[1] + '/' + line[0];
        line = line.slice(4);
        if(!(region in locations))
            continue;
        var target = line[line.length-1]/2
        for(var i = 0; ; i++) {
            if(line[line.length-i-1] < target) {
                var val = i-1 + (line[line.length-i]-target)/(line[line.length-i]-line[line.length-i-1]);
                var tr = document.createElement("tr");
                table.appendChild(tr);
                var td = document.createElement("td");
                tr.appendChild(td);
                var text = document.createTextNode(locations[region]['name']);
                td.appendChild(text);
                var td = document.createElement("td");
                tr.appendChild(td);
                var text = document.createTextNode(line[line.length-1]);
                td.appendChild(text);
                td.appendChild(text);
                var td = document.createElement("td");
                tr.appendChild(td);
                var text = document.createTextNode(val.toFixed(2));
                td.appendChild(text);
                break;
            }
        }
    }

}

window.onload = function() {
    var client = new XMLHttpRequest();

    client.open('GET', 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv');
    //client.open('GET', 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv');
    client.onreadystatechange = function() {
        if(client.readyState!=4) return;
        drawGraph(client.responseText);
        drawDoubleTable(client.responseText);
    }
    client.send();
}
