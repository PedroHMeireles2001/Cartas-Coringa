import express from 'express';
import url from 'url';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { createGame, createPlayer, getGame } from './game_manager.js';


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
    const game = createGame(data.nick);
    socket.emit('gameCreated', { game });
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
      io.to(game.id).emit('playerJoined', { player });
      console.log(`Player ${data.nick} joined game ${game.id}`);
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('gameStart', (gameId) => {
    const game = getGame(gameId);
    if (game) {
      startGame(game);
      io.to(gameId).emit('gameStarted', { game });
    }
  });
});

export { app, io };