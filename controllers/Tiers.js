const fs = require('fs');
const path = require('path');

exports.index = (req, res) => {
    try {
        delete require.cache[require.resolve("../storage/hero-tier.json")];
        const heroData = require("../storage/hero-tier.json");
        
        let allHeroes = heroData.data.heroes;
        const searchQuery = req.query.search || "";

        if (searchQuery) {
            allHeroes = allHeroes.filter(h => 
                h.hero_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        const tierOrder = ["SS", "S", "A", "B", "C", "D"];

        const groupedHeroes = allHeroes.reduce((acc, hero) => {
            const tier = hero.tier.toUpperCase();
            if (!acc[tier]) acc[tier] = [];
            acc[tier].push(hero);
            return acc;
        }, {});

        const sortedTiers = tierOrder.filter(t => groupedHeroes[t]);

        res.render("pages/tiers", {
            title: "MLBB Tier List",
			desc: "Stay updated with the latest MLBB tier list. Discover the best heroes in the current meta for each role and rank up faster.",
            groupedHeroes: groupedHeroes,
            sortedTiers: sortedTiers,
            searchQuery: searchQuery
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};