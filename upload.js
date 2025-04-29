const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const mime = require("mime-types");
const readline = require("readline");

// 🔐 Ścieżka do klucza
const KEYFILEPATH = "Notatki-dla-g-JSON-Klucz.json";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const FOLDER_ID = "1neLFf2A53SmxSRbPn8tAP3lfxzeh3Nad";

// 🔁 Pytanie o nazwę pliku
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Podaj nazwę pliku do wysłania: ", async function (userInput) {
  const FILE_TO_UPLOAD = userInput.trim();

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const drive = google.drive({ version: "v3", auth });

  const filePath = path.join(__dirname, FILE_TO_UPLOAD);
  const fileName = path.basename(filePath);
  const mimeType = mime.lookup(filePath) || "application/octet-stream";

  const fileMetadata = {
    name: fileName,
    parents: [FOLDER_ID],
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink, webContentLink",
    });

    console.log("✅ Plik przesłany!");
    console.log("🔗 Link do podglądu:", file.data.webViewLink);
    console.log("⬇️ Link do pobrania:", file.data.webContentLink);
  } catch (error) {
    console.error("❌ Błąd przy wysyłaniu:", error.message);
  } finally {
    rl.close();
  }
});
