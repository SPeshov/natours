const mongoose = require('mongoose');
const dotenv = require('dotenv');

const actions = require('mongoose-rest-actions');

mongoose.plugin(actions);

dotenv.config({ path: './config.env' });
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED Exception 💥 ! shutting down...');

  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection is successful 🤘');
  });

const port = process.env.port || 5050;
const server = app.listen(port, () => {
  console.log(`App runs on ${port} port`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION 💥 ! shutting down...');

  server.close(() => {
    process.exit(1);
  });
});
