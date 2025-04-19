const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://jimmytest:jimmytest@cluster0.mp5sxzd.mongodb.net/"; // use the correct one
const client = new MongoClient(uri);

async function showBlacklist() {
  try {
    await client.connect();
    const db = client.db("safe_browsing_db");
    const blacklist = await db.collection("blacklist").find().toArray();

    console.log("\n📋 Blocked URLs:");
    blacklist.forEach(site => {
      console.log(`- ${site.url} (${site.reason})`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

showBlacklist();
