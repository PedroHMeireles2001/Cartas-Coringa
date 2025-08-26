import fs from 'fs';

const games = [];
const blackDeck = fs.readFileSync('./localdb/blackDeck.txt', 'utf-8').split('\n').filter(line => line.trim() !== '');
const whiteDeck = fs.readFileSync('./localdb/whiteDeck.txt', 'utf-8').split('\n').filter(line => line.trim() !== '');

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


function createPlayer(nick) {
  return {
    id: gerarNumeroAleatorio(1000, 9999), // Random ID for the player
    nick: nick,
    isJudge: false,
    isHost: false,
    hand: [],
  };
}

function createGame(player){

  const shuffledBlackDeck = shuffle(blackDeck);
  const shuffledWhiteDeck = shuffle(whiteDeck);
  const host = createPlayer(player);
  const game = {
    id: genCode(),
    players: [{...host,isHost:true,isJudge:true,score:0}],
    state: 'waiting',
    blackDeck: shuffledBlackDeck,
    whiteDeck: shuffledWhiteDeck,
    turn: 0
  };
  
  games.push(game);
  return { game, host };
}

function startGame(code){
  const game = getGame(code);
  for(let player of game.players) {
    // Initialize player hand with 10 white cards
    player.hand = [];
    for (let i = 0; i < 10; i++) {
      player.hand.push(game.whiteDeck.pop());
    }
  }
  game.state = 'started';
  game.table = {
    blackCard: game.blackDeck.pop(), // Draw a black card for the table
    whiteCards: [], // Will hold the white cards played by players
  };
  
  return game;
}

function genCode() {
  return Math.random().toString(36).substring(2, 8);
}
function gerarNumeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getGame(id) {
  return games.find(g => g.id === id);
}

function nextTurn(game,votedPlayerId) {
  game.turn = (game.turn + 1) % game.players.length;
  const currentPlayer = game.players[game.turn];
  const votedPlayer = game.players.find(p => p.id === votedPlayerId);
  game.table.whiteCards = []; // Clear white cards for the new turn
  game.table.blackCard = game.blackDeck.pop(); // Draw a new black card for the new turn
  
  for(let player of game.players) {
    if(player.hand.length < 10) {
      player.hand.push(game.whiteDeck.pop());
    }
    player.isJudge = false;
  }
  currentPlayer.isJudge = true;
  votedPlayer.score = (votedPlayer.score || 0) + 1; // Increment score for the player who won the round
}
export {games,createGame,createPlayer,getGame,startGame,nextTurn}