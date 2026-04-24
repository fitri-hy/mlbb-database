exports.index = (req, res) => {
    try {
        const itemsJson = require("../storage/item-list.json");
        const allItems = itemsJson.data || [];

        const groupedItems = allItems.reduce((acc, item) => {
            const cat = item.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});

        const manualOrder = ["Movement", "Attack", "Magic", "Defense", "Jungling", "Roaming"];
        
        const otherCats = Object.keys(groupedItems).filter(c => !manualOrder.includes(c));
        const sortedCategories = [...manualOrder.filter(c => groupedItems[c]), ...otherCats];

        res.render("pages/items", {
            title: "MLBB Items List",
			desc: "Find the complete MLBB items list with stats, effects, and recommended builds for different heroes and in-game situations.",
            groupedItems: groupedItems,
            categories: sortedCategories
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed load data!");
    }
};