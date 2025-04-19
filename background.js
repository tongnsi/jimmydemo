chrome.runtime.onInstalled.addListener(async () => {
    console.log("🟢 Extension installed and starting up...");
  
    try {
      const res = await fetch("http://127.0.0.1:3000/blacklist");
      const sites = await res.json();
  
      let rules = sites.map((site, index) => ({
        id: index + 1,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: site.url,
          resourceTypes: ["main_frame"]
        }
      }));
  
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map(r => r.id),
        addRules: rules
      });
  
      console.log("✅ Block rules applied for", sites.length, "sites.");
    } catch (error) {
      console.error("❌ Failed to fetch blacklist from backend:", error);
    }
  });
  