// index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, 'lluvia.json');

app.use(cors());
app.use(express.json());

app.post('/guardar-lluvia', (req, res) => {
  const { year, month, total } = req.body;
  if (!year || !month || typeof total !== 'number') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  let data = {};
  if (fs.existsSync(FILE_PATH)) {
    data = JSON.parse(fs.readFileSync(FILE_PATH));
  }

  data[`${year}-${month}`] = total;
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
  res.json({ message: 'Lluvia guardada correctamente' });
});

app.get('/lluvia', (req, res) => {
  if (!fs.existsSync(FILE_PATH)) return res.json({});
  const data = JSON.parse(fs.readFileSync(FILE_PATH));
  res.json(data);
});

app.get('/', (req, res) => {
  res.send('Servidor de lluvia activo.');
});

app.listen(PORT, () => {
  console.log(`✅ Backend activo en http://localhost:${PORT}`);
});
