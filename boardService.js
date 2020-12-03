const _ = require('lodash');
var request = require("request");
const connectionService = require('./connectionService')

module.exports = {
  filterAllByRoom: function (room, boards) {
    let boardMatch = _.filter(boards, con => con && con.room == room);
    console.log("boardMatch", boardMatch[0]);
    return boardMatch? boardMatch[0] : null;
  },
  update: function (room, boards, board) {
    boards.forEach(element => {
      if (element.room == room) {
        console.log("matcheoooooooo", element, board);
        element.board = board.board;
      }
    });
    return boards;
  },
  getREST$(room) {
    return new Promise((resolve, reject) => {
        var options = {
          method: 'GET',
          url: `https://scrumboard-170f.restdb.io/rest/boards?q={"room": "${room}"}`,
          headers: 
          {   'cache-control': 'no-cache',
              'x-apikey': '5fc8efc289b5646938844118' 
          } 
      };
      request(options, function (error, response, body) {
        if (error) reject(error);
        resolve(body);
      });
    });
  },
  saveOrUpdate(room, board) {
    this.getREST$(room).then(data => {
      data = JSON.parse(data);
      if (data && data[0]) {
        this.updateREST(data[0]["_id"], room, board);
      } else {
        this.saveREST(room, board);
      }
    })
  },
  saveREST(room, board) {
      var options = { method: 'POST',
      url: `https://scrumboard-170f.restdb.io/rest/boards`,
      headers: 
      { 'cache-control': 'no-cache',
        'x-apikey': '5fc8efc289b5646938844118',
        'content-type': 'application/json' },
        body: { 'room': room, 'board': board.board },
      json: true };
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    });
  },
  updateREST(id, room, board) {
    var options = { method: 'PUT',
    url: `https://scrumboard-170f.restdb.io/rest/boards/${id}`,
    headers: 
     { 'cache-control': 'no-cache',
       'x-apikey': '5fc8efc289b5646938844118',
       'content-type': 'application/json' },
       body: { 'room': room, 'board': board.board },
    json: true };
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    });
  }
};
