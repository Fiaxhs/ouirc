// Dependencies
var server = require('./lib/server');
var mainView = require('./lib/views/main');
var gui = require('nw.gui');
var win = gui.Window.get();
var Notification = require('node-notifier');
// var preferences = require('preferences');


var _ = require('underscore');
global._currentServer = null;


var Ouirc = function () {
  this.servers = [];
  this.history = [];
  this.mainWindow = new mainView(window);
  global.mainWindow = this.mainWindow;


  this.mainWindow.build();
  this.attachEvents();
  this.connectServers();
}

Ouirc.prototype.connectServers = function() {
  // var server1 = new server({
  //   host: 'irc.server.org',
  //   displayName: 'Server1',
  //   nick: 'myNick',
  //   floodProtection: true,
  //   floodProtectionDelay: 1000,
  //   channels: []
  // });
  // server1.connect();
  // this.servers[server1.getId()] = server1;
  // global._currentServer = server1.getId();

  // var server2 = new server({
  //   host: 'irc.server2.org',
  //   displayName: 'Server1',
  //   nick: 'myNick2',
  //   floodProtection: true,
  //   floodProtectionDelay: 1000,
  //   channels: []
  // });
  // server2.connect();
  // this.servers[server2.getId()] = server2;
  // 
  // [...]
};


Ouirc.prototype.getActiveServer = function() {
  return this.servers[global._currentServer];
};

Ouirc.prototype.attachEvents = function() {
  var self = this;
  this.mainWindow.getTextbox().keypress(function (event){
    if (event.which == 13) {
      event.preventDefault();
      self.getActiveServer().handleInput(this.value);
      this.value = '';
    }
  });

  win.on('blur', function() {
    _.each(self.servers, function (server){
      server.setMarker();
    });
  });
};


// --------------------------------------
// Utils
// --------------------------------------
global.notify = function (title, text){
  var notifier = new Notification();
  notifier.notify({
    "title": title,
    "message": text,
    "sound": "Funk"
  });
}

global.openUrl = function (url) {
    gui.Shell.openExternal(url);
}

new Ouirc();