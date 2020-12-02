const _ = require('lodash');
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
};
