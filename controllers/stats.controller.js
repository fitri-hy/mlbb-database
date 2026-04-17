exports.getStats = async (req, res) => {
  try {
    const response = await fetch("https://mlbbhub.com/api/stats");

    if (!response.ok) {
      return res.status(response.status).json({
        total: 0,
        message: "Failed to fetch MLBB stats",
      });
    }

    const data = await response.json();

    const heroes = data?.heroes || data?.data?.heroes || [];

    return res.status(200).json({
      total: heroes.length,
      data: heroes,
    });
  } catch (error) {
    return res.status(500).json({
      total: 0,
      message: "Server error while fetching stats",
      error: error.message,
    });
  }
};

exports.groupHeroesByTier = async (req, res) => {
  try {
    const response = await fetch("https://mlbbhub.com/api/stats");

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Failed to fetch MLBB stats",
      });
    }

    const result = await response.json();

    const heroes = result?.heroes || result?.data?.heroes || [];

    const grouped = heroes.reduce((acc, hero) => {
      const tier = hero.tier || "UNKNOWN";

      if (!acc[tier]) {
        acc[tier] = [];
      }

      acc[tier].push(hero);

      return acc;
    }, {});

    return res.status(200).json({
      total: heroes.length,
      data: grouped,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while grouping heroes",
      error: error.message,
    });
  }
};