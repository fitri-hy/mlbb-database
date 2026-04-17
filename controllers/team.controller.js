const cheerio = require("cheerio");

exports.getTeamEarnings = async (req, res) => {
  try {
    const URL =
      "https://liquipedia.net/mobilelegends/api.php?action=parse&page=Portal:Statistics/Team_earnings&prop=text&format=json";

    const response = await fetch(URL);
    const data = await response.json();

    const html = data.parse.text["*"];
    const $ = cheerio.load(html);

    const teams = [];

    const rows = $("table.wikitable tbody tr");

    rows.each((i, el) => {
      const tds = $(el).find("td");

      if (tds.length < 7) return;

      const rank = parseInt($(tds[0]).text().trim()) || null;

      const teamCell = $(tds[1]);

      const name = teamCell.find("span.name a").first().text().trim()
        || teamCell.find("a").first().text().trim();

      if (!name) return;

      const href = teamCell.find("a").first().attr("href");

      let icon =
        teamCell.find("img").first().attr("src") ||
        teamCell.find("img").first().attr("data-src") ||
        null;

      if (icon && !icon.startsWith("http")) {
        icon = `https://liquipedia.net${icon}`;
      }

      const achievements = [];
      $(tds[2])
        .find("a")
        .each((_, a) => {
          const title = $(a).attr("title");
          if (title) achievements.push(title.trim());
        });

      const gold = parseInt($(tds[3]).text().trim()) || 0;
      const silver = parseInt($(tds[4]).text().trim()) || 0;
      const bronze = parseInt($(tds[5]).text().trim()) || 0;

      const earningsText = $(tds[6]).text().trim();
      const earnings = parseInt(earningsText.replace(/[^0-9]/g, "")) || 0;

      teams.push({
        rank,
        name,
        icon,
        achievements,
        medals: { gold, silver, bronze },
        earnings,
      });
    });

    return res.json({
      total: teams.length,
      teams,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to scrape",
      error: err.message,
    });
  }
};