const socket = io();

const url = window.location.pathname;
const partes = url.split('/');
const id = partes[2];
const jogadores = [];


socket.on('gameJoined', (data) => {
  const game = data.game;
  const player = data.player;
  jogadores.push(player);
});



function gameStart() {
  socket.emit('gameStart', id);
}