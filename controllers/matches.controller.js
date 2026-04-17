const cheerio = require("cheerio");

exports.getMatches = async (req, res) => {
  try {
    const URL =
      "https://liquipedia.net/mobilelegends/api.php?action=parse&page=Liquipedia:Matches&prop=text&format=json";

    const response = await fetch(URL);
    const data = await response.json();

    const html = data.parse.text["*"];
    const $ = cheerio.load(html);

    const matches = [];

    $(".match-info").each((_, el) => {
      const matchEl = $(el);

      const team1 =
        matchEl
          .find(".match-info-header-opponent-left .name a")
          .first()
          .text()
          .trim() || null;

      const team2 =
        matchEl
          .find(
            ".match-info-header-opponent:not(.match-info-header-opponent-left) .name a"
          )
          .first()
          .text()
          .trim() || null;

      if (!team1 && !team2) return;

      let score = null;

      const scoreNumbers = matchEl
        .find(".match-info-header-scoreholder-score")
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(Boolean);

      if (scoreNumbers.length >= 2) {
        score = `${scoreNumbers[0]}:${scoreNumbers[1]}`;
      } else if (scoreNumbers.length === 1) {
        score = `${scoreNumbers[0]}:0`;
      }

      const tournament =
        matchEl.find(".match-info-tournament-name a").text().trim() || null;

      const timer = matchEl.find(".timer-object").first();

      const timestamp = timer.attr("data-timestamp")
        ? Number(timer.attr("data-timestamp"))
        : null;

      let date = null;

      const dateText = timer.find(".timer-object-date").text().trim();

      if (dateText) {
        date = dateText;
      } else if (timestamp) {
        date = new Date(timestamp * 1000).toISOString();
      }

      const now = Math.floor(Date.now() / 1000);

      const isFinished = timer.attr("data-finished") === "finished";

      const hasLiveClass =
        matchEl.find(".timer-object-countdown-live").length > 0;

      const hasLiveText =
        matchEl
          .find(".timer-object-countdown-time")
          .text()
          .trim()
          .toUpperCase() === "LIVE";

      const hasStarted = timestamp && timestamp <= now;

      let status = "upcoming";

      if (isFinished) {
        status = "completed";
      } else if (hasLiveClass || hasLiveText || hasStarted) {
        status = "live";
      } else {
        status = "upcoming";
      }

      matches.push({
        team1,
        team2,
        score,
        tournament,
        date,
        status,
        timestamp,
      });
    });

    return res.json({
      total: matches.length,
      matches,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to scrape matches",
      error: err.message,
    });
  }
};