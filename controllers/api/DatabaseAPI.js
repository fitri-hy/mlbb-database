const fs = require("fs");
const path = require("path");

exports.Ability = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../storage/ability-list.json");

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    const baseUrl = "https://mlbb.io/images/emblem/ability/";

    const abilityList =
      getData?.data?.data ||
      getData?.data ||
      [];

    const updatedData = abilityList.map(item => ({
      ...item,
      img_src: item.img_src?.startsWith("http")
        ? item.img_src
        : baseUrl + item.img_src
    }));

    if (getData?.data?.data) {
      getData.data.data = updatedData;
    } else if (getData?.data) {
      getData.data = updatedData;
    }

    return res.status(200).json(getData);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load data!",
      error: error.message,
    });
  }
};

exports.Emblems = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../storage/emblem-list.json");

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    const baseUrl = "https://mlbb.io/images/emblem/main/";

    const emblemsList =
      getData?.data?.data ||
      getData?.data ||
      [];

    const updatedData = emblemsList.map(item => ({
      ...item,
      img_src: item.img_src?.startsWith("http")
        ? item.img_src
        : baseUrl + item.img_src
    }));

    if (getData?.data?.data) {
      getData.data.data = updatedData;
    } else if (getData?.data) {
      getData.data = updatedData;
    }

    return res.status(200).json({
      data: getData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load data!",
      error: error.message,
    });
  }
};

exports.Heroes = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../storage/hero-list.json");

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    return res.status(200).json({
      data: getData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load data!",
      error: error.message,
    });
  }
};

exports.HeroesDetail = (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.includes("..") || id.includes("/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const filePath = path.join(
      __dirname, `../../storage/hero/${id}.json`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Hero not found",
      });
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    return res.status(200).json({
      getData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.Statistics = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../storage/hero-statistics.json");

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    return res.status(200).json({
      data: getData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load data!",
      error: error.message,
    });
  }
};

exports.Tiers = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../storage/hero-tier.json");

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    return res.status(200).json({
      data: getData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load data!",
      error: error.message,
    });
  }
};

exports.Items = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../storage/item-list.json");

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    const baseUrl = "https://mlbb.io";

    const itemList =
      getData?.data?.data ||
      getData?.data ||
      [];

    const updatedData = itemList.map(item => ({
      ...item,
      img_src: item.image_path
        ? baseUrl + item.image_path
        : null
    }));

    if (getData?.data?.data) {
      getData.data.data = updatedData;
    } else if (getData?.data) {
      getData.data = updatedData;
    }

    return res.status(200).json({
      data: getData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load data!",
      error: error.message,
    });
  }
};

exports.Builds = (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.includes("..") || id.includes("/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const filePath = path.join(__dirname, `../../storage/build/${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Build data not found",
      });
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    return res.status(200).json({
      success: true,
      data: getData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.Counter = (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.includes("..") || id.includes("/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const filePath = path.join(
      __dirname, `../../storage/counter/${id}.json`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    return res.status(200).json({
      getData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.Tournament = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../storage/tournament/tournament-list.json");

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    return res.status(200).json({
      data: getData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load data!",
      error: error.message,
    });
  }
};

exports.TournamentStats = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../storage/tournament/tournament-stats.json");

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    return res.status(200).json({
      data: getData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load data!",
      error: error.message,
    });
  }
};

exports.TournamentSummary = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../storage/tournament/tournament-summary.json");

    const rawData = fs.readFileSync(filePath, "utf-8");
    const getData = JSON.parse(rawData);

    return res.status(200).json({
      data: getData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load data!",
      error: error.message,
    });
  }
};