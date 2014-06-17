
// Dependencies
var irc = require('irc');
var _ = require('underscore');
var channel = require('./channel');
var ChannelsListView = require('./views/channelsList');
var messagesListServerView = require('./views/messagesListServer');
var pm = require('./pm');


// Expose the client
module.exports = Server;

function Server(options){
    this._currentChannel = null;
    this.options = options;
    this.channels = {};
    this.pms = {};
    this.id = _.uniqueId('server_');
    this.views = {
        channelsList: new ChannelsListView(this.id, this.options.displayName || this.options.host),
        messagesList: new messagesListServerView()
    };
}
// --------------------------------------
// Instanciate a client and connect
// --------------------------------------

Server.prototype.connect = function() {
    var self = this;
    this.client = new irc.Client(this.options.host, this.options.nick, this.options);
    this.client.addListener('raw', function(message){
      // console.log(message);
      // console.log('RAAAWWT' + message.args);
      // console.log(message.args);
    });

    // Add click on server tab
    this.getServerlistElement().click(function (){
        self.onSelect();
    });

    // Set users to channel when joining
    this.client.addListener('names', function (chan, nicks){
        if (self.channels[chan]) {
            self.channels[chan].setUsers(nicks);
        }
    });

    // Join when connected
    this.client.addListener('registered', function() {
        self.joinChannels(self.options.channels);
    });

    // MP
    this.client.addListener('pm', function(nick, text, message) {
        self.addPm(nick, text);
    });

    // MOTD
    this.client.addListener('motd', function(motd) {
        self.addMessage(motd);
    });

    // Handle nick changes
    this.client.addListener('nick', function(oldnick, newnick, channels) {
        _.each(channels, function (chan){
            if (self.channels[chan]) {
                self.channels[chan].changeNick(oldnick, newnick);
            }
        });
    });

    // "handle" errors
    this.client.addListener('error', function(message) {
        console.log('error: ', message);
    });

    this.client.addListener('join', this.joinChannel.bind(this));

    // set as active
    this.select();
};

// --------------------------------------
// Join a channel
// --------------------------------------
Server.prototype.joinChannel = function (chan) {
    if (this.channels[chan]) {
        return;
    }
    // Create channel
    var myChan = new channel(this, chan);

    // add to chan list
    this.views.channelsList.addChan(myChan.id, myChan.name);

    myChan.join();
    this.channels[chan] = myChan;


    // Add event on click
    myChan.getServerlistElement().click(function (){
        myChan.select();
    });
};

// Join channels
Server.prototype.joinChannels = function (channels) {
    self = this;
    _.each(channels, function (chan){
        self.joinChannel(chan);
    });
};

// --------------------------------------
// Input handling
// --------------------------------------
Server.prototype.handleInput = function(message) {
    var self = this,
        knownCommands = ['join', 'part', 'me', 'nick'];
    // Looks like a command?
    if (message.substr(0, 1) === '/') {
        var command = message.substr(1, message.indexOf(' ') > 0 ? message.indexOf(' ') - 1 : 99999999).toLowerCase(); // that will do.
        if (_.contains(knownCommands, command)) {
            message = message.substr(command.length + 1).trim();
            this['send' + command[0].toUpperCase() + command.slice(1)](message);
            return;
        }
    }

    this.say(message);
}
// Join command
Server.prototype.sendJoin = function(message) {
    var chans = message.split(/\s+/),
        self = this;
    _.each(chans, function (chan){
        if (chan.substr(0,1) != '#') {
            chan = '#' + chan;
        }
        self.joinChannel(chan);
    });
};
// Part command
Server.prototype.sendPart = function(message) {
    var chans = message.split(/\s+/),
        self = this;
    _.each(chans, function (chan){
        if (chan == '') {
            chan = self.getCurrentChannel().name;
        }
        if (chan.substr(0,1) != '#') {
            chan = '#' + chan;
        }
        if (chan == self.getCurrentChannel().name) {
            global.mainWindow.goUp();
        }
        self.channels[chan].destroy();
        self.client.send('PART', chan);
        delete self.channels[chan];
    });
};
// me command
Server.prototype.sendMe = function(message) {
    this.say("\x01ACTION " + message + "\x01");
};
// nick command
Server.prototype.sendNick = function(message) {
    this.client.send('NICK', nick);
};

// names command
Server.prototype.sendNames = function(message) {
    this.client.send('NAMES', message);
};

// Say something
Server.prototype.say = function(message) {
    if (this.getCurrentChannel()) {
        this.getCurrentChannel().say(message);
    } else {
        this.addMessage(message);
    }
};

// Add message to our message list
Server.prototype.addMessage = function(msg) {
    if (msg.command === 'ERROR') {
        this.views.messagesList.addMessage('Error: ' + msg.args[0]);
    } else if (msg.command === 'NOTICE'){
        this.views.messagesList.addMessage('Notice: ' + msg.args[0]);

    }
};


// --------------------------------------
// Chan selection
// --------------------------------------

// Select a channel
Server.prototype.setCurrentChannel = function(chan) {
    // If chan currently selected, advide him that he's no longer active
    if (this.getCurrentChannel()) {
        this.getCurrentChannel().unSelect();
    }
    // mark new
    this._currentChannel = chan;

    // Also inform app that this server is now the current
    global._currentServer = this.getId();
};

Server.prototype.getCurrentChannel = function() {
    return this.channels[this._currentChannel] || this.pms[this._currentChannel];
};

// Self select
Server.prototype.select = function() {
    this.getServerlistElement().click();
};
Server.prototype.onSelect = function() {
    this.setCurrentChannel(null);
    this.views.messagesList.show();
}


// --------------------------------------
// PM
// --------------------------------------

Server.prototype.addPm = function(nick, text) {
    var query = this.getPmFor(nick);
    query.addMessage(nick, text, []);
};

Server.prototype.getPmFor = function(nick) {

    if (!this.pms[nick]) {
        // Create pm
        var query = new pm(this, nick);

        // add to chan list
        this.views.channelsList.addPm(query.id, query.name);

        // Add event on click
        query.getServerlistElement().click(function (){
            query.select();
        });
        this.pms[nick] = query;
    }

    return this.pms[nick];
};
// --------------------------------------
// Marker
// --------------------------------------

// Set "last read" marker
Server.prototype.setMarker = function() {
    _.each(this.channels, function (chan){
        chan.setMarker();
    });
};

// --------------------------------------
// Getter
// --------------------------------------

Server.prototype.getId = function() {
    return this.id;
};

// --------------------------------------
// Dom shortcuts
// --------------------------------------
Server.prototype.getServerlistElement = function() {
    return global.mainWindow.getServerListElement(this.id);
};
