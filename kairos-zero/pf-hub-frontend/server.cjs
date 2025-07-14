const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques du dossier dist
app.use(express.static(path.join(__dirname, "dist")));

// Route pour toutes les autres requêtes - sert index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 