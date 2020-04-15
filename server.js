const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
console.log(process.env);

const app = require('./app');

const port = process.env.port || 5050;
app.listen(port, () => {
  console.log(`App runs on ${port} port`);
});
