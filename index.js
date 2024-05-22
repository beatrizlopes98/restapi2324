const express = require("express");
const mongoConnection = require("./database/db").mongoConnection;
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const userRoutes = require("./routes/userRoutes");
const alumniRoutes = require("./routes/alumniRoutes");
const postRoutes = require('./routes/postRoutes');

app.use(express.json());

app.use("/", userRoutes);
app.use("/alumni", alumniRoutes);
app.use('/posts', postRoutes);

app.listen(port, () => {
    console.log("App is running on http://localhost:" + port);
});
