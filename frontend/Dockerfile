# Use Node.js LTS version 18 with Alpine Linux (lightweight)
FROM node:24

# Set working directory inside the container
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy all source code to the container
COPY . .

# Build the Next.js application for production
RUN npm run build

# Expose port 3000 to allow external connections
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]