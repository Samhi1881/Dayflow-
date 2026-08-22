require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const profileRoutes = require('./routes/profileRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || false, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/v1', authRoutes);
app.use('/api/v1', profileRoutes);
app.use('/api/v1', payrollRoutes);
app.use('/api/v1', attendanceRoutes);
app.use('/api/v1', leaveRoutes);

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use((_request, response) => {
  response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', fields: {} } });
});
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Dayflow backend listening on port ${port}`);
  });
}

module.exports = app;
