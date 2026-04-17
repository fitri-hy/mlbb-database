const cheerio = require("cheerio");

function cleanText(str) {
  return String(str || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function parsePrice($, infobox) {
  const price = { battlePoints: null, diamonds: null, tickets: null };

  const priceEl = infobox.find("[data-source='price'] .pi-data-value");

  priceEl.find(".inline-image").each((_, el) => {
    const container = $(el);

    const rawParam = container.attr("data-param");

    const value =
      parseInt(rawParam, 10) ||
      parseInt(container.text().replace(/[^\d]/g, ""), 10);

    if (isNaN(value)) return;

    const typeText = cleanText(
      container.find("a").attr("title") ||
      container.find("img").attr("alt") ||
      container.parent().text()
    ).toLowerCase();

    if (typeText.includes("battle")) price.battlePoints = value;
    else if (typeText.includes("diamond")) price.diamonds = value;
    else if (typeText.includes("ticket")) price.tickets = value;
  });

  return price;
}

function parseList(text) {
  return cleanText(text)
    .replace(/\s+/g, " ")
    .split("/")
    .map(v => v.trim())
    .filter(Boolean);
}

exports.getHeroDetail = async (req, res) => {
  try {
    const name = encodeURIComponent(req.params.name);

    const url = `https://mobile-legends.fandom.com/api.php?action=parse&page=${name}&prop=text&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data?.parse?.text?.["*"]) {
      return res.status(404).json({ message: "Hero not found" });
    }

    const $ = cheerio.load(data.parse.text["*"]);
    const infobox = $(".portable-infobox").first();

    if (!infobox.length) {
      return res.status(404).json({ message: "Infobox not found" });
    }

    const title = cleanText(data.parse.title);

    const alias = cleanText(infobox.find(".pi-title span").text());

    const description = cleanText($("p").first().text());

    const image =
      infobox.find("img").first().attr("src") ||
      infobox.find("img").first().attr("data-src") ||
      null;

    const info = {
      releaseDate: cleanText(infobox.find("[data-source='release_date'] .pi-data-value").text()),
      role: parseList(infobox.find("[data-source='role'] .pi-data-value").text()),
      specialty: parseList(infobox.find("[data-source='specialty'] .pi-data-value").text()).join("/"),
      lane: parseList(infobox.find("[data-source='lane'] .pi-data-value").text()).join("/"),
      price: parsePrice($, infobox),
      resource: cleanText(infobox.find("[data-source='resource'] .pi-data-value").text()),
      damageType: cleanText(infobox.find("[data-source='dmg_type'] .pi-data-value").text()),
      attackType: cleanText(infobox.find("[data-source='atk_type'] .pi-data-value").text())
    };

const ratings = {
  durability: null,
  offense: null,
  controlEffects: null,
  difficulty: null
};

infobox.find("section.pi-item.pi-group").each((_, section) => {
  const title = cleanText($(section).find("h2").first().text()).toLowerCase();

  if (!title.includes("ratings")) return;

  $(section)
    .find(".pi-item[data-source]")
    .each((_, el) => {
      const item = $(el);
      const key = item.attr("data-source");
      const value = parseInt(item.find(".bar").text(), 10);

      if (isNaN(value)) return;

      if (key === "durability") ratings.durability = value;
      if (key === "offense") ratings.offense = value;
      if (key.includes("control")) ratings.controlEffects = value;
      if (key === "difficulty") ratings.difficulty = value;
    });
});

    const stats = {};

    $("table.wikitable tr").each((_, row) => {
      const cols = $(row).find("td");
      if (cols.length < 3) return;

      const key = cleanText($(cols[0]).text());
      const lvl1 = cleanText($(cols[1]).text());
      const lvl15 = cleanText($(cols[2]).text());
      const growth = cleanText($(cols[3]).text());

      if (!key) return;

      const k = key.toLowerCase();

      if (
        k.includes("icon") ||
        k.includes("variant") ||
        k.includes("image") ||
        k.includes("skin") ||
        k.length > 40
      ) return;

      const hasNumber = /\d/.test(lvl1) || /\d/.test(lvl15) || /\d/.test(growth);
      if (!hasNumber) return;

      stats[key] = { level1: lvl1 || null, level15: lvl15 || null, growth: growth || null };
    });

    const story = [];
    const content = $(".mw-parser-output").first();
    content.find("p").each((_, el) => {
      const text = cleanText($(el).text());

      if (!text) return;
      if (text.length < 40) return;

      const lower = text.toLowerCase();

      if (
        lower.includes("citation needed") ||
        lower.includes("voiced by") ||
        lower.includes("release date") ||
        lower.includes("role") ||
        lower.includes("attack") ||
        lower.includes("basic attack")
      ) return;

      story.push(text);
    });

	const gallery = [];
	let allowed = false;
	$(".mw-parser-output").children().each((_, el) => {
	  const node = $(el);

	  if (node.is("h3, h2")) {
		const text = cleanText(node.text()).toLowerCase();

		if (text.includes("splash art")) allowed = true;
		else if (
		  text.includes("avatar") ||
		  text.includes("emote") ||
		  text.includes("battle")
		) {
		  allowed = false;
		}

		return;
	  }

	  if (!allowed) return;

	  if (!node.hasClass("wikia-gallery")) return;

	  node.find(".wikia-gallery-item").each((_, el) => {
		const item = $(el);

		const imgEl = item.find("img.thumbimage").first();
		if (!imgEl.length) return;

		const img =
		  imgEl.attr("data-src") ||
		  imgEl.attr("src") ||
		  null;

		if (!img) return;
		if (img.startsWith("data:")) return;
		if (!img.includes("static.wikia.nocookie.net")) return;

		const caption = cleanText(
		  item.find(".lightbox-caption").first().text()
		);

		gallery.push({
		  title: caption || null,
		  image: img,
		});
	  });
	});

	const abilities = {
	  passive: null,
	  skills: []
	};

	let inAbilities = false;
	let currentSkill = null;

	$(".mw-parser-output").children().each((_, el) => {
	  const node = $(el);

	  if (node.is("h2")) {
		const text = cleanText(node.text()).toLowerCase();

		inAbilities = text.includes("abilities");
		currentSkill = null;
		return;
	  }

	  if (!inAbilities) return;

	  if (node.is("h3")) {
		const title = cleanText(node.text()).replace(/\[.*?\]/g, "").trim();

		if (/passive/i.test(title)) {
		  abilities.passive = {
			name: "Passive",
			description: ""
		  };
		  currentSkill = abilities.passive;
		} else {
		  const skillObj = {
			name: title,
			description: ""
		  };

		  abilities.skills.push(skillObj);
		  currentSkill = skillObj;
		}

		return;
	  }

	  if (node.hasClass("tabber") || node.hasClass("wds-tabber")) {
		const text = cleanText(node.text());

		if (currentSkill && text.length > 20) {
		  currentSkill.description += " " + text;
		}

		return;
	  }

	  if (node.is("table.wikitable")) {
		const text = cleanText(node.text());

		if (currentSkill) {
		  const cleaned = text
			.replace(/level scaling[\s\S]*$/i, "")
			.replace(/cooldown[\s\S]*$/i, "")
			.replace(/mana cost[\s\S]*$/i, "")
			.trim();

		  if (cleaned.length > 20) {
			currentSkill.description += " " + cleaned;
		  }
		}

		return;
	  }

	  if (node.is("p")) {
		const text = cleanText(node.text());

		if (currentSkill && text.length > 30) {
		  currentSkill.description += " " + text;
		}

		return;
	  }

	  if (abilities.passive && node.is("table.wikitable")) {
		const text = cleanText(node.text());

		if (text.length > 20) {
		  abilities.passive.description += " " + text;
		}
	  }
	});

    return res.json({
      name: title,
      alias,
      description,
      image,
      info,
	  ratings,
      stats,
      story: story.join(" "),
      gallery,
	  abilities,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch hero detail",
      error: err.message
    });
  }
};