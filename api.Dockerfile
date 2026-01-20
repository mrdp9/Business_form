# Use an official Node.js runtime as a parent image.
# Using a specific version ensures that your build is reproducible.
# 'alpine' images are very small, which is great for production.
FROM node:18-alpine

# Set the working directory in the container.
# This is where your app's files will live.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory.
# We copy these files first to take advantage of Docker's layer caching.
# If these files haven't changed, Docker will use the cached node_modules layer
# instead of reinstalling all the dependencies, which speeds up the build process.
COPY package*.json ./

# Install any needed packages specified in package.json.
# 'npm ci' is often recommended for production builds as it uses the package-lock.json
# to install exact versions of dependencies, which is more secure and predictable.
# However, 'npm install' is also fine.
RUN npm install

# Bundle your app's source code inside the Docker image.
# The '.' means copy everything from the current directory on your host
# to the working directory inside the container.
COPY . .

# Make your app's port available to the outside world.
# The Express app in server.js listens on port 3000.
EXPOSE 3000

# Define the command to run your app.
# This is what will be executed when the container starts.
CMD [ "node", "server.js" ]
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1