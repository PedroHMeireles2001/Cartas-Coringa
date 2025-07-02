import express from 'express';
import url from 'url';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { createGame, createPlayer, getGame, nextTurn, startGame } from './game_manager.js';


const app = express();
const PORT = process.env.PORT || 3000;

const actual_path = url.fileURLToPath(import.meta.url);
const public_dir = path.join(actual_path,"../..","public");
app.use(express.static(public_dir));
app.use(express.json());
const httpServer = http.createServer(app);



httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('createGame', (data) => {
    const {game, host} = createGame(data.nick);
    socket.emit('gameCreated', { game, host });
    socket.join(game.id);
    console.log(`Game created: ${game.id} by ${data.nick}`);
  });

  socket.on('joinGame', (data) => {
    const game = getGame(data.gameId);
    if (game) {
      const player = createPlayer(data.nick);
      game.players.push(player);
      
      socket.join(game.id);
      socket.emit('gameJoined', { game, player });
      io.to(game.id).emit('playerJoined', { players: game.players });
      console.log(`Player ${data.nick} joined game ${game.id}`);
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('gameStart', (gameId) => {
    const game = getGame(gameId);
    if (game) {
      if(game.state === 'waiting' && game.players.length >= 3) {
        const startedGame = startGame(gameId);
        io.to(game.id).emit('gameStarted', { game: startedGame });
        console.log(`Game ${game.id} started`);
      }else{
        socket.emit('error', { message: 'Not enough players to start the game' });
      }
    }
  });

  socket.on('playCard', (data) => {
    const game = getGame(data.gameId);
    if (game) {
      const player = game.players.find(p => p.id === data.playerId);
      if (player && player.hand.includes(data.card)) {
        player.hand = player.hand.filter(card => card !== data.card);
        game.table.whiteCards.push({ player: player, card: data.card, revealed: false });
        io.to(game.id).emit('gameUpdate', { game });
        console.log(`Player ${player.nick} played card: ${data.card}`);
      } else {
        socket.emit('error', { message: 'Invalid card play' });
      }
    }
  });
  
  socket.on('voteCard', (data) => {
    const game = getGame(data.gameId);
    if (game) {
      const judge = game.players.find(p => p.id === data.judgeId);
      const votedPlayer = game.players.find(p => p.id === data.votedPlayerId);
      if (judge && votedPlayer && judge.isJudge && !votedPlayer.isJudge && game.table.whiteCards.length === game.players.length - 1) {
        console.log(`Judge ${judge.nick} voted for player ${votedPlayer.nick}`);
        nextTurn(game,data.votedPlayerId);
        io.to(game.id).emit('voteUpdate', { judge: judge, votedPlayer: votedPlayer,nextJudge: game.players.find(p => p.isJudge) });
        io.to(game.id).emit('gameUpdate', { game });
        for(let player of game.players) {
          console.log(`Player ${player.nick} score: ${player.score}`);
        }
      } else {
        socket.emit('error', { message: 'Invalid vote' });
      }
    }
  });
});

export { app, io };