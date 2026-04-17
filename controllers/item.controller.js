const cheerio = require("cheerio");

function cleanText(str) {
  return String(str || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function getImg(el) {
  const img = el.find("img").first();

  return (
    img.attr("data-src") ||
    img.attr("data-original") ||
    img.attr("data-url") ||
    img.attr("src") ||
    null
  );
}

function getCategory($, index) {
  return cleanText(
    $(".wds-tabs__tab").eq(index).find("a").text()
  ) || "Unknown";
}

exports.getItems = async (req, res) => {
  try {
    const url =
      "https://mobile-legends.fandom.com/api.php?action=parse&page=Equipment&prop=text&format=json";

    const response = await fetch(url);
    const data = await response.json();

    const html = data?.parse?.text?.["*"];
    if (!html) {
      return res.status(404).json({ message: "Page not found" });
    }

    const $ = cheerio.load(html);

    const map = new Map();

    $(".wds-tab__content").each((i, tab) => {
      const tabEl = $(tab);
      const category = getCategory($, i);

      tabEl.find("div").each((_, el) => {
        const itemEl = $(el);

        const name =
          cleanText(itemEl.find("a").last().text()) ||
          cleanText(itemEl.text());

        const image = getImg(itemEl);

        if (!name || name.length < 2) return;
        if (!image) return;

        const key = `${name}`;

        if (!map.has(key)) {
          map.set(key, {
            category,
            name,
            image,
          });
        }
      });
    });

    return res.json({
      total: map.size,
      items: [...map.values()],
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch Items",
      error: err.message,
    });
  }
};