# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# Using 'ci' is faster and more reliable for builds, but 'install' works if lockfile is out of sync
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# Install a simple static server
RUN npm install -g serve

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the app using 'serve', pointing to the 'dist' folder (Vite output)
# -s flag ensures Single Page Application routing (redirects to index.html)
# -l 8080 specifies the port
CMD ["serve", "-s", "dist", "-l", "8080"]
