const cheerio = require("cheerio");

exports.getPlayerDetail = async (req, res) => {
  try {
    const player = req.params.player;

    const URL = `https://liquipedia.net/mobilelegends/api.php?action=parse&page=${player}&prop=text&format=json`;

    const response = await fetch(URL);
    const data = await response.json();

    const html = data.parse.text["*"];
    const $ = cheerio.load(html);

    const name = $("div.infobox-header")
      .first()
      .text()
      .replace(/\[.*?\]/g, "")
      .trim();

    const getValue = (label) => {
      const el = $("div.infobox-cell-2.infobox-description").filter((_, el) =>
        $(el).text().trim().toLowerCase().includes(label.toLowerCase())
      ).first();

      const value = el.next("div").text().replace(/\s+/g, " ").trim();
      return value || null;
    };

    const nationality = getValue("nationality");
    const born = getValue("born");
    const status = getValue("status");
    const role = getValue("role");
    const team = getValue("team");
    const alternateIDs = getValue("alternate ids");
    const nicknames = getValue("nickname");

    const approxTotalWinningsText = getValue("approx");
    const approxTotalWinnings = approxTotalWinningsText
      ? Number(approxTotalWinningsText.replace(/[^0-9]/g, ""))
      : null;

    const links = {};
    $(".infobox-center.infobox-icons a").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      if (href.includes("facebook")) links.facebook = href;
      else if (href.includes("instagram")) links.instagram = href;
      else if (href.includes("twitter")) links.twitter = href;
      else if (href.includes("tiktok")) links.tiktok = href;
      else if (href.includes("youtube")) links.youtube = href;
      else if (href.startsWith("http")) links.website = href;
    });

    const signatureHeroes = [];
    $("div.infobox-cell-2.infobox-description")
      .filter((_, el) =>
        $(el).text().toLowerCase().includes("signature heroes")
      )
      .first()
      .next("div")
      .find("a")
      .each((_, el) => {
        const hero = $(el).attr("title");
        if (hero && !hero.includes("edit")) {
          signatureHeroes.push(hero.trim());
        }
      });

    const achievements = [];

    $("div.infobox-center span.league-icon-small-image a").each((_, el) => {
      const title = $(el).attr("title");
      if (!title) return;

      const clean = title.trim();

      if (
        clean.toLowerCase().includes("edit") ||
        clean.toLowerCase().includes("category") ||
        clean.toLowerCase().includes("file")
      ) return;

      achievements.push(clean);
    });

    const uniqueAchievements = [...new Set(achievements)];

    return res.json({
      player,
      name,
      info: {
        nationality,
        born,
        status,
        role,
        team,
        alternateIDs,
        nicknames,
        approxTotalWinnings,
      },
      signatureHeroes,
      achievements: uniqueAchievements,
      links,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch player detail",
      error: err.message,
    });
  }
};