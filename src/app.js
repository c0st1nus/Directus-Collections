import express from 'express';
import indexRouter from './routes/index.js';
const app = express();
const port = 3000;

app.use(express.static('public'));

// Routes
app.use('/', indexRouter);

app.use('/test', indexRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});