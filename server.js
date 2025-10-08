// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import bcrypt from "bcryptjs";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let users = []; // Aqui você pode substituir por DB real

io.on("connection", (socket) => {
  console.log("Novo cliente conectado:", socket.id);

  // Registrar usuário
  socket.on("register", async ({ username, password }) => {
    if (users.some(u => u.username === username)) {
      socket.emit("registerResponse", { success: false, msg: "Usuário já existe!" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    socket.emit("registerResponse", { success: true, msg: "Conta criada!" });
  });

  // Login
  socket.on("login", async ({ username, password }) => {
    const user = users.find(u => u.username === username);
    if (!user) {
      socket.emit("loginResponse", { success: false, msg: "Usuário não encontrado!" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      socket.emit("loginResponse", { success: false, msg: "Senha incorreta!" });
      return;
    }

    socket.emit("loginResponse", { success: true, msg: "Login realizado!", user: { username } });
  });
});

server.listen(3000, () => console.log("Servidor rodando na porta 3000"));
    