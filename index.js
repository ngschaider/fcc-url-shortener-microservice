const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const app = express();
const url = require("url");
const cors = require("cors");
const bodyParser = require("body-parser");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true
});


const urlSchema = mongoose.Schema({
  identifier: Number,
  url: String,
});

const urlModel = mongoose.model("Url", urlSchema);

app.use(bodyParser.urlencoded({extended: false})),
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

function getRandomIdentifier() {
  return Math.round(Math.random() * 10000);
}

app.post("/api/shorturl/new", (req, res) => {
  const urlString = req.body.url;
  const identifier = getRandomIdentifier();
  const parsedUrl = url.parse(urlString);
  dns.lookup(parsedUrl.hostname, (err, addresses, family) => {
    if(addresses === null) {
      res.json({
        error: "Invalid URL format",
      });
    } else {
      const url = new urlModel({
        identifier: identifier,
        url: urlString,
      });

      url.save((err, data) => {
        if(err) {
          res.json({
            error: err,
          });
        } else {
          res.json({
            original_url: urlString,
            short_url: identifier,
          });
        }
      });
    }
  })
  
});


app.get("/api/shorturl/:identifier", (req, res) => {
  const identifier = req.params.identifier;
  console.log("ID: " + identifier);
  urlModel.findOne({identifier: identifier}, (err, data) => {
    res.redirect(data.url);
  });
});

const listener = app.listen(process.env.PORT, () => {
  console.log("App listening on port " + listener.address().port);
})