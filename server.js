const mongoose = require('mongoose');
const dotenv = require('dotenv');

const actions = require('mongoose-rest-actions');

mongoose.plugin(actions);

dotenv.config({ path: './config.env' });
const app = require('./app');

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
app.listen(port, () => {
  console.log(`App runs on ${port} port`);
});
