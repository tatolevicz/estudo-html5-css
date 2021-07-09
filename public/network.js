
const socket = io();

var form = document.getElementById('form');
var input = document.getElementById('input');

var messages = document.getElementById('messages');


form.addEventListener('submit', function(e) {

    e.preventDefault();
    //sending the message to the server
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }

});

socket.on("client-chat-message",function(msg){
    let li = document.createElement("li");
    li.textContent = msg;
    messages.appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
});
