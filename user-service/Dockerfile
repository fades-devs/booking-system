# Node version
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]