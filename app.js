const fs = require('fs');
const express = require('express');

const app = express();

const port = 5050;

//simple middleware
app.use(express.json()); // data from the body will be added req object

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'hohoho', app: 'notorus' });
// });

// app.post('/', (req, res) => {
//   res.send('you can post');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

app.post('/api/v1/tours', (req, res) => {
  const tourId = Number(tours[tours.length - 1].id) + 1;
  const newTour = Object.assign({ id: tourId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
});

app.listen(port, () => {
  console.log(`App runs on ${port} port`);
});
