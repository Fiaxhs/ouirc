// Expose channel
module.exports = Channel;

var _ = require('underscore');
var usersListView = require('./views/usersList');
var messagesListView = require('./views/messagesList');

// --------------------------------------
// Instanciate a channel and join it
// --------------------------------------
function Channel(server, name) {
    this.server = server;
    this.name = name;
    this.id = _.uniqueId('chan_');
    this.users = [];
    this.views = {
        usersList: new usersListView(),
        messagesList: new messagesListView()
    };
    this.active = false;
    this.unread = 0;

    this.views.usersList.getElement().dblclick(this.onUsersDblclick.bind(this));
}

Channel.prototype.join = function() {
    // Join
    this.server.client.join(this.name);
    this.server.sendNames(this.name);

    // Attach events
    this.server.client.addListener('message' + this.name, this.addMessage.bind(this));
    this.server.client.addListener('join' + this.name, this.addUser.bind(this));
    this.server.client.addListener('part' + this.name, this.removeUser.bind(this));
};


// --------------------------------------
// Users handling
// --------------------------------------
Channel.prototype.setUsers = function(nicks) {
    this.users = nicks;
    this.updateUserlist(this.users);
};

Channel.prototype.addUser = function(nick, message) {
    this.addSilentMessage('→ ' + nick + ' joined the channel.');
    this.users[nick] = '';
    this.updateUserlist(this.users);
};

Channel.prototype.changeNick = function(oldnick, newnick) {
    if (this.users[oldnick]) {
        this.addSilentMessage(oldnick + ' is know known as ' + newnick);
        delete this.users[oldnick];
        this.users[newnick] = '';
        this.updateUserlist(this.users);
    }
};

Channel.prototype.removeUser = function(nick, message) {
    this.addSilentMessage('← ' + nick + ' left the channel.' + (message ? ' message: ' + message : ''));
    delete this.users[nick];
    this.updateUserlist(this.users);
};


Channel.prototype.onUsersDblclick = function(e) {
    this.server.getPmFor(e.target.innerText.replace(/^[@~+]/, ''));
};

// --------------------------------------
// Message handling
// --------------------------------------
Channel.prototype.addMessage = function(nick, msg, obj) {
    var isAtBottom = this.views.messagesList.isAtBottom(),
        className = '';

    if (this.isHighlighted(msg)) {
        global.notify(nick, msg);
        className = 'highlight';
    }

    this.views.messagesList.addMessage(nick, msg, className);

    // Scroll down if previously at bottom
    if (isAtBottom) {
        this.views.messagesList.scrollToDown();
    }
    // Increment unread counter if inactive
    if (!this.active) {
        this.unread = this.unread + 1;
        this.getUnreadElement().css('display', 'inline').text(this.unread);
    }
};

Channel.prototype.addSilentMessage = function(msg, obj) {
    var isAtBottom = this.views.messagesList.isAtBottom();
    this.views.messagesList.addMessage(null, msg, []);

    // Scroll down if previously at bottom
    if (isAtBottom) {
        this.views.messagesList.scrollToDown();
    }
}

Channel.prototype.say = function(message) {
    this.server.client.say(this.name, message);
    this.addMessage(this.server.client.nick, message);
};


Channel.prototype.isHighlighted = function(msg) {
  var i = 0,
    highlights = this.getHighlights();
  for (var i = 0; i < highlights.length; i++) {
    if (msg.match(highlights[i])) {
      return true;
    }
  }
  return false;
};

Channel.prototype.getHighlights = function() {
    return [this.server.client.nick, '@all'];
};

// --------------------------------------
// Set active / inactive
// --------------------------------------

Channel.prototype.select = function() {
    this.server.setCurrentChannel(this.name);
    this.views.messagesList.show();
    this.hideUserLists();
    this.showUserList();
    this.active = true;
    this.getUnreadElement().css('display', 'none');
    this.unread = 0;
    this.views.messagesList.scrollToDown();
};

// Called from Server only
Channel.prototype.unSelect = function() {
    this.setMarker();
    this.active = false;
};

// --------------------------------------
// Delete
// --------------------------------------
Channel.prototype.destroy = function() {
    this.removeUserList();
    this.views.messagesList.remove();
    this.getServerlistElement().remove();
};


// --------------------------------------
// DOM shortcuts
// --------------------------------------
Channel.prototype.getServerlistElement = function() {
    return global.mainWindow.getServerListElement(this.id);
};

Channel.prototype.getUnreadElement = function() {
    return global.mainWindow.getUnreadElement(this.id);
};

Channel.prototype.setMarker = function() {
    if (this.active) {
        this.views.messagesList.setMarker();
    }
};

Channel.prototype.showUserList = function() {
    if (this.views.usersList) {
        this.views.usersList.show();
    }
};

Channel.prototype.hideUserLists = function() {
    global.mainWindow.hideUserLists();
};

Channel.prototype.removeUserList = function() {
    if (this.views.usersList) {
        this.views.usersList.remove();
    }
};

Channel.prototype.updateUserlist = function(users) {
    if (this.views.usersList) {
        this.views.usersList.update(users);
    }
};