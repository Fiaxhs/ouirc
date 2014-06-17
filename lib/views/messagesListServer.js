// Expose the client
module.exports = MessagesListServer;


messagesList = require('./messagesList');
var util = require("util");

function MessagesListServer(){
    this._element = global.mainWindow.$('<div class="messages"></div>');
    global.mainWindow.getMessagesContainer().append(this._element);
}

util.inherits(MessagesListServer, messagesList);

MessagesListServer.prototype.addMessage = function(msg) {
    this._element.append('<div class="message">' + msg + '</div>');
};

MessagesListServer.prototype.show = function() {
  global.mainWindow.getMessagesContainer().find('.messages').hide();
  global.mainWindow.getUsersContainer().find('.users').hide();
  this._element.show();
};