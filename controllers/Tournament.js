const fs = require('fs');
const path = require('path');

const readJSON = (filename) => {
    const filePath = path.join(__dirname, `../storage/tournament/${filename}`);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

exports.index = (req, res) => {
    try {
        const listData = readJSON('tournament-list.json');
        res.render('pages/tournaments', {
            title: 'MLBB Tournament Results',
			desc: "Get detailed information about the latest Mobile Legends tournament, including schedule, teams, match results, and player statistics.",
            data: listData.data 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};

exports.detail = (req, res) => {
    try {
        const statsData = readJSON('tournament-stats.json');
        const summaryData = readJSON('tournament-summary.json');

		res.render('pages/tournament-details', {
			tournament: statsData.data.tournament,
			stats: statsData.data.stats,
			summary: summaryData.data.summary, 
			lastUpdated: statsData.data.tournament.updated_at, 
			title: statsData.data.tournament.name,
			desc: "Get detailed information about the latest Mobile Legends tournament, including schedule, teams, match results, and player statistics."
		});
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};