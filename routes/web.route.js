const express = require("express");
const router = express.Router();

const HomeController = require("../controllers/Home");
const HeroesController = require("../controllers/Heroes");
const TiersController = require("../controllers/Tiers");
const CounterController = require("../controllers/Counter");
const EmblemController = require("../controllers/Emblem");
const AbilityController = require("../controllers/Ability");
const ItemsController = require("../controllers/Items");
const BuildsController = require("../controllers/Builds");
const StatsController = require("../controllers/Stats");
const TournamentController = require("../controllers/Tournament");

router.get("/", HomeController.index);
router.get("/heroes", HeroesController.index);
router.get("/heroes/:id", HeroesController.detail);
router.get("/tiers", TiersController.index);
router.get("/counter", CounterController.index);
router.get("/emblem", EmblemController.index);
router.get("/ability", AbilityController.index);
router.get("/items", ItemsController.index);
router.get("/builds", BuildsController.index);
router.get("/stats", StatsController.index);
router.get("/tournament", TournamentController.index);
router.get('/tournaments/:id', TournamentController.detail);

module.exports = router;