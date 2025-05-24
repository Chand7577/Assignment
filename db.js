import mysql2 from "mysql2";
import dotenv from "dotenv";
dotenv.config();
// database setup

const database = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

database.connect((error) => {
  if (error) throw error;
  else console.log("Database has been connected!");
});

export { database };
