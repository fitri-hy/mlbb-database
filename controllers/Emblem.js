const fs = require('fs');
const path = require('path');

exports.index = (req, res) => {
    try {
        const emblemList = require("../storage/emblem-list.json");
        const allEmblems = emblemList.data || [];

        res.render("pages/emblem", {
            title: "MLBB Emblem List",
			desc: "Browse the latest MLBB emblem list with detailed effects, talents, and optimal builds to enhance your hero’s performance in every role.",
            allEmblems: allEmblems
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};