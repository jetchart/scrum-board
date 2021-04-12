var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
const connectionService = require('./connectionService')
const taskService = require('./taskService')
const boardService = require('./boardService')
const fs = require('fs')

var os = require("os");
var connections = [];
var tasks = [];
var boards = [];
var task = null;
var useBD = false;

io
.of('/api')
.on('connection', socket => {

	//io.set('close timeout', 60*60*24);

  console.log(`A user connected with socket id ${socket.id}`);

  /************* CONECTIONS **************/

  socket.on('subscribe', (user) => {

    //Check if exists other user with same name and room
    const existsOtherByNameAndRom = connectionService.existsOtherByNameAndRom(socket.id, user.name, user.room, connections);
    if (existsOtherByNameAndRom != null) {
      io.of('/api').to(socket.id).emit('REDIRECT');
      return;
    }

    //Check if exist
    const connection = connectionService.findById(socket.id, connections);
    if (connection === undefined) {
      socket.join(user.room);
      connections.push({'id': socket.id, 'user': user});
      console.log("PUSH USER", user);
    }

    /* SYNC users */
    const connectionsRoom = connectionService.filterAllByRoom(user.room, connections);
    socket.in(user.room).emit('SYNC', connectionsRoom);
    io.of('/api').to(socket.id).emit('SYNC', connectionsRoom);

    /* Sync board */
    let boardRoom = boardService.filterAllByRoom(user.room, boards);
    console.log("FILTER BOARD", boardRoom);
    if (!boardRoom) {
      if (!useBD) {
        console.log("file", fs.existsSync(user.room + '.json'));
        if (!fs.existsSync(user.room + '.json')) {
          boardRoom = {room: user.room, board: [
            {
              name: 'To Do',
              children: []
            },
            {
              name: 'In Progress',
              children: []
            },
            {
              name: 'Testing',
              children: []
            },
            {
              name: 'Done',
              children: []
            }
          ]};
        } else {
          const data = fs.readFileSync(user.room + '.json', {encoding:'utf8', flag:'r'}); 
          boardRoom = JSON.parse(data);
        }
        boards.push(boardRoom);
        io.of('/api').to(socket.id).emit('SYNC_BOARD', boardRoom);
      } else {
      boardService.getREST$(user.room).then(data => {
        data = JSON.parse(data);
        console.log("REST", data);
        if (!data || data.length == 0) {
          boardRoom = {room: user.room, board: [
            {
              name: 'To Do',
              children: []
            },
            {
              name: 'In Progress',
              children: []
            },
            {
              name: 'Testing',
              children: []
            },
            {
              name: 'Done',
              children: []
            }
          ]};
        } else {
          boardRoom = {room: user.room, sprintStart: data[0].sprintStart, sprintEnd: data[0].sprintEnd, board: data[0].board};
          console.log('PARSEADO', boardRoom);
        }
        boards.push(boardRoom);
        io.of('/api').to(socket.id).emit('SYNC_BOARD', boardRoom);
      });
    }
    } else {
      console.log("SYNC_BOARD", boardRoom);
      io.of('/api').to(socket.id).emit('SYNC_BOARD', boardRoom);
    }
  });

  socket.on('unsubscribe', () => {
    const connection = connectionService.findById(socket.id, connections);
    if (connection != null && connection.user.room != null) {
      /* SYNC */
      console.log("DISCONNECT USER (unsubscribe)", connection);
      connectionService.deleteById(connection.id, connections);
      socket.in(connection.user.room).emit('SYNC', connectionService.filterAllByRoom(connection.user.room, connections));
    }
  });

  socket.on('disconnect', () => {
    //console.log('socket: disconnected');
    const connection = connectionService.findById(socket.id, connections);
    if (connection != null && connection.user.room != null) {
      /* SYNC */
      console.log("DISCONNECT USER (disconnect)", connection);
      connectionService.deleteById(connection.id, connections);
      socket.in(connection.user.room).emit('SYNC', connectionService.filterAllByRoom(connection.user.room, connections));
    }
  });

  /************* PING **************/

  socket.on('PING', (data) => {
    //console.log("PONG!", data);
  });

  
  /************* CHAT **************/

  socket.on('SEND_MESSAGE', (data) => {
    socket.in(data.user.room).emit('MESSAGE', data);
  });

  /************* BOARD **************/

    socket.on('UPDATE_BOARD', (data) => {
      console.log("UPDATE_BOARD", JSON.stringify(data));
      socket.in(data.room).emit('SYNC_BOARD', data);
      data.board.forEach(b => b.children = b.children.filter(c => c.changed != 'D'));
      data.board.forEach(b => b.children.forEach(c => c.changed = null));
      boardService.update(data.room, boards, data);
      if (!useBD) {
        fs.writeFile(data.room + '.json', JSON.stringify(data), function (err) {
          if (err) return console.log("Error writing file", err);
        });
      } else {
        boardService.saveOrUpdate(data.room, data);
      }
    });

})

/************* SERVER **************/
const port = process.env.PORT || 3000
let server = http.listen(port , () => {
  console.log('Hostname:', os.hostname());
  console.log(`Listening on port: ${port}`)
});
