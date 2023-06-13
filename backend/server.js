import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'welcome to the backend' });
});

const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log(`server running at ${PORT}`);
});
