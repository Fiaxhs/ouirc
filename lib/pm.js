// Expose the client
module.exports = Pm;


var channel = require('./channel');
var _ = require('underscore');
var messagesListView = require('./views/messagesList');
var util = require("util");

function Pm(server, nick) {
    this.server = server;
    this.name = nick;
    this.id = _.uniqueId('pm_');
    this.views = {
        usersList: null,
        messagesList: new messagesListView()
    };
    this.active = false;
    this.unread = 0;
}

util.inherits(Pm, channel);


Pm.prototype.join = function() {
};