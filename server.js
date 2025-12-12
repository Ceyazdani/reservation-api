import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ ساخت جدول داخل یک تابع که قبل از شروع سرور اجرا می‌شود
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        service TEXT NOT NULL,
        date_key TEXT NOT NULL,
        date_label TEXT NOT NULL,
        time TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL
      );
    `);

    console.log("✅ Table 'reservations' is ready");
  } catch (err) {
    console.error("❌ Error creating table:", err);
  }
}

app.get("/Reservations", async (req, res) => {
  const { dateKey } = req.query;
  try {
    let result;
    if (dateKey) {
      result = await pool.query(
        "SELECT * FROM reservations WHERE date_key = $1 ORDER BY time ASC",
        [dateKey]
      );
    } else {
      result = await pool.query(
        "SELECT * FROM reservations ORDER BY id DESC"
      );
    }
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

app.post("/Reservations", async (req, res) => {
  const { service, dateKey, dateLabel, time, name, phone } = req.body;

  if (!service || !dateKey || !dateLabel || !time || !name || !phone) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservations (service, date_key, date_label, time, name, phone)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [service, dateKey, dateLabel, time, name, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// ✅ اول دیتابیس را آماده کن، بعد سرور را بالا بیاور
initDB().then(() => {
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => {
    console.log("✅ Server running on port", PORT);
  });
});
