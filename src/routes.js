import { Router } from 'express';
import { createGame, createPlayer } from './game_manager.js';

export const router = Router();


router.get("/game/:id", (req, res) => {
  res.sendFile(path.join(public_dir, "lobby.html"));
});

router.post("/game/create", (req, res) => {
  const { nick } = req.body;

  if (!nick) {
    return res.status(400).json({ error: 'Nick is required' });
  }

  const player = createPlayer(nick);

  const gameCode = createGame(player);
  if (gameCode) {
    return res.status(201).json({ code: gameCode });
  } else {
    return res.status(500).json({ error: 'Failed to create game' });
  }
});
