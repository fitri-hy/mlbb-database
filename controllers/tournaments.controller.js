const cheerio = require("cheerio");

const parseTournamentTable = ($, sectionId) => {
  const section = $(`h3#${sectionId}`);
  if (!section.length) return [];

  let table = null;

  section.parent().nextAll().each((_, el) => {
    const found = $(el).find("table.table2__table");
    if (found.length) {
      table = found.first();
      return false;
    }
  });

  if (!table || !table.length) return [];

  const result = [];

  table.find("tr.table2__row--body").each((_, el) => {
    const tds = $(el).find("td");

    if (tds.length < 7) return;

    let logo =
      $(tds[1]).find("img").attr("src") ||
      $(tds[1]).find("img").attr("data-src") ||
      null;

    if (logo && logo.startsWith("/")) {
      logo = "https://liquipedia.net" + logo;
    }

    const tier = $(tds[0]).text().trim();
    const tournament = $(tds[2]).text().trim();
    const date = $(tds[3]).text().trim();

    const prizePool = $(tds[4]).text().trim() || null;
    const location = $(tds[5]).text().trim();

    const participantsRaw = $(tds[6])?.text()?.trim();
    const participants = participantsRaw ? Number(participantsRaw) : null;

    const winner = $(tds[7])?.text()?.trim() || null;
    const runnerUp = $(tds[8])?.text()?.trim() || null;

    result.push({
      logo,
      tier,
      tournament,
      date,
      prizePool,
      location,
      participants,
      winner,
      runnerUp,
    });
  });

  return result;
};

exports.getTournaments = async (req, res) => {
  try {
    const URL =
      "https://liquipedia.net/mobilelegends/api.php?action=parse&page=Portal:Tournaments&prop=text&format=json";

    const response = await fetch(URL);
    const data = await response.json();

    const html = data.parse.text["*"];
    const $ = cheerio.load(html);

    const fiveMostRecent = parseTournamentTable($, "Five_Most_Recent");
    const sTierATier = parseTournamentTable($, "S-Tier_and_A-Tier");
    const bTierCTier = parseTournamentTable($, "B-Tier_and_C-Tier");
    const qualifiers = parseTournamentTable($, "Qualifiers");

    const total =
      fiveMostRecent.length +
      sTierATier.length +
      bTierCTier.length +
      qualifiers.length;

    return res.json({
      total,
      tournaments: {
        fiveMostRecent,
        sTierATier,
        bTierCTier,
        qualifiers,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch tournaments",
      error: err.message,
    });
  }
};