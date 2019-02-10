export class StringUtils {
    public static format(str, arr) {
        let i = -1;
        function callback(exp, p0, p1, p2, p3, p4) {
            if (exp == '%%') return '%';
            if (arr[++i] === undefined) return undefined;
            exp = p2 ? parseInt(p2.substr(1)) : undefined;
            let base = p3 ? parseInt(p3.substr(1)) : undefined;
            let val;
            switch (p4) {
                case 's': val = arr[i]; break;
                case 'c': val = arr[i][0]; break;
                case 'f': val = parseFloat(arr[i]).toFixed(exp); break;
                case 'p': val = parseFloat(arr[i]).toPrecision(exp); break;
                case 'e': val = parseFloat(arr[i]).toExponential(exp); break;
                case 'x': val = parseInt(arr[i]).toString(base ? base : 16); break;
                case 'd': val = parseFloat(parseInt(arr[i], base ? base : 10).toPrecision(exp)).toFixed(0); break;
            }
            val = typeof (val) == 'object' ? JSON.stringify(val) : val.toString(base);
            const sz = parseInt(p1); /* padding size */
            const ch = p1 && p1[0] == '0' ? '0' : ' '; /* isnull? */
            while (val.length < sz) {
                val = p0 !== undefined ? val + ch : ch + val; /* isminus? */
            }
            return val;
        }
        const regex = /%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd%])/g;
        return str.replace(regex, callback);
    }
}
