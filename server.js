import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/", (req, res) => {
  res.send("Reservation API is running");
});

app.get("/reservations", async (req, res) => {
  const { dateKey } = req.query;

  let query = "SELECT * FROM reservations";
  let params = [];

  if (dateKey) {
    query += " WHERE date_key = $1";
    params.push(dateKey);
  }

  const result = await pool.query(query, params);
  res.json(result.rows);
});

app.post("/reservations", async (req, res) => {
  const { service, dateKey, dateLabel, time, name, phone } = req.body;

  const result = await pool.query(
    `INSERT INTO reservations (service, date_key, date_label, time, name, phone)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [service, dateKey, dateLabel, time, name, phone]
  );
  res.json(result.rows[0]);
});

app.listen(3000, () => console.log("Server running on 3000"));
         
