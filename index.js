require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const urlparser = require('url')
const { MongoClient } = require('mongodb');
const { url } = require('inspector');

const client = new MongoClient(process.env.MONGO_URI)
// Basic Configuration
const port = process.env.PORT || 3000;
const db = client.db("urlshortner")
const urls = db.collection("urls")
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  // console.log(req.body);
  const url = req.body.url;
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if(!address) {
      res.json({
        err: "invalid url"
      })
    } else {
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url,
        short_url: urlCount
      }
      const result = await urls.insertOne(urlDoc)
      console.log(result);
      res.json({
        original_url : urlDoc.url, short_url : urlDoc.short_url
      })
    }
  })
});
// app.get('/api/shorturl/:short_url',  (req, res) => {
//   const shortUrlCode = req.params.short_url;
//   const filter = {short_url: +shortUrlCode}
//   urls.findOne(filter, (err, urlFound) => {
//     if (err || !urlFound) {
//       return res.json({
//         err: "invalid url"
//       });
//     }
//     res.redirect(urlFound.url);
//   });
  
// })
// app.get('/api/shorturl/:short_url', (req, res) => {
//   const shortUrlCode = req.params.short_url;
//   const filter = { short_url: +shortUrlCode };

//   urls.findOne(filter, (err, urlFound) => {
//     if (err || !urlFound) {
//       return res.json({
//         err: "invalid url"
//       });
//     }
//     res.redirect(urlFound.url);
//   });
// });
// app.get('/api/shorturl/:short_url', (req, res) => {
//   const shortUrlCode = req.params.short_url;
//   const filter = { short_url: +shortUrlCode };
//   urls.findOne(filter)
//     .then(urlFound => {
//       if (!urlFound) {
//         return res.json({
//           err: "invalid url"
//         });
//       }
//       res.redirect(urlFound.url);
//     })
//     .catch(err => {
//       res.json({
//         err: "invalid url"
//       });
//     });
// });
app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const shortUrlCode = req.params.short_url;
    const filter = { short_url: +shortUrlCode };
    const urlFound = await urls.findOne(filter);
    if (!urlFound) {
      return res.json({
        err: "invalid url"
      });
    }
    res.redirect(urlFound.url);
  } catch (err) {
    return res.json({
      err: "invalid url"
    });
  }
});

// app.get('/api/shorturl/:short_url', async(req, res) => {
//   const shorturl = req.params.short_url;
//   const urlDoc = await urls.findOne({short_url: +shorturl});
//   res.redirect(urlDoc.url);
// })
app.get('/api/test', async (req, res) => {
  const urlDoc = await urls.findOne({short_url: +0});
  res.redirect(urlDoc.url);
  console.log(urlDoc);
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
