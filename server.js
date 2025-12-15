const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new sqlite3.Database("banco.db");

db.run(`
  CREATE TABLE IF NOT EXISTS contatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    mensagem TEXT,
    data TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS acessos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT NOT NULL,
    orgao TEXT NOT NULL,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    formato TEXT,
    finalidade TEXT,
    data TEXT
  )
`);

// FEEDBACK
db.run(`
  CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    tipo TEXT,
    mensagem TEXT,
    data TEXT
  )
`);

// SUGESTÕES
db.run(`
  CREATE TABLE IF NOT EXISTS sugestoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    categoria TEXT,
    mensagem TEXT,
    data TEXT
  )
`);

// NOVA TABELA: DENÚNCIAS
db.run(`
  CREATE TABLE IF NOT EXISTS denuncias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    tipo TEXT,
    descricao TEXT,
    endereco TEXT,
    data TEXT
  )
`);

app.post("/contato", (req, res) => {
  console.log("Contato recebido:", req.body);

  const { nome, email, telefone, mensagem } = req.body;

  if (!email || !mensagem) {
    return res.status(400).json({ error: "Campos obrigatórios." });
  }

  db.run(
    "INSERT INTO contatos (nome, email, telefone, mensagem, data) VALUES (?, ?, ?, ?, datetime('now'))",
    [nome, email, telefone, mensagem],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Contato enviado!" });
    }
  );
});

app.post("/acesso", (req, res) => {
  console.log("Pedido de acesso recebido:", req.body);

  const {
    nome,
    email,
    orgao,
    tipo,
    descricao,
    formato,
    finalidade
  } = req.body;

  if (!email || !orgao || !tipo || !descricao) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  db.run(
    `INSERT INTO acessos 
     (nome, email, orgao, tipo, descricao, formato, finalidade, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [nome, email, orgao, tipo, descricao, formato, finalidade],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Pedido registrado." });
    }
  );
});

app.post("/feedback", (req, res) => {
  console.log("Feedback recebido:", req.body);

  const { nome, tipo, mensagem } = req.body;

  if (!tipo || !mensagem) {
    return res.status(400).json({ error: "Campos obrigatórios." });
  }

  db.run(
    "INSERT INTO feedbacks (nome, tipo, mensagem, data) VALUES (?, ?, ?, datetime('now'))",
    [nome, tipo, mensagem],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Feedback salvo", id: this.lastID });
    }
  );
});

app.post("/sugestao", (req, res) => {
  console.log("Sugestão recebida:", req.body);

  const { nome, categoria, mensagem } = req.body;

  if (!categoria || !mensagem) {
    return res.status(400).json({ error: "Campos obrigatórios." });
  }

  db.run(
    "INSERT INTO sugestoes (nome, categoria, mensagem, data) VALUES (?, ?, ?, datetime('now'))",
    [nome, categoria, mensagem],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Sugestão salva", id: this.lastID });
    }
  );
});

app.post("/denuncias", (req, res) => {
  const body = req.body || {};

  const denuncia = {
    nome: body.nome || null,
    email: body.email || null,
    telefone: body.telefone || null,
    tipo: body.tipo,
    descricao: body.descricao,
    endereco: body.endereco || null
  };

  // 🔥 LOG PADRONIZADO
  console.log("Denúncia recebida:", denuncia);

  if (!denuncia.tipo || !denuncia.descricao) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios: tipo e descricao." });
  }

  db.run(
    `INSERT INTO denuncias 
     (nome, email, telefone, tipo, descricao, endereco, data)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      denuncia.nome,
      denuncia.email,
      denuncia.telefone,
      denuncia.tipo,
      denuncia.descricao,
      denuncia.endereco
    ],
    function (err) {
      if (err) {
        console.error("Erro ao inserir denúncia:", err);
        return res.status(500).json({ error: "Erro ao salvar denúncia." });
      }

      res.status(201).json({
        message: "Denúncia cadastrada com sucesso!",
        id: this.lastID
      });
    }
  );
});

// PAINEL DE VISUALIZAÇÃO
app.get("/feedbacks", (req, res) => {
  db.all("SELECT * FROM feedbacks", (err, feedbacks) => {
    res.json({ feedbacks });
  });
});

app.get("/sugestoes", (req, res) => {
  db.all("SELECT * FROM sugestoes", (err, sugestoes) => {
    res.json({ sugestoes });
  });
});

app.get("/denuncias", (req, res) => {
  db.all("SELECT * FROM denuncias", (err, denuncias) => {
    res.json({ denuncias });
  });
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});