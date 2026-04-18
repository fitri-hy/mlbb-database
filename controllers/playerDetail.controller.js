const cheerio = require("cheerio");

exports.getPlayerDetail = async (req, res) => {
  try {
    const player = req.params.player;

    const URL = `https://liquipedia.net/mobilelegends/api.php?action=parse&page=${player}&prop=text&format=json`;

    const response = await fetch(URL);
    const data = await response.json();

    const html = data?.parse?.text?.["*"];
    if (!html) {
      return res.status(404).json({ message: "Player not found" });
    }

    const $ = cheerio.load(html);

    // =================
    // HELPER
    // =================
    const cleanText = (str) =>
      String(str || "")
        .replace(/\s+/g, " ")
        .replace(/\[.*?\]/g, "")
        .trim();

    const getRow = (label) => {
      return $("div.infobox-cell-2.infobox-description")
        .filter((_, el) =>
          $(el).text().toLowerCase().includes(label.toLowerCase())
        )
        .first();
    };

    const getValue = (label) => {
      const el = getRow(label);
      if (!el.length) return null;

      const value = el.next("div").text();
      return cleanText(value);
    };

    const getLinkValue = (label) => {
      const el = getRow(label);
      if (!el.length) return null;

      const link = el.next("div").find("a").attr("title");
      return link ? cleanText(link) : getValue(label);
    };

    // =================
    // NAME (FIX)
    // =================
    const name = getValue("name") || player;

    // =================
    // PHOTO (NEW)
    // =================
    const photoRaw = $(".infobox-image-wrapper img").first().attr("src");

    const photo = photoRaw
      ? `https://liquipedia.net${photoRaw}`
      : null;

    // =================
    // INFO
    // =================
    const nationality = getValue("nationality");
    const born = getValue("born");
    const status = getValue("status");
    const role = getLinkValue("role");
    const team = getLinkValue("team");
    const alternateIDs = getValue("alternate");

    const winningsText = getValue("approx");
    const approxTotalWinnings = winningsText
      ? Number(winningsText.replace(/[^0-9]/g, ""))
      : null;

    // =================
    // SIGNATURE HEROES
    // =================
    const signatureHeroes = [];

    getRow("signature heroes")
      ?.next("div")
      .find("a")
      .each((_, el) => {
        const hero = $(el).attr("title");
        if (hero) signatureHeroes.push(cleanText(hero));
      });

    // =================
    // LINKS
    // =================
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

    // =================
    // ACHIEVEMENTS
    // =================
    const achievements = [];

    $("span.league-icon-small-image a").each((_, el) => {
      const title = $(el).attr("title");
      if (!title) return;

      const clean = cleanText(title);

      if (
        clean.toLowerCase().includes("edit") ||
        clean.toLowerCase().includes("category") ||
        clean.toLowerCase().includes("file")
      )
        return;

      achievements.push(clean);
    });

    const uniqueAchievements = [...new Set(achievements)];

    // =================
    // RESPONSE
    // =================
    return res.json({
      player,
      name,
      photo,
      info: {
        nationality,
        born,
        status,
        role,
        team,
        alternateIDs,
        approxTotalWinnings,
      },
      signatureHeroes,
      achievements: uniqueAchievements,
      links,
    });
  } catch (err) {
    if (res.headersSent) return;

    return res.status(500).json({
      message: "Failed to fetch player detail",
      error: err.message,
    });
  }
};