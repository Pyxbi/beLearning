
const rateLimit = require("express-rate-limit");
const express = require('express');
const axios = require('axios');
const { createClient } = require('redis');

const app = express();
const PORT = 5000;

const WEATHER_API_KEY = '1dc1ae2484559e52c2f139ad6ba359dd';

// Connect to Redis
const redisClient = createClient();
redisClient.connect().catch(console.error);


// Limit: 5 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: "⚠️ Too many requests from this IP, please try again later.",
});

app.use(limiter); // apply rate limit globally

// route weather by city

app.get('/weather/:city', async(req,res) =>{
  const city = req.params.city.toLowerCase(); // use lowercase as key

  try{
    // Check if cached in Redis
    const cachedData = await redisClient.get(city);
    if (cachedData) {
      console.log(`Cache hit for ${city}`);
      return res.json(JSON.parse(cachedData));
    }
    limiter(req,res,async()=>{
        try{
          // If not in cache, fetch from OpenWeatherMap
          console.log(`Cache miss for ${city}, calling API...`);
          const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`;
          const response = await axios.get(url);

          // Save to Redis with 10 minutes TTL
          await redisClient.set(city, JSON.stringify(response.data), {
            EX: 600 // 600 seconds = 10 minutes
          });

          res.json(response.data);
       }catch(error){
        console.error("Error:", error.message);
        res.status(500).json({ error: "Could not fetch weather data" });
      }
    })
  }catch(error){
    res.status(500).json({ error: "Server error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});