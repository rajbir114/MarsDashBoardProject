require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
app.get('/rover', async (req, res) => {
  // UNCOMMENT TO RUN LOCAL API KEY
  // DO NOT DELETE
  const ROVERS_URL = `https://api.nasa.gov/mars-photos/api/v1/rovers/?api_key=${process.env.API_KEY}`;

  try {
    //console.log('TEST ROVER');
    const nasaData = await fetch(ROVERS_URL).then(response => response.json());

    return res.send(nasaData);
  } catch (err) {
    console.log('error:', err);
  }
});

app.get('/rover/:name?/:max_date?', async (req, res) => {
  // UNCOMMENT TO RUN LOCAL API KEY
  // DO NOT DELETE
  const ROVERS_URL = 'https://api.nasa.gov/mars-photos/api/v1/rovers/';
  let url = ROVERS_URL;
  const { name, max_date } = req.params;

  url = `${url}${name}/photos?earth_date=${max_date}&api_key=${process.env.API_KEY}`;

  try {
    const nasaData = await fetch(url).then(response => response.json());

    return res.send(nasaData);

  } catch (err) {
    console.log('error:', err);
  }
});

// example API call
app.get('/apod', async (req, res) => {
    try {
      //	console.log('TEST APOD');
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))