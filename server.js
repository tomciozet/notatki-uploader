const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { google } = require("googleapis");

const app = express();
const PORT = 3000;

// Folder tymczasowy
const upload = multer({ dest: "uploads/" });

const KEYFILEPATH = "Notatki-dla-g-JSON-Klucz.json";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const FOLDER_ID = "1neLFf2A53SmxSRbPn8tAP3lfxzeh3Nad";

app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const mimeType = mime.lookup(fileName) || "application/octet-stream"; 

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const drive = google.drive({ version: "v3", auth });

  try {
    const fileMeta = {
      name: fileName,
      parents: [FOLDER_ID],
    };
    const media = {
      mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMeta,
      media,
      fields: "id, webViewLink, webContentLink",
    });

    fs.unlinkSync(filePath); // usuń plik tymczasowy

    res.json({
      success: true,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send(`
    <h2>Uploader działa! ✅</h2>
    <p>Użyj aplikacji do wysyłania plików na Google Drive.</p>
    <p><b>Endpoint:</b> POST /upload</p>
  `);
});
