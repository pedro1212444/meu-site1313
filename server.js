const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// arquivo JSON
const FILE = "usuarios.json";

// ler usuários
function lerUsuarios() {
  return JSON.parse(fs.readFileSync(FILE));
}

// salvar usuários
function salvarUsuarios(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// logados (memória)
let logados = [];

// upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// CADASTRO
app.post("/cadastrar", upload.single("foto"), (req, res) => {
  const { user, pass } = req.body;

  let usuarios = lerUsuarios();

  const existe = usuarios.find(u => u.user === user);
  if (existe) return res.json({ erro: "Usuário já existe" });

  usuarios.push({
    user,
    pass,
    foto: req.file ? "/uploads/" + req.file.filename : null
  });

  salvarUsuarios(usuarios);

  res.json({ sucesso: true });
});

// LOGIN
app.post("/login", (req, res) => {
  const { user, pass } = req.body;

  let usuarios = lerUsuarios();

  const encontrado = usuarios.find(
    u => u.user === user && u.pass === pass
  );

  if (encontrado) {
    logados.push(user);
    res.json({ sucesso: true });
  } else {
    res.json({ sucesso: false });
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  const { user } = req.body;
  logados = logados.filter(u => u !== user);
  res.send("OK");
});

// LOGADOS
app.get("/logados", (req, res) => {
  let usuarios = lerUsuarios();

  let lista = logados.map(nome => {
    let u = usuarios.find(x => x.user === nome);
    return {
      user: nome,
      foto: u?.foto
    };
  });

  res.json(lista);
});

// TODOS USUÁRIOS
app.get("/usuarios", (req, res) => {
  let usuarios = lerUsuarios();

  res.json(usuarios.map(u => ({
    user: u.user,
    foto: u.foto
  })));
});

// PORTA
app.listen(3000, () => console.log("Rodando em http://localhost:3000")); app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});