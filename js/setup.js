// var currUser = (prompt('What is your name?') || 'anonymous');
var currUser = "carl";
var currRoom = "the 8th floor";
window.friends = {};
/*
if(!/(&|\?)username=/.test(window.location.search)){
  var newSearch = window.location.search;
  if(newSearch !== '' & newSearch !== '?'){
    newSearch += '&';
  }
  newSearch += 'username=' + (currUser || 'anonymous');
  window.location.search = newSearch;
}
*/

var lastMsgId = '';

var receive = function() {
  $.ajax('http://127.0.0.1:8080/classes/messages', {
    contentType: 'application/json',
    success: function(data) {
      var latestMsg = data.results[data.results.length - 1];
      if (latestMsg.objectId === lastMsgId) {
        return;
      }

      var username = (latestMsg.username || 'anonymous');
      username = '<div class="user">' + username + '</div>';

      // if username in friends hash, bold username
      if (friends[username]) $('.user').addClass('friend');

      var text = '<div class="msg">' + latestMsg.text + '</div>';

      // var time = moment(latestMsg.updatedAt).fromNow();
      // time = '<div class="time">' + time + '</div>';
      // var currDiv = $('<div class="message"/>').html(username + text + time);

      var currDiv = $('<div class="message"/>').html(username + text);
      $('.messages').prepend(currDiv);
      lastMsgId = latestMsg.objectId;
    },
    complete: function() {
      $('.user').on('click', function() {
        console.log($(this).html());
        friends[$(this).html()] = true;
      });
    }
  });
};

var send = function(usr, txt, room) {
  var makeMessage = function() {
    var myObj = {'username': usr,
      'text': txt,
      'roomname': room};
    return JSON.stringify(myObj);
  };

  $.ajax('http://127.0.0.1:8080/classes/messages', {
    contentType: 'application/json',
    type: 'POST',
    data: makeMessage(),
    success: function(data) {
      $('#main').append(data.results[0].username);
    }
  });
};

var receiveLoop = function() {
  receive();
  setTimeout(receiveLoop, 3000);
};

$(document).ready(function() {
  receiveLoop();
  $('.sendButton').on('click', function() {
    var newMsg = $('.sendBox').val();
    send(currUser, newMsg, currRoom);
    $('.sendBox').val('');
  });
});

