const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');

const app = express();
const port = 4000;

const imagesBaseDir = path.join(__dirname, 'images');
fs.mkdirSync(imagesBaseDir, { recursive: true });

const homeImagesDir = path.join(imagesBaseDir, 'home');
fs.mkdirSync(homeImagesDir, { recursive: true });

const sectionsImageDir = path.join(imagesBaseDir, 'sections');
fs.mkdirSync(sectionsImageDir, { recursive: true });

app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesBaseDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas JPEG, PNG e WEBP são permitidos.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

var corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use('/images', express.static(imagesBaseDir));

app.post('/upload', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Erro do Multer:', err.message);
      return res.status(400).json({ message: `Erro no upload: ${err.message}` });
    } else if (err) {
      console.error('Erro no filtro de arquivo:', err.message);
      return res.status(400).json({ message: err.message });
    }

    console.log('Recebida requisição POST /upload');
    if (!req.file) {
      console.error('Nenhum arquivo recebido no campo "image"');
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado no campo "image".' });
    }

    console.log('Arquivo recebido:', req.file.filename);

    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    console.log('URL da imagem gerada:', imageUrl);

    res.status(201).json({ imageUrl: imageUrl });
  });
});

app.post('/delete-image', async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ message: 'URL da imagem não fornecida.' });
  }

  try {
    const urlParts = new URL(imageUrl);
    const filename = path.basename(urlParts.pathname);

    if (filename.includes('..')) {
      console.error('Tentativa de acesso inválida detectada:', filename);
      return res.status(400).json({ message: 'Nome de arquivo inválido.' });
    }

    const filePath = path.join(imagesBaseDir, filename);

    await fs.promises.unlink(filePath);

    console.log('Imagem deletada com sucesso:', filePath);
    res.status(200).json({ message: 'Imagem deletada com sucesso.' });

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Erro ao deletar: Arquivo não encontrado -', error.path);
      return res.status(404).json({ message: 'Imagem não encontrada no servidor.' });
    } else if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      console.error('Erro ao deletar: URL inválida -', imageUrl);
      return res.status(400).json({ message: 'URL da imagem inválida.' });
    } else {
      console.error('Erro ao deletar imagem:', error);
      return res.status(500).json({ message: 'Erro interno ao tentar deletar a imagem.' });
    }
  }
});

app.get('/images/home', (req, res) => {
  fs.readdir(homeImagesDir, (err, files) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error("Diretório não encontrado:", homeImagesDir);
        return res.status(404).json({ message: "Diretório de imagens da home não encontrado." });
      }
      console.error("Erro ao ler o diretório de imagens da home:", err);
      return res.status(500).json({ message: "Erro ao buscar imagens da home." });
    }

    const imageUrls = files
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
      .map(file => ({
        src: `${req.protocol}://${req.get('host')}/images/home/${file}`,
        alt: `Imagem ${file}`
      }));
    res.json(imageUrls);
  });
});

app.get('/images/sections', (req, res) => {
  fs.readdir(sectionsImageDir, (err, files) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error("Diretório não encontrado:", sectionsImageDir);
        return res.status(404).json({ message: "Diretório de imagens da home não encontrado." });
      }
      console.error("Erro ao ler o diretório de imagens da home:", err);
      return res.status(500).json({ message: "Erro ao buscar imagens da home." });
    }

    const imageUrls = files
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
      .map(file => ({
        src: `${req.protocol}://${req.get('host')}/images/sections/${file}`,
        alt: `Imagem ${file}`
      }));
    res.json(imageUrls);
  });
});

app.get('/', (req, res) => {
  res.send('Servidor Express de imagens local está funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor de imagens rodando em http://localhost:${port}`);
  console.log(`Imagens servidas de: ${imagesBaseDir}`);
  console.log(`Acessíveis via: http://localhost:${port}/images/`);
});