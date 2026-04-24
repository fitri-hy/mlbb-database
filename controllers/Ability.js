const fs = require('fs');
const path = require('path');

exports.index = (req, res) => {
    try {
        const abilityData = require("../storage/ability-list.json");
        const allAbilities = abilityData.data || [];

        const groupedAbilities = allAbilities.reduce((acc, obj) => {
            const key = obj.section;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(obj);
            return acc;
        }, {});

        res.render("pages/ability", {
            title: "MLBB Ability List",
			desc: "Explore the complete Mobile Legends (MLBB) ability list, including passive and active skills, effects, cooldowns, and usage tips for every hero.",
            groupedAbilities: groupedAbilities
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};