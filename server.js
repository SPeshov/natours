const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
console.log(process.env);

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
  .then((con) => {
    console.log(con.connection);
    console.log('DB connection is successful 🤘');
  });

const app = require('./app');

const port = process.env.port || 5050;
app.listen(port, () => {
  console.log(`App runs on ${port} port`);
});
