const cheerio = require("cheerio");

exports.getPatches = async (req, res) => {
  try {
    const URL =
      "https://liquipedia.net/mobilelegends/api.php?action=parse&page=Portal:Patches&prop=text&format=json";

    const response = await fetch(URL);
    const data = await response.json();

    const html = data.parse.text["*"];
    const $ = cheerio.load(html);

    const patches = [];

    $("div.mw-heading.mw-heading3 h3").each((_, yearEl) => {
      const year = $(yearEl).attr("id") || $(yearEl).text().trim();

      const table = $(yearEl)
        .parent()
        .nextAll("div")
        .first()
        .find("table.wikitable");

      if (!table.length) return;

      const items = [];

      table.find("tbody tr").each((_, tr) => {
        const tds = $(tr).find("td");

        if (tds.length < 3) return;

        const patchLink = $(tds[0]).find("a").first();
        const name = patchLink.text().trim();

        const releaseDate = $(tds[1]).text().trim();

        const highlights = [];

        $(tds[2])
          .find("li")
          .each((_, li) => {
            const text = $(li)
              .text()
              .replace(/\s+/g, " ")
              .trim();

            if (text) highlights.push(text);
          });

        if (!name) return;

        items.push({
          name,
          releaseDate,
          highlights,
        });
      });

      if (items.length) {
        patches.push({
          year,
          patches: items,
        });
      }
    });

    return res.json({
      totalYears: patches.length,
      patches,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch patches",
      error: err.message,
    });
  }
};