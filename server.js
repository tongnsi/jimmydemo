const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

const uri = "mongodb+srv://jimmytest:jimmytest@cluster0.mp5sxzd.mongodb.net/"; // or Atlas URI if using MongoDB Atlas
const client = new MongoClient(uri);

app.use(cors());
app.use(bodyParser.json());

app.post("/check", async (req, res) => {
  const urlToCheck = req.body.url.toLowerCase();
  await client.connect();
  const db = client.db("safe_browsing_db");

  const cleanUrl = new URL(urlToCheck).hostname.replace(/^www\./, '');

  // 1. Check if already blacklisted
  const blacklisted = await db.collection("blacklist").findOne({ url: cleanUrl });
  if (blacklisted) {
    return res.json({ block: true, urlToBlock: cleanUrl });
  }

  // 2. Else check for flagged words
  const flaggedWords = await db.collection("flagged_words").find().toArray();
  const match = flaggedWords.find(w => urlToCheck.includes(w.word));

  if (match) {
    await db.collection("blacklist").updateOne(
      { url: cleanUrl },
      { $set: { reason: `URL contains flagged word: ${match.word}` } },
      { upsert: true }
    );
    return res.json({ block: true, urlToBlock: cleanUrl });
  }

  res.json({ block: false });
});

// Optional endpoint to load all blacklist entries
app.get("/blacklist", async (req, res) => {
  await client.connect();
  const db = client.db("safe_browsing_db");
  const list = await db.collection("blacklist").find().toArray();
  res.json(list);
});

app.listen(port, () => {
  console.log(`✅ Backend listening at http://127.0.0.1:${port}`);
});
