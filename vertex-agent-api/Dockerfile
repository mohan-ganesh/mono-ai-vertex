# Base image
FROM node:20-alpine

# Create and set working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app files
COPY . .

# Start the app
CMD [ "npm", "start" ]