const socket = io();
const localGame = { id: null, players: [] };

//index


function showPage(page) {
  const pages = ['index', 'lobby', 'game'];
  pages.forEach(p => {
    const el = document.getElementById(p);
    if (el) {
      el.style.display = (p === page) ? 'block' : 'none';
    }
  });
}

function play() {
    const nick = document.getElementById('nick').value.trim();
    const gameId = document.getElementById('partidaId').value.trim();

    if (!nick || !gameId) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    socket.emit('joinGame', { nick: nick, gameId: gameId });    
}

document.addEventListener('DOMContentLoaded', () => {
    showPage('index');

    document.getElementById('playButton').addEventListener('click', play);
    document.getElementById('createGameButton').addEventListener('click', createGame);
    //document.getElementById('gameStartButton').addEventListener('click', gameStart);
});

function createGame() {
    const nick = document.getElementById('nick').value.trim();

    if (!nick) {
        alert('Por favor, preencha o campo Nick.');
        return;
    }
    socket.emit('createGame', { nick: nick });
}
//lobby

socket.on('gameCreated', (data) => {
  console.log('Game created:', data.game);
  showLobby(data.game);
});

socket.on('gameJoined', (data) => {
  showLobby(data.game);
});
socket.on('error', (data) => {
  alert(data.message);
});

socket.on('playerJoined', (data) => {
  console.log('Player joined:', data.player);
  localGame.players.push(data.player);
  updatePlayersList();
});

function showLobby(game) {
  localGame.id = game.id;
  localGame.players = game.players;
  console.log('Game joined:', game);
  showPage('lobby');
  updatePlayersList();
  updateGameCode();
}

function updatePlayersList() {
  const ul = document.getElementById('listaJogadores');
  ul.innerHTML = '';
  localGame.players.forEach(j => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.innerText = `${j.nick}#${j.id}`;
    ul.appendChild(li);
  });
}

function updateGameCode() {
  const gameCodeElement = document.getElementById('gameCode');
  if (gameCodeElement) {
    gameCodeElement.innerText = localGame.id;
  }
}

function gameStart() {
  socket.emit('gameStart', game.id);
}