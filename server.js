const express = require('express');
const path = require('node:path');

const app = express();
const port = 4000;

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.send('Servidor Express de imagens local está funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Imagens estão disponíveis a partir de http://localhost:${port}/images/`);
  console.log(`Exemplo: http://localhost:${port}/images/camisetas/nome_da_imagem.jpg`);
});