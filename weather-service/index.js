const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY
const BASE_URL = 'https://api.weatherapi.com/v1'

const getWeather = async (location) => {
    try {
        // day = 1 -> only today
        const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=1`
        const response = await axios.get(url);

        const temp = response.data.forecast.forecastday[0].day.avgtemp_c;
        
        return {
            location: response.data.location.name,
            temp
        }

    } catch(error) {
        console.error("Weather Service Error: ", error);
        return null; // so app won't crash
    }
}

// this is the format that AWS lambda expects
// we include charge calculation here
exports.handler = async (event) => {
    const location = event.queryStringParameters.location;

    // get weather data
    const weatherData = await getWeather(location);
    
    // calculate weather charge
    let charge = 0;
    const tempDiff = weatherData.temp - 21;

    if (tempDiff < 5 && tempDiff >= 2 ) {
        charge = 0.1
    }
    if (tempDiff < 10 && tempDiff >= 5) {
        charge = 0.2
    }
    if (tempDiff < 20 && tempDiff >= 10) {
        charge = 0.3
    }
    if (tempDiff >= 20) {
        charge = 0.5
    }

    // return charge
    return {
        statusCode: 200,
        body: JSON.stringify({
            location: weatherData.location,
            temp: weatherData.temp,
            charge // the important part
        })
    }

}