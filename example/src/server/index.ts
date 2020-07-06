import path from 'path';
import express from 'express';

const PORT = 3000;

const app = express();

app.use(express.static(path.join(__dirname, '../assets')));

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../../views/index.html'));
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}.`);
});
