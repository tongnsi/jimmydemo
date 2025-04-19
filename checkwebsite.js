const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://jimmytest:jimmytest@cluster0.mp5sxzd.mongodb.net/"; // Change if you're using Atlas
const client = new MongoClient(uri);

async function checkUrl(urlToCheck) {
  try {
    await client.connect();
    const db = client.db("safe_browsing_db");

    const normalizedUrl = urlToCheck.toLowerCase();
    const flaggedWords = await db.collection("flagged_words").find().toArray();

    const match = flaggedWords.find(w => normalizedUrl.includes(w.word));

    if (match) {
      const cleanUrl = new URL(urlToCheck).hostname.replace(/^www\./, '');
      await db.collection("blacklist").insertOne({
        url: cleanUrl,
        reason: `URL contains flagged word: ${match.word}`
      });
      console.log("🚫 Blocked:", urlToCheck);
    } else {
      console.log("✅ Safe:", urlToCheck);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

// 🔍 Test it:
checkUrl("https://www.google.com");
