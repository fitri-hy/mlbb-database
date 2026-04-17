const cheerio = require("cheerio");

function cleanText(str) {
  return String(str || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

exports.getLandOfDawn = async (req, res) => {
  try {
    const url =
      "https://mobile-legends.fandom.com/api.php?action=parse&page=Land_of_Dawn&prop=text&format=json";

    const response = await fetch(url);
    const data = await response.json();

    if (!data?.parse?.text?.["*"]) {
      return res.status(404).json({ message: "Page not found" });
    }

    const $ = cheerio.load(data.parse.text["*"]);

    const regions = [];
    let inMajorRegions = false;

    $(".mw-parser-output")
      .children()
      .each((_, el) => {
        const node = $(el);

        // detect section
        if (node.is("h2")) {
          const title = cleanText(node.text()).toLowerCase();
          inMajorRegions = title.includes("major regions");
          return;
        }

        if (!inMajorRegions) return;

        // table utama
        if (!node.is("table.wikitable")) return;

        const rows = node.find("tr");

        rows.each((i, row) => {
          if (i === 0) return; // skip header

          const cols = $(row).find("td");
          if (cols.length < 5) return;

          // ======================
          // NAME
          // ======================
          const nameEl = $(cols[0]);

          const name =
            cleanText(nameEl.find("a").first().text()) ||
            cleanText(nameEl.text());

          const icon =
            nameEl.find("img").first().attr("data-src") ||
            nameEl.find("img").first().attr("src") ||
            null;

          // ======================
          // INFORMATION
          // ======================
          const information = cleanText($(cols[1]).text());

          // ======================
          // RULERS
          // ======================
          const rulers = [];

          $(cols[2])
            .find("a")
            .each((_, a) => {
              const t = cleanText($(a).text());
              if (t) rulers.push(t);
            });

          if (rulers.length === 0) {
            const raw = cleanText($(cols[2]).text());
            if (raw && raw !== "-") rulers.push(raw);
          }

          // ======================
          // GOVERNING BODIES
          // ======================
          const governingBodies = [];

          $(cols[3])
            .find("a")
            .each((_, a) => {
              const t = cleanText($(a).text());
              if (t) governingBodies.push(t);
            });

          if (governingBodies.length === 0) {
            const raw = cleanText($(cols[3]).text());
            if (raw && raw !== "-") governingBodies.push(raw);
          }

          // ======================
          // LOCATION (FIXED)
          // ======================
          const locationEl = $(cols[4]);
          let location = null;

          const img = locationEl.find("img").first();

          const imgUrl =
            img.attr("data-src") ||
            img.attr("src") ||
            null;

          if (imgUrl) {
            location = imgUrl;
          }

          if (!location) {
            const alt = img.attr("alt");
            if (alt) location = cleanText(alt);
          }

          if (!location) {
            const title = locationEl.find("a").first().attr("title");
            if (title) location = cleanText(title);
          }

          if (!location) {
            const text = cleanText(locationEl.text());
            if (text && text !== "-") location = text;
          }

          regions.push({
            icon,
            name: name || null,
            information: information || null,
            rulers,
            governingBodies,
            location,
          });
        });

        return res.json({
          total: regions.length,
          regions,
        });
      });

    return res.status(404).json({ message: "Major regions not found" });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch Land of Dawn",
      error: err.message,
    });
  }
};