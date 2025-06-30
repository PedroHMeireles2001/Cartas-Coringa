import {io} from './server.js';
import fs from 'fs';

const games = [];

function createPlayer(nick) {
  return {
    id: gerarNumeroAleatorio(1000, 9999), // Random ID for the player
    nick: nick,
    hand: [],
  };
}

function createGame(player){

  const blackDeck = fs.readFileSync('./localdb/blackDeck.json', 'utf-8').split('\n').filter(line => line.trim() !== '').shuffle();
  const whiteDeck = fs.readFileSync('./localdb/whiteDeck.json', 'utf-8').split('\n').filter(line => line.trim() !== '').shuffle();

  const game = {
    id: genCode(),
    players: [{...player,isHost:true}],
    state: 'waiting',
    blackDeck: blackDeck,
    whiteDeck: whiteDeck,
  };
  
  games.push(game);
  return game.code;
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

function joinGame(player, code){
  const game = games.find(g => g.code === code);
  if (!game) {
    return null; // Game not found
  }
  game.players.push(player);
  return game.id;
}

function genCode() {
  return Math.random().toString(36).substring(2, 8);
}
function gerarNumeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export {games,createGame,createPlayer}