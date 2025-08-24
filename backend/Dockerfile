# Use Node.js LTS version 18 with Alpine Linux (lightweight)
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install only production dependencies (excludes devDependencies)
RUN npm install --production

# Copy all source code to the container
COPY . .

# Expose port 3001 to allow external connections
EXPOSE 3001

# Start the application using npm start
CMD ["npm", "start"]