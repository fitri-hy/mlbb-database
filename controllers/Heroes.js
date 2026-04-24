const fs = require('fs');
const path = require('path');

exports.index = (req, res) => {
    try {
        const heroesList = require("../storage/hero-list.json");

        let allHeroes = heroesList.data || [];
        const search = req.query.search;

        if (search) {
            allHeroes = allHeroes.filter(hero =>
                hero.hero_name.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.render("pages/heroes", {
            title: "MLBB Heroes List",
            desc: "Check out the full list of Mobile Legends heroes, including roles, abilities, and latest updates to help you choose the best hero.",
            heroes: allHeroes,
            searchQuery: search
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};

exports.detail = (req, res) => {
    try {
        const heroId = req.params.id;
        const filePath = path.join(__dirname, `../storage/hero/${heroId}.json`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).render("pages/404", { title: "Hero Not Found" });
        }

        const rawData = fs.readFileSync(filePath, 'utf8');
        const heroDetail = JSON.parse(rawData);

        res.render("pages/heroes-detail", {
            title: `${heroDetail.data.hero_name}`,
            desc: "Explore detailed information about this Mobile Legends hero, including skills, best builds, emblems, counters, and gameplay tips.",
            hero: heroDetail.data
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};