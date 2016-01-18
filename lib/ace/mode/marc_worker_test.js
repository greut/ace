if (typeof process !== "undefined") {
    require("amd-loader");
}

define(function(require, exports, module) {
"use strict";

var assert = require("../test/assertions");
var Worker = require("./marc_worker").Worker;


module.exports = {
    setUp : function() {
        this.sender = {
            on: function() {},
            callback: function(data, id) {
                this.data = data;
            },
            events: [],
            emit: function(type, e) {
                this.events.push([type, e]);
            }
        };
    },

    "test control field": function() {
        var worker = new Worker(this.sender);
        worker.setValue("000     123456");
        worker.deferredUpdate.call();
        assert.equal(this.sender.events[0][1].length, 0);
    },

    "test control field doesn't expect a value": function() {
        var worker = new Worker(this.sender);
        worker.setValue("000     $$a 123456");
        worker.deferredUpdate.call();
        assert.equal(this.sender.events[0][1].length, 1);
        assert.equal(this.sender.events[0][1][0].type, "error");
    },

    "test data field": function() {
        var worker = new Worker(this.sender);
        worker.setValue("100 _ _ $$a Hello, World!");
        worker.deferredUpdate.call();
        assert.equal(this.sender.events[0][1].length, 0);
    },

    "test data field without indicators": function() {
        var worker = new Worker(this.sender);
        worker.setValue("100     $$a Hello, World!");
        worker.deferredUpdate.call();
        assert.equal(this.sender.events[0][1].length, 1);
        assert.equal(this.sender.events[0][1][0].type, "error");
    },

    "test data field without subfield": function() {
        var worker = new Worker(this.sender);
        worker.setValue("100 _ _ Hello, World!");
        worker.deferredUpdate.call();
        assert.equal(this.sender.events[0][1].length, 1);
        assert.equal(this.sender.events[0][1][0].type, "error");
        assert.equal(this.sender.events[0][1][0].text, "Expected `$' but got `H'");
    },

    "test data field with multiline data": function() {
        var worker = new Worker(this.sender);
        worker.setValue("100 _ _ $$a Hello,\n World!");
        worker.deferredUpdate.call();
        assert.equal(this.sender.events[0][1].length, 0);
    },

    "test data field without subfield second line": function() {
        var worker = new Worker(this.sender);
        worker.setValue("000     12345\n\n" +
                        "100 _ _ Hello, World!");
        worker.deferredUpdate.call();
        assert.equal(this.sender.events[0][1].length, 1);
        assert.equal(this.sender.events[0][1][0].type, "error");
        assert.equal(this.sender.events[0][1][0].text, "Expected `$' but got `H'");
    },

    "test control field 008 must be 40 chars long": function() {
        var worker = new Worker(this.sender);
        worker.setValue("008     123456");
        worker.deferredUpdate.call();
        assert.equal(this.sender.events[0][1].length, 1);
        assert.equal(this.sender.events[0][1][0].type, "error");
        assert.equal(this.sender.events[0][1][0].text,
                     "008 must be exactly 40 characters long, got 6.");
    },
};

});

if (typeof module !== "undefined" && module === require.main) {
    require("asyncjs").test.testcase(module.exports).exec();
}
