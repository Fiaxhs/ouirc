// Dependencies
var _ = require('underscore');

// Expose main
module.exports = Main

function Main(window){
    this.window = window;
    this.$ = window.$;
}

Main.prototype.build = function() {
    var self = this;
    this.$('#wrapper').append(
        '<div id="main">' +
            '<div id="servers-container"></div>' +
            '<div id="messages-container"></div>' +
            '<div id="users-container"></div>' +
        '</div>' +
        '<div id="textbox-container" editable="true">' +
            '<div id="textbox-left"></div>' +
            '<div id="textbox-center">' +
                '<input type="text" id="textbox" placeholder="Type a message...">' +
            '</div>' +
            '<div id="textbox-right"></div>' +
        '</div>');

    this.main = this.$('#main');
    this._servers = this.$('#servers-container');
    this._messages = this.$('#messages-container');
    this._users = this.$('#users-container');
    this._textbox = this.$('#textbox');

    this._servers.click(this.onChannelClick.bind(this));
    this._servers.resizable({
        handles: "e",
        alsoResize: "#textbox-left",
        minWidth: 150,
        maxWidth: 400
    });

    this._messages.click(this.onLinkClick.bind(this));
    this.$('body').keypress(function (e){
        self._textbox.value = self._textbox.value + String.fromCharCode(e.which);
        self._textbox.focus();
    });
    this.bindShortCuts();
    this.handleDrag();
};

// --------------------------------------
// Channel / servers listing
// --------------------------------------

Main.prototype.onChannelClick = function(e) {
    var target = this.$(e.target),
        chan, serv;
    chan = target.hasClass('channel') ? target : target.parent('.channel');
    if (chan.length) {
        this._servers.find('.active').removeClass('active');
        chan.addClass('active');
    }

    serv = target.hasClass('servername') ? target : target.parent('.servername');
    if (serv.length) {
        this._servers.find('.active').removeClass('active');
        serv.addClass('active');
    }
    this._textbox.focus();
};

Main.prototype.onLinkClick = function(e) {
    var target = this.$(e.target);
    if (target.is("a")) {
        global.openUrl(target.attr('href'));
        e.preventDefault();
    }
};

Main.prototype.handleDrag = function() {
  this._servers.sortable({
    distance: 15,
    axis: 'y'
  });
};

// --------------------------------------
// DOM shortcuts
// --------------------------------------
Main.prototype.getServerListElement = function(name) {
    return this.getServersContainer().find('[data-chan="' + name +'"]');
};

Main.prototype.getUnreadElement = function(name) {
    return this.getServerListElement(name).find('span');
};

Main.prototype.getMessagesContainer = function() {
    return this._messages;
};

Main.prototype.getUsersContainer = function() {
    return this._users;
};

Main.prototype.getServersContainer = function() {
    return this._servers;
};

Main.prototype.getTextbox = function() {
    return this._textbox;
};
// --------------------------------------
// Users
// --------------------------------------

Main.prototype.hideUserLists = function() {
    this._users.hide();
};

Main.prototype.showUserLists = function() {
    this._users.show();
};

// --------------------------------------
// Shortcuts
// --------------------------------------

Main.prototype.bindShortCuts = function() {
    var self = this,
        hotkeys = {
            'meta+up': this.goUp,
            'meta+down': this.goDown,
        };

    _.each(hotkeys, function (fn, hk){
        self.$('body').on('keydown', null, hk, fn.bind(self));
        self.$('#textbox').on('keydown', null, hk, fn.bind(self));
    });

    self.$('#textbox').tabcomplete(function (word){
        return self.$('.users:visible').find('.actual-nickname').map(function() {
            if (!this.innerHTML.toLowerCase().indexOf(word.toLowerCase())){
                return this.innerHTML;
            }
        });
    }, {
        hint: null
    });
};

Main.prototype.go = function(where, active) {
    var chansAndServs = this.$('#servers-container .servername, #servers-container .channel'),
        self = this,
        found = false;
    chansAndServs.each(function (idx, elm) {
        if (!found && self.$(elm).hasClass('active')) {
            var len = chansAndServs.length ,
                newIdx = (idx + len + where) % len;
            self.$(chansAndServs[newIdx]).click();
            found = true;
        }
    });
};

Main.prototype.goUp = function(e) {
    this.go(-1);
};
Main.prototype.goDown = function(e) {
    this.go(1);
};

Main.prototype.goUpActive = function(e) {
    this.go(-1, true);
};
Main.prototype.goDownActive = function(e) {
    this.go(1, true);
};