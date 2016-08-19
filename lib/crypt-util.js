var exports = module.exports = {};

var CryptUtil = function() {
    function a(a, b, c, d) {
        switch (d.length) {
            case 1:
                return a == d.ch0;
            case 2:
                return a == d.ch0 && b == d.ch1;
            case 3:
                return a == d.ch0 && b == d.ch1 && c == d.ch2;
            default:
                return !1
        }
    }

    function b(b) {
        var d, e, f, g, h, i = b.charCodeAt(12),
            j = b.charCodeAt(13),
            k = b.charCodeAt(14),
            l = b.charCodeAt(15),
            m = 0,
            n = 0,
            o = 0,
            p = 0,
            q = "",
            r = null,
            s = null,
            t = null,
            u = null,
            v = null;
        for (58 == i && 32 == j ? (d = {
                    length: 1,
                    ch0: 33
                },
                e = {
                    length: 1,
                    ch0: 36
                },
                f = {
                    length: 1,
                    ch0: 37
                },
                o = 40,
                p = 126,
                m = c(b.substr(14, 19)),
                n = 33) : 58 == i && 58 == j && 32 == k ? (d = {
                    length: 1,
                    ch0: 171
                },
                e = {
                    length: 1,
                    ch0: 169
                },
                f = {
                    length: 1,
                    ch0: 187
                },
                o = 40,
                p = 126,
                m = c(b.substr(15, 19)),
                n = 34) : 58 == i && 58 == j && 58 == k && 32 == l && (d = {
                    length: 3,
                    ch0: 33,
                    ch1: 36,
                    ch2: 34
                },
                e = {
                    length: 3,
                    ch0: 35,
                    ch1: 37,
                    ch2: 38
                },
                f = {
                    length: 3,
                    ch0: 37,
                    ch1: 35,
                    ch2: 36
                },
                o = 40,
                p = 126,
                m = c(b.substr(16, 19)),
                n = 35),
            g = b.length - n,
            h = g; h > 0; h--)
            v = n + h - 1,
            r = b.charCodeAt(v),
            u = (g - h + 1) % 10,
            r >= o && p >= r ? q += o > r - m - u ? String.fromCharCode(r - m - u + (p - o + 1)) : String.fromCharCode(r - m - u) : (s = null,
                t = null,
                v >= 1 && (s = b.charCodeAt(v - 1)),
                v >= 2 && (t = b.charCodeAt(v - 2)),
                a(t, s, r, d) ? (q += String.fromCharCode(10),
                    h -= d.length - 1) : a(t, s, r, e) ? (q += String.fromCharCode(13),
                    h -= e.length - 1) : a(t, s, r, f) ? (q += String.fromCharCode(32),
                    h -= f.length - 1) : q += b.charAt(v));
        return q
    }

    function c(a) {
        var b, c, e, f;
        try {
            return b = d(a.charCodeAt(17)),
                c = d(a.charCodeAt(18)),
                e = d(a.charCodeAt(11)),
                f = d(a.charCodeAt(0)) + d(a.charCodeAt(1)) + d(a.charCodeAt(2)) + d(a.charCodeAt(3)) + d(a.charCodeAt(5)) + d(a.charCodeAt(6)) + d(a.charCodeAt(8)) + d(a.charCodeAt(9)) + e + d(a.charCodeAt(12)) + d(a.charCodeAt(14)) + d(a.charCodeAt(15)) + b + c,
                c >= b ? f = f + c - b : f += 3 * (e + 1),
                f
        } catch (g) {
            return 27
        }
    }

    function d(a) {
        if (a >= 48 && 57 >= a)
            return a - 48;
        throw "char value is not a number character"
    }
    return {
        decrypt: b
    }
}();
exports.decrypt =  CryptUtil.decrypt;
