define(function(require, exports, module) {
    "use strict";

    var at,
        ch,
        text,
        tag,  // tag
        ind1, // indicator 1
        ind2, // indicator 2
        code, // code.
        field,// field
        error = function(m) {
            throw {
                name: 'SyntaxError',
                message: m,
                at: at,
                text: text
            }
        },
        next = function(c) {
            if (c && c != ch) {
                error("Expected `" + c + "' but got `" + ch + "'")
            }

            ch = text.charAt(at);
            at++;

            return ch;
        },
        white = function() {
            while (ch && ch <= ' ') {
                next()
            }
        },
        subfield = function() {
            if (!tag) {
                error("Expected a tag before a subfield")
            }
            if (/^00[0-9]$/.exec(tag)) {
                error("Controlfields cannot have subfields")
            }
            next('$')
            code = next('$')
            next(code)

            if (/^[^a-z0-9]$/.exec(code)) {
                error("Subfield code is not supported: `"+code+"'")
            }
            content();
        },
        datafield = function() {
            tag = ch
            tag += next()
            tag += next()

            // controlfield
            if (/^00[0-9]$/.exec(tag)) {
                next()
                next(' ')
                white();
                content();
            } else {
                next()
                ind1 = next(' ')
                if (/^[^_#0-9]/.exec(ind1)) {
                    error("Indicator1 is malformed `"+ind1+"'")
                }
                next(ind1)
                ind2 = next(' ')
                if (/^[^_#0-9]/.exec(ind2)) {
                    error("Indicator2 is malformed `"+ind2+"'")
                }
                next(ind2)
                white();
                subfield()
            }
        },
        content = function() {
            var reading = true
            field = ch
            if (ch == '$') {
                next()
                if (ch == '$') {
                     error("Got a subfield when I was expecting a value.")
                }
                field += ch
            }

            while(reading) {
                next()
                if (ch == "\n") {
                    var space = ""
                    while (ch == "\n") {
                        space += ch
                        next()
                    }

                    if (ch >= '0' && ch <= '9') {
                        reading = false
                    } else {
                        field += space
                    }
                } else if (ch == "") {
                    reading = false
                }
            }

            value();
        },
        value = function() {
            white();
            if (ch == '$') {
                subfield()
            } else if (ch >= '0' && ch <= '9') {
                datafield()
            } else if (ch == '') {
                return // done
            } else {
                error("Expecting a datafield or subfield, got: `" + ch + "'")
            }
        }

    return function(source, reviver) {
        var result

        text = source
        at = 0
        ch = ' '
        while(ch != '') {
            value()
            white()
        }

        return result
    }
})
