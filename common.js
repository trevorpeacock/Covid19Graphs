function caching(wrapped) {
    var cached_val;
    return function() {
        //console.log(cached_val, wrapped);
        if(cached_val==undefined) {
            cached_val = wrapped.apply(this, arguments);
        }
        return cached_val;
    }
}

function sum(l) {
    var total = 0;
    for(var i=0; i<l.length; i++) {
        total += l[i];
    }
    return total;
}

function average(l) {
    return sum(l)/l.length;
}

class TimeSeries {
    constructor(data) {
        this.data = [];
        for(var i=0; i<data.length; i++) {
            this.data.push(parseInt(data[i]));
        }
    }
    daily_increase = (function() {//caching
        if(this.daily_increase_cache!=undefined) return this.daily_increase_cache.slice();
        var d = [];
        var previous = 0;
        for(var i=0; i<this.data.length; i++) {
            d.push(this.data[i] - previous);
            previous = this.data[i];
        }
        //console.log(this.data, d);
        this.daily_increase_cache = d;
        return d;
    });
    days_to_double = caching(function() {
        var target = this.data[this.data.length-1]/2;
        if(target==0) return '-'
        if(target<4) return '-'
        for(var i = 0; ; i++) {
            if(this.data[this.data.length-i-1] < target) {
                var val = i-1 + (this.data[this.data.length-i]-target)/(this.data[this.data.length-i]-this.data[this.data.length-i-1]);
                return val.toFixed(2);
            }
        }
    });
    cumulative_value(pos) {
        if(pos<0)
            return this.data[this.data.length-pos];
        return this.data[pos];
    }
    increase_value(pos) {
        if(pos<0)
            return this.daily_increase()[this.daily_increase().length+pos];
        return this.daily_increase()[pos];
    }
    current() {
        return this.data[this.data.length-1];
    }
    changerate(day) {
        if(day===undefined) day = -1;
        const days = 1;
        const previous_days = 10;
        var num = average(this.daily_increase().splice(-days +day+1, days));
        var den = average(this.daily_increase().splice(-previous_days +day+1, previous_days-days));
        //console.log(day, num, den, this.daily_increase().splice(-previous_days +day+1, previous_days-days), this.daily_increase().splice(-days +day+1, days));
        if(num<0) num=0;
        if(den<0) den=0;
        if(num==0 && den==0) return 'NoData';
        if(den==0) return 'NewOutbreak';
        if(num==0) return 'NoNewCases';
        return num/den;
    }
    add(data) {
        for(var i=0; i<this.data.length; i++) {
            this.data[i]+=data.data[i];
        }
    }
}

class TimeSeries_from_daily extends TimeSeries {
    constructor(data) {
        super(TimeSeries_from_daily.calculateCumulative(data));
    }
    static calculateCumulative(data) {
        var d = [];
        var total = 0;
        for(var i=0; i<data.length; i++) {
            total += parseInt(data[i]);
            d.push(total);
        }
        return d;
    }
}


sorted_locations = function(loc_list) {
    var sorted_locs = Object.keys(loc_list);
    sorted_locs.sort(function(a,b){
        var process_dtd = function(d) {
            if(d=='-') return 100000;
            return d;
        }
        if(parseFloat(process_dtd(loc_list[a].data.days_to_double()))<parseFloat(process_dtd(loc_list[b].data.days_to_double()))) return -1;
        if(parseFloat(process_dtd(loc_list[a].data.days_to_double()))>parseFloat(process_dtd(loc_list[b].data.days_to_double()))) return 1;
        if(loc_list[a].data.current()<loc_list[b].data.current()) return 1;
        if(loc_list[a].data.current()>loc_list[b].data.current()) return -1;
        return 0;
    });
    return sorted_locs;
}

drawChangeRateGraph = function(data) {
    const width = 200;
    const height = 50;
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);

    var divisions = 30;
    var division_width = width / divisions;
    var max_height = 1.8;
    for(var i=-divisions; i<0; i++) {
        var v = data.changerate(i);
        if(v=='NoData') continue;
        if(v=='NewOutbreak') continue;
        if(v=='NoNewCases') continue;
        if(v>max_height) max_height = v;
    }
    max_height += 0.2;
    //console.log(max_height);

    for(var i=-divisions; i<0; i++) {
        var v = data.changerate(i);
        var x_start = width + (i) * division_width;
        var x_end = width + (i+1) * division_width;
        var x = width + (i+0.5) * division_width;
        var y = height - height*(v / max_height);

        ctx.fillStyle = '#A66';
        if(v=='NoData')
            ctx.fillStyle = '#555';
        if(v=='NewOutbreak')
            ctx.fillStyle = '#D66';
        if(v=='NoNewCases')
            ctx.fillStyle = '#6A6';
        if(v<1)
            ctx.fillStyle = '#6A6';
        ctx.fillRect(x_start, 0, x_end - x_start+1, height);
    }


    ctx.fillStyle = '#000';
    ctx.fillRect(0, height-(height/max_height-1), width, 2);

    for(var i=-divisions; i<0; i++) {
        var v1 = data.changerate(i-1);
        var v2 = data.changerate(i);
        if(v1=='NoData') continue;
        if(v1=='NewOutbreak') continue;
        if(v1=='NoNewCases') v1=0;
        if(v2=='NoData') continue;
        if(v2=='NewOutbreak') continue;
        if(v2=='NoNewCases') v2=0;
        var x1 = width + (i-0.5) * division_width;
        var y1 = height - height*(v1 / max_height);
        var x2 = width + (i+0.5) * division_width;
        var y2 = height - height*(v2 / max_height);

        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    for(var i=-1-divisions; i<0; i++) {
        var v = data.changerate(i);
        //console.log(i, data.changerate(i), data.increase_value(i));
        if(v=='NoData') continue;
        if(v=='NewOutbreak') continue;
        if(v=='NoNewCases') v=0;
        var x_start = width + (i) * division_width;
        var x_end = width + (i+1) * division_width;
        var x = width + (i+0.5) * division_width;
        var y = height - height*(v / max_height);

        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.stroke();
    }

    return canvas;
}
