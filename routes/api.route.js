const express = require("express");
const router = express.Router();

const DatabaseController = require("../controllers/api/DatabaseAPI");

router.get("/ability", DatabaseController.Ability);
router.get("/emblems", DatabaseController.Emblems);
router.get("/heroes", DatabaseController.Heroes);
router.get("/heroes/:id", DatabaseController.HeroesDetail);
router.get("/statistics", DatabaseController.Statistics);
router.get("/tiers", DatabaseController.Tiers);
router.get("/items", DatabaseController.Items);
router.get("/counter/:id", DatabaseController.Counter);
router.get("/tournament", DatabaseController.Tournament);
router.get("/tournament/stats", DatabaseController.TournamentStats);
router.get("/tournament/summary", DatabaseController.TournamentSummary);

module.exports = router;