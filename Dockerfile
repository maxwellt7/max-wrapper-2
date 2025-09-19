# Use the official Node.js 20 as a parent image
FROM node:20-alpine as base

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from the front directory
COPY package*.json ./

# Install dependencies with legacy peer deps using ci for reproducible builds
RUN npm ci --legacy-peer-deps --force

# Copy the rest of your application's code from the front directory
COPY . .

# Build the app for production
RUN npm run build

# Expose the port the app runs on
EXPOSE 5000

# Set NODE_ENV to production to exclude dev dependencies
ENV NODE_ENV=production

# Start the app
CMD ["npm", "run", "start"]