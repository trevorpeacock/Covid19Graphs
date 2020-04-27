class TimeSeries {
    constructor(data) {
        this.data = data;
    }
    days_to_double() {
        var target = this.data[this.data.length-1]/2;
        if(target==0) return '-'
        if(target<4) return '-'
        for(var i = 0; ; i++) {
            if(this.data[this.data.length-i-1] < target) {
                var val = i-1 + (this.data[this.data.length-i]-target)/(this.data[this.data.length-i]-this.data[this.data.length-i-1]);
                return val.toFixed(2);
            }
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