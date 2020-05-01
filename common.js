function caching(wrapped) {
    var cached_val;
    return function() {
        if(cached_val==undefined) {
            cached_val = wrapped.apply(this, arguments);
        }
        return cached_val;
    }
}

class TimeSeries {
    constructor(data) {
        this.data = [];
        for(var i=0; i<data.length; i++) {
            this.data.push(parseInt(data[i]));
        }
    }
    daily_increase = caching(function() {
        var d = [];
        var previous = 0;
        for(var i=0; i<this.data.length; i++) {
            d.push(this.data[i] - previous);
            previous = this.data[i];
        }
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
    })
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
    changerate() {
        var num = (this.increase_value(-3)+this.increase_value(-2)+this.increase_value(-1));
        var den = (this.increase_value(-6)+this.increase_value(-5)+this.increase_value(-4));
        if(num==0 && den==0) return 'NoData';
        if(den==0) return 'NewOutbreak';
        if(num==0) return 'NoNewCases';
        //console.log(num, den, num/den);
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
