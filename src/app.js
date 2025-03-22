import express from 'express';
import indexRouter from './routes/index.js';
import winston from 'winston';
// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Routes
app.use('/', indexRouter);

app.use('/test', indexRouter);

app.listen(port, () => {
  logger.info(`Server running at http://crm:3000/`);
});