require('dotenv').config();

const express = require('express');
const cors = require('cors');
const profileRoutes = require('./routes/profileRoutes');
const leaveRoutes = require('./routes/leaveRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/v1', profileRoutes);
app.use('/api/v1', leaveRoutes);

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Dayflow backend listening on port ${port}`);
  });
}

module.exports = app;
