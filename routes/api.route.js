const express = require("express");
const router = express.Router();

const heroesController = require("../controllers/heroes.controller");
const heroDetailController = require("../controllers/heroDetail.controller");
router.get("/heroes", heroesController.getHeroes);
router.get("/heroes/:name", heroDetailController.getHeroDetail);


const lodDetailController = require("../controllers/lod.controller");
router.get("/land-of-dawn", lodDetailController.getLandOfDawn);


const gameModeController = require("../controllers/gameMode.controller");
router.get("/game-mode", gameModeController.getGameModes);


const emblemController = require("../controllers/emblem.controller");
router.get("/emblem", emblemController.getEmblems );


const itemController = require("../controllers/item.controller");
router.get("/item", itemController.getItems );


const itemDetailController = require("../controllers/itemDetail.controller");
router.get("/item/:name", itemDetailController.getItemDetail);


const statsController = require("../controllers/stats.controller");
router.get("/stats", statsController.getStats);
router.get("/tier", statsController.groupHeroesByTier);


const teamController = require("../controllers/team.controller");
router.get("/team", teamController.getTeamEarnings );


const teamDetailController = require("../controllers/teamDetail.controller");
router.get("/team/:team", teamDetailController.getTeamDetail);


const playerController = require("../controllers/player.controller");
router.get("/player", playerController.getPlayerEarnings);


const playerDetailController = require("../controllers/playerDetail.controller");
router.get("/player/:player", playerDetailController.getPlayerDetail);


const patchController = require("../controllers/patch.controller");
router.get("/patch", patchController.getPatches);


const tournamentsController = require("../controllers/tournaments.controller");
router.get("/tournaments", tournamentsController.getTournaments);


const matchesController = require("../controllers/matches.controller");
router.get("/matches", matchesController.getMatches);

module.exports = router;