import express from 'express';
import url from 'url';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { router } from './routes.js';


const app = express();
const PORT = process.env.PORT || 3000;

const actual_path = url.fileURLToPath(import.meta.url);
const public_dir = path.join(actual_path,"../..","public");
app.use(express.static(public_dir));

const httpServer = http.createServer(app);

app.use(router);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(httpServer);
export { app, io };