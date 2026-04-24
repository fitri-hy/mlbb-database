const fs = require('fs');
const path = require('path');
const heroesList = require("../storage/hero-list.json");

exports.index = (req, res) => {
    try {
        const heroesList = require("../storage/hero-list.json");
        const allHeroes = heroesList.data || [];
        const allCounters = {};

        const counterDir = path.join(__dirname, '../storage/counter/');

        if (fs.existsSync(counterDir)) {
            try {
                const files = fs.readdirSync(counterDir);
                files.forEach(file => {
                    if (file.endsWith('.json')) {
                        const heroId = file.replace('.json', '');
                        const content = JSON.parse(
                            fs.readFileSync(path.join(counterDir, file), 'utf8')
                        );
                        allCounters[heroId] = content.data || [];
                    }
                });
            } catch (e) {
                console.error("Counter error:", e);
            }
        }

        res.render('pages/counter', {
            title: 'MLBB Hero Counters',
            desc: "Discover the best hero counters in Mobile Legends. Learn effective counter picks, strategies, and team compositions to dominate your matches.",
            allHeroes: allHeroes,
            allCounters: JSON.stringify(allCounters)
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};