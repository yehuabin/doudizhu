const socket = require('socket.io');
const app = socket('3000')



app.on('connection', function (socket) {
    // socket.broadcast.emit('hi');
   
    console.log(` a user connection `);
    socket.on('login', function (data, fn) {
        socket.username = data;
        console.log(` login : ${JSON.stringify(data)}`);
        fn("server");
    });
    socket.on('msg', function (data) {
        for (let i = 0; i < socket.room.players.length; i++) {
            const element = socket.room.players[i];
            element.emit("broadMsg",data);
        }
        //收到消息广播
       // socket.broadcast.emit('broadMsg', data);
        console.log(`msg : ${JSON.stringify(data)}`);
    });
    socket.on('disconnect', function () {
      
        console.log(`user disconnected `);

    });

});
console.log('listen on 3000');