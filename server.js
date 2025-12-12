import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();

// فعال‌سازی CORS برای همهٔ دامنه‌ها
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// اتصال امن به دیتابیس PostgreSQL در Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// تست سلامت API
app.get("/", (req, res) => {
  res.send("Reservation API is running");
});

// گرفتن رزروها با فیلتر اختیاری بر اساس dateKey
app.get("/reservations", async (req, res) => {
  try {
    const { dateKey } = req.query;

    let query = "SELECT * FROM reservations";
    let params = [];

    if (dateKey) {
      query += " WHERE date_key = $1";
      params.push(dateKey);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ثبت رزرو جدید
app.post("/reservations", async (req, res) => {
  try {
    const { service, dateKey, dateLabel, time, name, phone } = req.body;

    const result = await pool.query(
      `INSERT INTO reservations (service, date_key, date_label, time, name, phone)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [service, dateKey, dateLabel, time, name, phone]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// اجرای سرور
app.listen(3000, () => console.log("Server running on port 3000"));
