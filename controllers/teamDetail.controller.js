const cheerio = require("cheerio");

exports.getTeamDetail = async (req, res) => {
  try {
    const team = req.params.team;

    const URL = `https://liquipedia.net/mobilelegends/api.php?action=parse&page=${team}&prop=text&format=json`;

    const response = await fetch(URL);
    const data = await response.json();

    const html = data.parse.text["*"];
    const $ = cheerio.load(html);

    const description = $("p").first().text().trim();

    const teamInfo = {
      location: null,
      region: null,
      approxTotalWinnings: null,
      links: {},
      achievements: [],
    };

    $(".infobox-cell-2.infobox-description").each((_, el) => {
      const label = $(el).text().toLowerCase();
      const value = $(el).next().text().trim();

      if (!value) return;

      if (label.includes("location")) teamInfo.location = value;
      if (label.includes("region")) teamInfo.region = value;

      if (label.includes("approx")) {
        const num = value.replace(/[^0-9]/g, "");
        teamInfo.approxTotalWinnings = num ? Number(num) : null;
      }
    });

    $(".infobox-icons a").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      if (href.includes("facebook")) teamInfo.links.facebook = href;
      else if (href.includes("instagram")) teamInfo.links.instagram = href;
      else if (href.includes("twitter")) teamInfo.links.twitter = href;
      else if (href.includes("youtube")) teamInfo.links.youtube = href;
      else if (href.includes("tiktok")) teamInfo.links.tiktok = href;
      else if (href.startsWith("http")) teamInfo.links.website = href;
    });

    $(".infobox-center a").each((_, el) => {
      const title = $(el).attr("title");
      if (title) teamInfo.achievements.push(title.trim());
    });

    const placement = [];

    $(".infobox-apex table.wikitable tbody tr").each((i, el) => {
      const tds = $(el).find("td");
      if (tds.length < 5) return;

      placement.push({
        tier: $(tds[0]).text().trim(),
        gold: parseInt($(tds[1]).text().trim()) || 0,
        silver: parseInt($(tds[2]).text().trim()) || 0,
        bronze: parseInt($(tds[3]).text().trim()) || 0,
        top3: parseInt($(tds[4]).text().trim()) || 0,
        all: parseInt($(tds[5]).text().trim()) || 0,
      });
    });

    const timeline = [];

    $("div.tabs-content ul li").each((_, el) => {
      const event = $(el).text().replace(/\s+/g, " ").trim();

      const players = [];
      $(el)
        .find("a")
        .each((_, a) => {
          const name = $(a).attr("title");
          if (name) players.push(name);
        });

      timeline.push({ event, players });
    });

    return res.json({
      team,
      description,
      teamInfo,
      placement,
      timeline,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch team detail",
      error: err.message,
    });
  }
};