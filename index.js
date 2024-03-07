const express = require("express");
const https = require("https");

const app = express();
const PORT = 3000;

// Function to fetch HTML content from a URL
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        resolve(data);
      });
    }).on("error", (error) => {
      reject(error);
    });
  });
}

// Function to extract stories from HTML content
function extractStories(html) {
  const stories = [];
  const regex = /<a href="([^"]+)">\s*<h3 class="featured-voices__list-item-headline display-block">([^<]+)<\/h3>\s*<\/a>/g;
  let match;

  while ((match = regex.exec(html)) !== null && stories.length < 6) {
    const [, relativeUrl, title] = match;
    const link = "https://time.com" + relativeUrl;
    stories.push({ title, link });
  }

  return stories;
}

// Route to fetch and return the latest 6 stories from Time.com
app.get("/getTimeStories", async (req, res) => {
  const timeUrl = "https://time.com/";
  try {
    const htmlContent = await fetchHTML(timeUrl);
    const stories = extractStories(htmlContent);
    res.json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
