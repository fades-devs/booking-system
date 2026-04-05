const { fakerEN_GB: faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const Room = require('./Room'); // Mongoose model

require('dotenv').config();

async function seedDatabase() {
  await mongoose.connect(process.env.MONGO_URI);
  await Room.deleteMany({}); // Clear old data

  const premiumNames = ['The Apex', 'Summit', 'Zenith', 'Nova', 'Lumina', 'Oasis', 'Elevate', 'Vantage', 'Nexus', 'Meridian'];
  const ukCities = ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Bristol', 'Leeds', 'Liverpool', 'Dundee', 'York', 'Cambridge'];
  const roomTypes = ['Executive Boardroom', 'Conference Hall', 'Meeting Room', 'Huddle Space', 'Training Room', 'Creative Studio'];

  const rooms = [];
  for (let i = 0; i < 30; i++) {

    // Generate an image URL using the random Unsplash API
    // We add &sig=${i} so the browser doesn't cache the same image 50 times
    // Generate 1 to 3 images per room and put them in your pictures array
    const picturesArray = [];
    const numPics = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < numPics; j++) {
        picturesArray.push(`https://images.unsplash.com/random/800x600/?conference-room,office,boardroom&sig=${i}${j}`);
    }

    rooms.push({
      title: `${faker.helpers.arrayElement(premiumNames)} ${faker.helpers.arrayElement(roomTypes)}`,
      basePrice: faker.commerce.price({ min: 80, max: 100 }), // for the day
      capacity: faker.number.int({ min: 10, max: 100 }),
      location: `${faker.helpers.arrayElement(ukCities)}`,
      partnerId: "google-oauth2|112348816518413107098",
      pictures: picturesArray
    });
  }

  await Room.insertMany(rooms);
  console.log("Database seeded successfully!");
  process.exit();
}

seedDatabase();