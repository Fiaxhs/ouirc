// Expose the client
module.exports = ChannelsList;

function ChannelsList(id, name){
    this._element = global.mainWindow.$('<div class="serverlist">' +
      '<div class="servername" data-chan="' + id + '">' + name + ' <span class="unread"><span></div>' +
      '<div class="chans"></div>' +
      '<div class="pms"></div>' +
    '</div>');
    this._chans = this._element.find('.chans');
    this._pms = this._element.find('.pms');
    global.mainWindow.getServersContainer().append(this._element);
    this.handleDrag();
}

ChannelsList.prototype.addChan = function(id, chan) {
    this._chans.append('<div class="channel" data-chan="' + id + '">' + chan + ' <span class="unread"><span></div>');
};

ChannelsList.prototype.addPm = function(id, nick) {
    this._pms.append('<div class="channel" data-chan="' + id + '">' + nick + ' <span class="unread"><span></div>');
};

ChannelsList.prototype.getChannelElement = function(id) {
    return this._element.find('[data-chan="' + id + '"]')
};

ChannelsList.prototype.handleDrag = function() {
  this._pms.sortable({
    distance: 15,
    axis: 'y'
  });
  this._chans.sortable({
    distance: 15,
    axis: 'y'
  });
};