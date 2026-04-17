const cheerio = require("cheerio");

function cleanText(str) {
  return String(str || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function slugToTitle(slug) {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getImage(el) {
  if (!el || !el.length) return null;

  const img = el.is("img") ? el : el.find("img").first();

  return (
    img.attr("data-src") ||
    img.attr("src") ||
    img.attr("srcset")?.split(" ")[0] ||
    null
  );
}

function getDescription($) {
  const content = $(".mw-parser-output");

  let desc = null;

  content.find("p").each((_, el) => {
    const text = cleanText($(el).text());

    if (!text) return;
    if (text.length < 60) return;

    const lower = text.toLowerCase();
    if (
      lower.includes("citation") ||
      lower.includes("wiki") ||
      lower.includes("file") ||
      lower.includes("contents")
    ) return;

    if (!desc) desc = text;
  });

  return desc;
}

function getRecipe($, infobox) {
  const recipe = [];

  const container = infobox.find("[data-source='recipe']");

  container.find("img").each((_, el) => {
    const img = $(el);

    const src =
      img.attr("data-src") ||
      img.attr("src");

    if (!src || src.startsWith("data:")) return;

    const name = cleanText(img.attr("alt"));

    if (recipe.some(r => r.image === src)) return;

    recipe.push({
      name: name || null,
      image: src,
    });
  });

  return recipe;
}

function getAttributes($, infobox) {
  const attributes = {};

  infobox.find("[data-source='bonus'], [data-source='unique']").each((_, el) => {
    const key = cleanText($(el).find("h3").text() || $(el).attr("data-source"));
    const value = cleanText($(el).find(".pi-data-value").text());

    if (key && value) {
      attributes[key] = value;
    }
  });

  return attributes;
}

function getSections($) {
  const sections = {
    tips: [],
    notes: [],
    trivia: [],
    counteredBy: []
  };

  const normalizeList = (el) => {
    const items = [];

    el.find("li").each((_, li) => {
      const text = cleanText($(li).text());

      if (!text) return;

      if (text.length < 3) return;

      items.push(text);
    });

    return items;
  };

  $("h2, h3").each((_, el) => {
    const title = cleanText($(el).text()).toLowerCase();

    const content = $(el).nextUntil("h2, h3");

    if (title.includes("tip")) {
      sections.tips.push(...normalizeList(content));
    }

    if (title.includes("note")) {
      sections.notes.push(...normalizeList(content));
    }

    if (title.includes("trivia")) {
      sections.trivia.push(...normalizeList(content));
    }

    if (title.includes("counter")) {
      sections.counteredBy.push(...normalizeList(content));
    }
  });

  for (const key in sections) {
    sections[key] = [...new Set(sections[key])];
  }

  return sections;
}

exports.getItemDetail = async (req, res) => {
  try {
    const slug = req.params.name;
    const name = slugToTitle(slug);

    const url = `https://mobile-legends.fandom.com/api.php?action=parse&page=${encodeURIComponent(
      name
    )}&prop=text&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    const html = data?.parse?.text?.["*"];
    if (!html) {
      return res.status(404).json({ message: "Item not found" });
    }

    const $ = cheerio.load(html);
    const infobox = $(".portable-infobox").first();

    if (!infobox.length) {
      return res.status(404).json({ message: "Infobox not found" });
    }

    const nameItem = cleanText(infobox.find(".pi-title").text()) || name;

    const image =
      getImage(infobox.find(".pi-image")) ||
      getImage(infobox.find("img").first());

    const type = cleanText(
      infobox.find("[data-source='type'] .pi-data-value").text()
    );

    const price = {
      total: cleanText(infobox.find("[data-source='total_price']").text()).replace(/[^\d]/g, "") || null,
      upgrade: cleanText(infobox.find("[data-source='upgrade_price']").text()).replace(/[^\d]/g, "") || null,
      sell: cleanText(infobox.find("[data-source='sell']").text()).replace(/[^\d]/g, "") || null,
    };

    const info = {};
    infobox.find(".pi-data").each((_, el) => {
      const key = cleanText($(el).find("h3").text());
      const value = cleanText($(el).find(".pi-data-value").text());

      if (key && value) info[key] = value;
    });

    const attributes = getAttributes($, infobox);

    const recipe = getRecipe($, infobox);

    const visualEffect =
      getImage(infobox.find("[data-source='visual effect'] img")) || null;

    const description =
      cleanText(infobox.find(".pi-caption").first().text()) ||
      getDescription($);

    const sections = getSections($);

    return res.json({
      name: nameItem,
      image,
      type,
      price,
      description,

      attributes,
      recipe,
      visualEffect,

      info,
      sections,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch item detail",
      error: err.message,
    });
  }
};