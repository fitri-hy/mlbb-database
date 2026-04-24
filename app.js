const path = require('path');
const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout");

const webRoutes = require("./routes/web.route");
app.use("/", webRoutes);

const apiRoutes = require("./routes/api.route");
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});