const cheerio = require("cheerio");

exports.getPlayerEarnings = async (req, res) => {
  try {
    const URL =
      "https://liquipedia.net/mobilelegends/api.php?action=parse&page=Portal:Statistics/Player_earnings&prop=text&format=json";

    const response = await fetch(URL);
    const data = await response.json();

    const html = data.parse.text["*"];
    const $ = cheerio.load(html);

    const players = [];

    $("table.wikitable tbody tr").each((_, el) => {
      const tds = $(el).find("td");
      if (tds.length < 6) return;

      const rank = parseInt($(tds[0]).text().trim()) || null;

      const playerCell = $(tds[1]);

      const name =
        playerCell.find(".name a").first().text().trim() ||
        playerCell.find("a").first().text().trim();

      if (!name) return;

      let flag =
        playerCell.find(".flag img").attr("src") ||
        playerCell.find(".flag img").attr("data-src") ||
        null;

      if (flag && !flag.startsWith("http")) {
        flag = `https://liquipedia.net${flag}`;
      }

      const tournaments = [];
      $(tds[2])
        .find("a")
        .each((_, a) => {
          const title = $(a).attr("title");
          if (title) tournaments.push(title.trim());
        });

      const gold = parseInt($(tds[3]).text().trim()) || 0;
      const silver = parseInt($(tds[4]).text().trim()) || 0;
      const bronze = parseInt($(tds[5]).text().trim()) || 0;

      const earningsText = $(tds[6]).text().trim();
      const earnings = parseInt(earningsText.replace(/[^0-9]/g, "")) || 0;

      players.push({
        rank,
        name,
        flag,
        tournaments,
        medals: { gold, silver, bronze },
        earnings,
      });
    });

    return res.json({
      total: players.length,
      players,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to scrape player earnings",
      error: err.message,
    });
  }
};