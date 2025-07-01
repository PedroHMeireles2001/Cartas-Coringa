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
    hand: [],
  };
}

function createGame(player){

  const shuffledBlackDeck = shuffle(blackDeck);
  const shuffledWhiteDeck = shuffle(whiteDeck);
  const host = createPlayer(player);
  const game = {
    id: genCode(),
    players: [{...host,isHost:true}],
    state: 'waiting',
    blackDeck: shuffledBlackDeck,
    whiteDeck: shuffledWhiteDeck,
  };
  
  games.push(game);
  return game;
}

function startGame(code){
  const game = games.find(g => g.code === code);
  if (!game) {
    return null; // Game not found
  }
  if (game.state !== 'waiting') {
    return null; // Game already started
  }
  if(game.players.length < 3) {
    return null; // Not enough players to start the game
  }
  for(player of game.players) {
    // Initialize player hand with 10 white cards
    player.hand = [];
    for (let i = 0; i < 10; i++) {
      player.hand.push(game.whiteDeck.pop());
    }
  }
  game.state = 'started';

  
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
export {games,createGame,createPlayer,getGame}