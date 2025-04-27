const express = require('express');
const cors = require('cors');
const path = require('node:path');

const app = express();
const port = 4000;

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.send('Servidor Express de imagens local está funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Imagens estão disponíveis a partir de http://localhost:${port}/images/`);
  console.log(`Exemplo: http://localhost:${port}/images/camisetas/nome_da_imagem.jpg`);
});