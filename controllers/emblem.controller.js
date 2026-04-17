const cheerio = require("cheerio");

function cleanText(str) {
  return String(str || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function getImg(el) {
  return (
    el.attr("data-src") ||
    el.attr("src") ||
    el.find("img").attr("data-src") ||
    el.find("img").attr("src") ||
    null
  );
}

function parseAttributes(table, $) {
  const attributes = {};

  table.find("td").each((_, td) => {
    const text = cleanText($(td).text());

    const match = text.match(/(.+?):\s*\+?([\d%.]+)/);

    if (match) {
      const key = cleanText(match[1]).replace("●", "").trim();
      const value = match[2].trim();
      attributes[key] = value;
    }
  });

  return attributes;
}

function parseTalents(table, $) {
  const talents = [];

  table.find(".advanced-tooltip").each((_, el) => {
    const t = $(el);

    const name = cleanText(
      t.find("span").first().text() ||
      t.clone().children().remove().end().text()
    );

    const description = cleanText(t.find(".tooltip-contents").text());

    const image =
      t.find("img").attr("data-src") ||
      t.find("img").attr("src") ||
      null;

    if (name) {
      talents.push({ name, description, image });
    }
  });

  return talents;
}

exports.getEmblems = async (req, res) => {
  try {
    const url =
      "https://mobile-legends.fandom.com/api.php?action=parse&page=Emblems&prop=text&format=json";

    const response = await fetch(url);
    const data = await response.json();

    const html = data?.parse?.text?.["*"];
    if (!html) return res.status(404).json({ message: "Page not found" });

    const $ = cheerio.load(html);

    const emblems = [];

    $("h3").each((_, h3) => {
      const title = cleanText($(h3).text());

      const mlBlock = $(h3).nextAll(".ml").first();
      if (!mlBlock.length) return;

      const name = cleanText(mlBlock.find("h1").first().text());
      const image = getImg(mlBlock.find("img").first());

      if (!name) return;

      const tables = mlBlock.find("table");

      let attributes = {};
      let standard = [];
      let core = [];

      tables.each((_, table) => {
        const t = $(table);
        const header = cleanText(t.text());

        if (header.includes("Attributes")) {
          attributes = parseAttributes(t, $);
        }

        if (header.includes("Standard")) {
          standard = parseTalents(t, $);
        }

        if (header.includes("Core")) {
          core = parseTalents(t, $);
        }
      });

      emblems.push({
        name,
        image,
        attributes,
        talents: {
          standard,
          core,
        },
      });
    });

    return res.json({
      total: emblems.length,
      emblems,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch Emblems",
      error: err.message,
    });
  }
};