const fs = require('fs');
const path = require('path');

exports.index = (req, res) => {
    try {
        const filePath = path.join(__dirname, '../storage/hero-statistics.json');
        const statsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const heroes = statsData.data.heroes || [];
        
        const lastUpdateRaw = heroes.length > 0 
            ? heroes[0].created_at 
            : "2026-04-20T21:00:56.000Z"; 

        res.render('pages/stats', {
            title: 'MLBB Hero Pick & Ban Rate',
			desc: "Track the latest MLBB hero pick and ban rates to understand the current meta and identify the most popular heroes in ranked and tournaments.",
            heroes: heroes,
            lastUpdated: lastUpdateRaw
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};