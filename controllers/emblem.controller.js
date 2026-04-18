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
    if (!html) {
      return res.status(404).json({ message: "Page not found" });
    }

    const $ = cheerio.load(html);
    const emblems = [];

    $(".ml").each((_, el) => {
      const block = $(el);

      const name = cleanText(
        block.find("div[style*='font-size']").first().text()
      );

      if (!name) return;

      const image = getImg(block.find("img").first());

      const attributes = {};

      block.find("div").each((_, d) => {
        const el = $(d);

        const span = el.children("span");
        const bold = el.children("b");

        if (span.length && bold.length) {
          const key = cleanText(span.text());
          const value = cleanText(bold.text());

          if (key && value) {
            attributes[key] = value;
          }
        }
      });

      const standard = [];
      const core = [];

      block.find("pre").each((_, pre) => {
        const p = $(pre);

        const name = cleanText(p.find("b").text());
        const image = getImg(p.find("img"));

        const description = cleanText(
          p.parent().find("div").last().text()
        );

        const talent = { name, description, image };

        if (p.parent().text().toLowerCase().includes("cooldown")) {
          core.push(talent);
        } else {
          standard.push(talent);
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
    if (res.headersSent) return;

    return res.status(500).json({
      message: "Failed to fetch Emblems",
      error: err.message,
    });
  }
};