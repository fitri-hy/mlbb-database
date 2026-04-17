const cheerio = require("cheerio");

function cleanText(str) {
  return String(str || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

exports.getGameModes = async (req, res) => {
  try {
    const url =
      "https://mobile-legends.fandom.com/api.php?action=parse&page=Game_Modes&prop=text&format=json";

    const response = await fetch(url);
    const data = await response.json();

    const html = data?.parse?.text?.["*"];
    if (!html) {
      return res.status(404).json({ message: "Page not found" });
    }

    const $ = cheerio.load(html);

    const root = $(".mw-parser-output");

    let combatModes = [];

    const targetNode = root
      .find("b")
      .filter((_, el) => cleanText($(el).text()) === "Combat Mode Choices")
      .first();

    if (!targetNode.length) {
      return res.status(404).json({
        message: "Combat Mode Choices not found",
      });
    }

    let gallery = targetNode
      .closest("p")
      .nextAll("#gallery-0")
      .first();

    if (!gallery.length) {
      gallery = root.find("#gallery-0").first();
    }

    if (!gallery.length) {
      return res.status(404).json({
        message: "Gallery not found",
      });
    }

    gallery.find(".wikia-gallery-item").each((_, item) => {
      const el = $(item);

      const title =
        cleanText(el.find(".lightbox-caption a").text()) ||
        cleanText(el.find("a.image").attr("title"));

      const image =
        el.find("img").attr("data-src") ||
        el.find("img").attr("src") ||
        null;

      if (title) {
        combatModes.push({
          title,
          image,
        });
      }
    });

    return res.json({
      total: combatModes.length,
      combatModes,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch Game Modes",
      error: err.message,
    });
  }
};