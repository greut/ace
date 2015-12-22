define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var parser = require('./marc/marcparser');
var Mirror = require("../worker/mirror").Mirror;

var Worker = exports.Worker = function(sender) {
    Mirror.call(this, sender);
    this.setTimeout(400);
    this.context = null;
};

oop.inherits(Worker, Mirror);

(function() {

    this.setOptions = function(options) {
        this.context = options.context;
    };

    this.onUpdate = function() {
        var value = this.doc.getValue();
        var errors = []
        if (!value) {
            return;
        }
        try {
            parser(value)
        } catch (e) {
            var pos = this.doc.indexToPosition(e.at-1);
            errors.push({
                row: pos.row,
                column: pos.column,
                text: e.message,
                type: "error"
            });
        }
        this.sender.emit("annotate", errors);
    };

}).call(Worker.prototype);

});
