const socket=require('socket.io');
const app=socket('3000')
app.on('connection',function(socket){
    console.log('a user connection');
    socket.emit('welcome',"test");
});
console.log('listen on 3000');