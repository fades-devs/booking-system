// index.js (goes to AWS)
const BASE_URL = "https://api.weatherapi.com/v1";

const getWeather = async (location) => {
  try {
    const API_KEY = process.env.WEATHER_API_KEY; 
    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=1`;
    
    // Native fetch - no axios required
    const response = await fetch(url);
    const data = await response.json();

    const temp = data.forecast.forecastday[0].day.avgtemp_c;

    return {
      location: data.location.name,
      temp,
    };
  } catch (error) {
    console.error("Weather Service Error: ", error);
    return null; 
  }
};

exports.handler = async (event) => {
  const location = event.queryStringParameters?.location;

  if (!location) {
      return { statusCode: 400, body: JSON.stringify({ message: "Location is required" }) };
  }

  const weatherData = await getWeather(location);

  if (!weatherData) {
      return { statusCode: 500, body: JSON.stringify({ message: "Error fetching weather data" }) };
  }

  let charge = 0;
  const tempDiff = weatherData.temp - 21;

  if (tempDiff < 5 && tempDiff >= 2) charge = 0.1;
  else if (tempDiff < 10 && tempDiff >= 5) charge = 0.2;
  else if (tempDiff < 20 && tempDiff >= 10) charge = 0.3;
  else if (tempDiff >= 20) charge = 0.5;

  return {
    statusCode: 200,
    body: JSON.stringify({
      location: weatherData.location,
      temp: weatherData.temp,
      charge,
    }),
  };
};