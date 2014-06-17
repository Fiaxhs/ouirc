// Expose the client
module.exports = MessagesList;

var _ = require('underscore');
var moment = require('moment');


// http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) + '';
};

function MessagesList(){
  this._element = global.mainWindow.$('<div class="messages"></div>');
  global.mainWindow.getMessagesContainer().append(this._element);
}

MessagesList.prototype.addMessage = function(nick, msg, className) {
  className = 'message ' + className;
  this._element.append('<div class="' + className + '">' + this.formatMessage(nick, msg) + '</div>');
};



MessagesList.prototype.scrollToDown = function() {
  this._element.scrollTop(this._element.prop('scrollHeight'))
};

MessagesList.prototype.isAtBottom = function() {
  return this._element.prop('scrollHeight') == this._element.height() + this._element.scrollTop();
};



MessagesList.prototype.show = function() {
  global.mainWindow.getMessagesContainer().find('.messages').hide();
  this._element.show();
};

MessagesList.prototype.setMarker = function() {
  this._element.find('.marker').remove();
  this._element.append('<div class="marker"></div>');
};

MessagesList.prototype.formatMessage = function(nick, msg) {
  var time = '<span class="time">[' + moment().format('hh:mm:ss') + ']</span> ';
  if (nick) {
    var className = 'nick_' + nick.hashCode().charAt(0);

    nick = '<span class="nickname ' + className + '">' + _.escape('<' + nick + '>') + '</span> ';
  } else {
    nick = '';
  }

  // msg = msg.replace(/(http(s)?:\/\/([^\s])+)/, '<a href="$1">$1</a>');
  msg = this.formatText(msg);
  return time + nick + msg;
};


MessagesList.prototype.remove = function() {
  this._element.remove();
};

MessagesList.prototype.formatText = function(text) {
    var words = text.split(' ');
    for (var i = 0; i < words.length; i++) {
        words[i] = this.formatWord(words[i]);
    };
    return words.join(' ');
};

MessagesList.prototype.formatWord = function(word) {
    if (word.match("^http(s)?:\/\/")) {
        word = '<a href="' + word + '">' + word + '</a>';
    }

    return word;
};