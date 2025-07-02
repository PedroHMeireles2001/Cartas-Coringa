const socket = io();
const localGame = { id: null, players: [] };
const localPlayer = { id: null, nick: null, hand: [], isJudge: false, sended: false };
let selectedCard = "";
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
document.addEventListener('DOMContentLoaded', () => {
  const gameStartButton = document.getElementById('gameStartButton');
    if (gameStartButton) {
        gameStartButton.addEventListener('click', gameStart);
    }
});

socket.on('gameCreated', (data) => {
  console.log('Game created:', data.game);
  showLobby(data.game,data.host);
});

socket.on('gameJoined', (data) => {
  showLobby(data.game, data.player);
});
socket.on('error', (data) => {
  alert(data.message);
});

socket.on('playerJoined', (data) => {
    localGame.players = data.players;
    console.log('Player joined:', data.players);
    updatePlayersList();
});

function showLobby(game,player) {
  localGame.id = game.id;
  localGame.players = game.players;
  localPlayer.id = player.id;
  localPlayer.nick = player.nick;
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
  socket.emit('gameStart', localGame.id);
  console.log('Requesting game start for game:', localGame.id);
}

//game

document.addEventListener('DOMContentLoaded', () => {
    const playCardButton = document.getElementById('btnSendCard');
    if (playCardButton) {
        playCardButton.addEventListener('click', playSelectedCard);
    }
});

socket.on('gameStarted', (data) => {
    alert('Game started !');
    console.log('Game started:', data);
    showPage('game');
    updateGame(data);
});

socket.on('gameUpdate', (data) => {
    console.log('Game update:', data);
    updateGame(data);
});

socket.on('voteUpdate', (data) => {
    alert(`Judge ${data.judge.nick} voted for player ${data.votedPlayer.nick}`);
    if (data.nextJudge) {
        localPlayer.isJudge = data.nextJudge.id === localPlayer.id;
        localPlayer.sended = false; // Reset the card played status for the next round
        localGame.players.map(p => {
            p.isJudge = p.id === data.nextJudge.id;
        });
        console.log(`Next judge is: ${data.nextJudge.nick}`);
    }
});

function updateGame(data){
    localGame.players = data.game.players;
    localGame.table = data.game.table;
    localPlayer.hand = data.game.players.find(p => p.id === localPlayer.id).hand || [];
     if(data.game.players.find(p => p.id === localPlayer.id).isJudge) {
         localPlayer.isJudge = true;
     }
    console.log('Local player hand:', localPlayer.hand);
    console.log('Game table updated:', localGame.table);
    
    updateGameTable();
}

function selectCard(card) {
    if (localPlayer.hand.includes(card)) {
        selectedCard = card;
        for(let e of document.querySelectorAll('.white-card')) {
            e.classList.remove('selected');
        }
        const cardElement = document.querySelector(`.white-card:contains('${card}')`);
        if (cardElement) {
            cardElement.classList.add('selected');
        }
    } else {
        alert('You cannot play this card.');
    }
}

function playSelectedCard() {
    if (!selectedCard) {
        alert('Please select a card to play.');
        return;
    }
    if( localPlayer.sended) {
        alert('You have already played a card this round.');
        return;
    }

    if(localPlayer.isJudge) {
        alert('You are the judge and cannot play a card.');
        return;
    }

    if (localPlayer.hand.includes(selectedCard)) {
        socket.emit('playCard', { gameId: localGame.id, playerId: localPlayer.id, card: selectedCard });
        localPlayer.sended = true
        selectedCard = ""; // Reset selected card after playing
    } else {
        alert('You cannot play this card.');
    }
}

function voteCard(player) {
    if (!localPlayer.isJudge) {
        alert('Only the judge can vote for a card.');
        return;
    }
    socket.emit('voteCard', { gameId: localGame.id, votedPlayerId: player.id, judgeId: localPlayer.id });
    console.log(`Judge ${localPlayer.nick} voted for player ${player.nick}`);
}

function updateGameTable() {
    const blackCardElement = document.getElementById('blackCard');
    if (blackCardElement) {
        blackCardElement.innerText = localGame.table.blackCard;
    }

    const whiteCardsElement = document.getElementById('whiteCards');
    if (whiteCardsElement) {
        whiteCardsElement.innerHTML = '';
        localPlayer.hand.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card', 'bg-light', 'text-dark',"white-card");
            cardElement.innerText = card;
            cardElement.addEventListener('click', () => selectCard(card));
            whiteCardsElement.appendChild(cardElement);
        });
    }

    const tableElement = document.getElementById('table');
    if (tableElement) {
        tableElement.innerHTML = '';
        localGame.table.whiteCards.forEach(item => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card', 'bg-light', 'text-dark',"white-card");
            cardElement.innerText = `${item.player.nick}: ${item.card}`;
            cardElement.addEventListener('click', () => voteCard(item.player));
            if (item.revealed) {
                cardElement.classList.add('revealed');
            }
            tableElement.appendChild(cardElement);
        });
    }

    const playerListElement = document.getElementById('playerList');
    if (playerListElement) {
        playerListElement.innerHTML = '';
        localGame.players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.classList.add('player');
            playerElement.innerText = `${player.nick}#${player.id} - ${player.score || 0}`;
            if (player.isJudge) {
                playerElement.classList.add('judge');
            }
            playerElement.addEventListener('click', () => voteCard(player));
            playerListElement.appendChild(playerElement);
        });
    }
}