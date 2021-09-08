// const { MongoClient } = require('mongodb');

// const OPTIONS = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };

// const MONGO_DB_URL = 'mongodb://localhost:27017/StoreManager';
// // const MONGO_DB_URL = 'mongodb://mongodb:27017/StoreManager';
// const DB_NAME = 'StoreManager';

// let db = null;

// const connection = () => {
//   return db
//     ? Promise.resolve(db)
//     : MongoClient.connect(MONGO_DB_URL, OPTIONS)
//       .then((conn) => {
//         db = conn.db(DB_NAME);
//         return db;
//       });
// };

// module.exports = connection;


const mysql = require('mysql2/promise');

require('dotenv').config();

const connection = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
});

module.exports = connection;
