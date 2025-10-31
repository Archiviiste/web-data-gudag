// server.js
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// koneksi database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // sesuaikan
  database: "data_gudang"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL connected!");
});

// serve file index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ambil semua barang + hitung keuntungan
app.get("/api/barang", (req, res) => {
  const sql = `
    SELECT id, nama, stok, lokasi, barang_masuk, barang_keluar, harga_jual, harga_beli,
           (harga_jual*barang_keluar - harga_beli*barang_masuk) AS keuntungan
    FROM barang
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// tambah barang
app.post("/api/barang", (req, res) => {
  const d = req.body;
  const sql = `
    INSERT INTO barang 
      (nama, stok, lokasi, barang_masuk, barang_keluar, harga_jual, harga_beli)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    d.nama,
    Number(d.stok),
    d.lokasi,
    Number(d.barang_masuk),
    Number(d.barang_keluar),
    Number(d.harga_jual),
    Number(d.harga_beli)
  ], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Barang ditambahkan" });
  });
});

// update barang
app.put("/api/barang/:id", (req, res) => {
  const { id } = req.params;
  const d = req.body;
  const sql = `
    UPDATE barang SET 
      nama=?, stok=?, lokasi=?, barang_masuk=?, barang_keluar=?, harga_jual=?, harga_beli=?
    WHERE id=?
  `;
  db.query(sql, [
    d.nama,
    Number(d.stok),
    d.lokasi,
    Number(d.barang_masuk),
    Number(d.barang_keluar),
    Number(d.harga_jual),
    Number(d.harga_beli),
    id
  ], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Barang diupdate" });
  });
});

// hapus barang
app.delete("/api/barang/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM barang WHERE id=?", [id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Barang dihapus" });
  });
});

// jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});


