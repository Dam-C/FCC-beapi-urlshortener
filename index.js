require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bodyParser = require("body-parser");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


let urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: Number,
});

let Url = mongoose.model("Url", urlSchema);
// https://www.freecodecamp.org
app.post('/api/shorturl', (req, res) => {

  let urlObj = new URL(req.body.url);

  dns.lookup(urlObj.hostname, { all: true }, async (err, address) => {
    if (err || address.length === 0) {
      res.json({ error: "invalid url" });
    } else {
      let shortUrl = await Url.countDocuments({});

      // create a model to send to DB
      let newUrl = new Url({
        original_url: req.body.url,
        short_url: shortUrl + 1,
      });

      // send the model to DB
      let doc = await newUrl.save()
      if (!doc) {
        res.json({error: 'Something went wrong'})
      }  
      
      // display the result
      res.json({
        original_url: doc.original_url,
        short_url: doc.short_url,
      });
    }
  });
})

app.get('/api/shorturl/:url?', async(req, res) => {
  // check if n

  let forward = await Url.findOne({short_url: req.params.url})
  if(!forward){
    res.json({error: 'Could not find the url in DB'})
  }
  res.redirect(forward.original_url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
