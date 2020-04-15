const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  const tour = tours.find((el) => el.id === Number(req.params.id));
  console.log('🚨🚨🚨🚨🚨 - invalid ID:', val);
  if (!tour) {
    return res.status(404).json({ status: 'Fail', message: 'invalid id' });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    console.log('🚨🚨🚨🚨🚨 - invalid body on req:', req.body);
    return res
      .status(404)
      .json({ status: 'Fail', message: 'missing name or price on body' });
  }

  next();
};

exports.getAllTours = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
};

exports.getTour = (req, res) => {
  console.log(req.requestTime);

  const tour = tours.find((el) => el.id === Number(req.params.id));

  if (!tour) {
    res.status(404).json({ status: 'Fail', message: 'invalid id' });
  }
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: 1,
    data: { tours: tour },
  });
};

exports.createTour = (req, res) => {
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
};
