const cheerio = require("cheerio");

exports.getHeroes = async (req, res) => {
  try {
    const URL =
      "https://mobile-legends.fandom.com/api.php?action=parse&page=List_of_heroes&prop=text&format=json";

    const response = await fetch(URL);
    const data = await response.json();

    const html = data.parse.text["*"];
    const $ = cheerio.load(html);

    const heroes = [];

    $("table.wikitable tbody tr").each((i, el) => {
      const tds = $(el).find("td");

      if (tds.length < 8) return;

      const fullName = $(tds[2]).text().trim();
      const name = fullName.split(",")[0].trim();

      const icon =
        $(tds[1]).find("img").attr("data-src") ||
        $(tds[1]).find("img").attr("src");

      const raw = $(tds[8]).html() || "";

      const price = {
        battle_points: null,
        diamonds: null,
        tickets: null,
      };

      const bp = raw.match(/(\d+)\s*Battle\s*Points/i);
      const diamond = raw.match(/(\d+)\s*Diamond/i);
      const ticket = raw.match(/(\d+)\s*Ticket/i);

      if (bp) price.battle_points = parseInt(bp[1]);
      if (diamond) price.diamonds = parseInt(diamond[1]);
      if (ticket) price.tickets = parseInt(ticket[1]);

      heroes.push({
        name,
        fullName,
        icon,
        role: $(tds[4]).text().trim(),
        specialty: $(tds[5]).text().trim(),
        lane: $(tds[6]).text().trim(),
        region: $(tds[7]).text().trim(),
        releaseYear: $(tds[9]).text().trim(),
        price,
      });
    });

    res.json({
      total: heroes.length,
      heroes,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch heroes",
      error: err.message,
    });
  }
};