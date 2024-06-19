const express = require("express");
const mongoConnection = require("./database/db").mongoConnection;
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const userRoutes = require("./routes/userRoutes");
const alumniRoutes = require("./routes/alumniRoutes");
const postRoutes = require('./routes/postRoutes');
const eventRoutes = require("./routes/eventRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const statisticsRoutes = require('./routes/statisticRoutes');


app.use(express.json());

app.use("/", userRoutes);
app.use("/alumnis", alumniRoutes);
app.use('/posts', postRoutes);
app.use("/events", eventRoutes);
app.use("/reports", reportRoutes);
app.use("/notifications", notificationRoutes);
app.use('/statistics', statisticsRoutes);

app.listen(port, () => {
    console.log("App is running on http://localhost:" + port);
});
