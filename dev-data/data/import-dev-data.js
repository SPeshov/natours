const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('../../models/tourModel');

dotenv.config({ path: '../../config.env' });

const DB = 'mongodb+srv://speshov:<PASSWORD>@cluster0-etig5.mongodb.net/natours?retryWrites=true&w=majority'.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connection);
    console.log('DB connection is successful 🤘');
  });

const tours = JSON.parse(fs.readFileSync('tours.json', 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data loaded to DB ');
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('all deleted in collections  ');
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  //   console.log('process.argv 🎖🎖🎖🎖🎖', tours);

  importData();
  //   process.exit();
}
if (process.argv[2] === '--delete') {
  deleteData();
  //   process.exit();
}

console.log('process.argv 🎖🎖🎖🎖🎖', process.argv);
