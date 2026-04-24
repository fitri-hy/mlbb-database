exports.index = (req, res) => {
    try {
        const heroTier = require("../storage/hero-tier.json");
        const heroStats = require("../storage/hero-statistics.json");
        const tournamentList = require("../storage/tournament/tournament-list.json");

        const heroes = heroTier.data.heroes || [];
        const stats = heroStats.data.heroes || [];
        const tournaments = tournamentList.data || [];

        const heroesWithStats = heroes.map(hero => {
            const stat = stats.find(s => s.hero_name === hero.hero_name);
            return {
                ...hero,
                stats: stat || { win_rate: 0, pick_rate: 0, ban_rate: 0 }
            };
        });

        const grouped = heroesWithStats
            .filter(hero => hero.tier === "SS")
            .reduce((acc, hero) => {
                if (!acc[hero.tier]) acc[hero.tier] = [];
                acc[hero.tier].push(hero);
                return acc;
            }, {});

        res.render("pages/index", {
            title: "MLBB Tier List, Hero Stats, Counters & Tournaments",
            desc: "Get a complete MLBB guide with updated tier lists, hero stats, counters, and tournament insights to improve your gameplay strategy.",
            groupedHeroes: grouped,
            allHeroes: heroesWithStats,
            tournaments: tournaments
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};