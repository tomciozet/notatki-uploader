const express = require("express");
const multer = require("multer");
const fs = require("fs");
const mime = require("mime-types");
const path = require("path");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: "uploads/" });

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const FOLDER_ID = "TWÓJ_FOLDER_ID";

app.use(express.static(__dirname));

app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const mimeType = mime.lookup(fileName) || "application/octet-stream";

  const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_KEY_JSON),
  scopes: SCOPES,
  });

  const drive = google.drive({ version: "v3", auth });

  try {
    const response = await drive.files.create({
      resource: { name: fileName, parents: [FOLDER_ID] },
      media: { mimeType, body: fs.createReadStream(filePath) },
      fields: "id, webViewLink, webContentLink",
    });

    fs.unlinkSync(filePath);
    res.send(`<p>Plik wysłany! <a href="${response.data.webViewLink}" target="_blank">Otwórz w Google Drive</a></p>`);
  } catch (error) {
    res.status(500).send(`Błąd: ${error.message}`);
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na http://localhost:${PORT}`);
});
