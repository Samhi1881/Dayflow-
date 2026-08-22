require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Dayflow backend listening on port ${port}`);
  });
}

module.exports = app;
