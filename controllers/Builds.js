const fs = require('fs');
const path = require('path');

exports.index = (req, res) => {
    try {
        const heroList = JSON.parse(fs.readFileSync(path.join(__dirname, '../storage/hero-list.json'), 'utf-8'));
        const itemList = JSON.parse(fs.readFileSync(path.join(__dirname, '../storage/item-list.json'), 'utf-8'));
        const emblemList = JSON.parse(fs.readFileSync(path.join(__dirname, '../storage/emblem-list.json'), 'utf-8'));
        const abilityList = JSON.parse(fs.readFileSync(path.join(__dirname, '../storage/ability-list.json'), 'utf-8'));

        const itemsMap = {};
        itemList.data.forEach(item => itemsMap[item.id] = item.image_path);

        const emblemsMap = {};
        emblemList.data.forEach(emb => {
            emblemsMap[emb.id] = { name: emb.name, img: `https://mlbb.io/images/emblem/main/${emb.img_src}` };
        });

        const abilitiesMap = {};
        abilityList.data.forEach(abi => {
            abilitiesMap[abi.id] = { name: abi.name, img: `https://mlbb.io/images/emblem/ability/${abi.img_src}` };
        });

        const heroes = heroList.data.map(hero => {
            const buildPath = path.join(__dirname, `../storage/build/${hero.id}.json`);
            let allBuilds = [];

            if (fs.existsSync(buildPath)) {
                const bData = JSON.parse(fs.readFileSync(buildPath, 'utf-8'));
                if (bData.data && bData.data.length > 0) {
                    allBuilds = bData.data.map(build => ({
                        ...build,
                        item_images: build.items.map(id => itemsMap[id]),
                        main_emblem: emblemsMap[build.emblems.main_id],
                        talent_data: build.emblems.ability_ids.map(id => {
                            return abilitiesMap[id] || { name: 'Unknown', img: 'placeholder.png' };
                        })
                    }));
                }
            }
            return { ...hero, builds: allBuilds };
        });

        res.render("pages/builds", {
            title: "MLBB Build List",
            desc: "Explore top global builds.",
            heroes: heroes
        });

    } catch (error) {
        console.error("BuildsController Error:", error);
        res.status(500).send("Internal Server Error");
    }
};