// Dependencies
var _ = require('underscore');

// Expose the client
module.exports = UsersList;

function UsersList(){
    this._element = global.mainWindow.$('<div class="users"></div>');
    global.mainWindow.getUsersContainer().append(this._element);
}

UsersList.prototype.update = function(nicks) {
    var all,
        narmol = [],
        ops = [],
        that = this,
        sortAlpha = function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        };

    this._element.empty();

    _.each(nicks, function (pre, nick){
        that._element.append('<div class="actual-nickname">' + nick + '</div>');
        if (pre) {
            ops.push(pre+nick);
        } else {
            narmol.push(nick);
        }
    });

    narmol.sort(sortAlpha);
    ops.sort(sortAlpha);

    all = ops.concat(narmol);
    _.each(all, function (nick) {
        that._element.append('<div class="nickname">' + nick + '</div>');
    });
};


UsersList.prototype.remove = function() {
  this._element.remove();
};

UsersList.prototype.show = function() {
    global.mainWindow.showUserLists();
    global.mainWindow.getUsersContainer().find('.users').hide();
    this._element.show();
};