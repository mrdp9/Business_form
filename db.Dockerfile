# Use the official PostgreSQL image as a base.
# Using a specific version is recommended for production.
FROM postgres:14-alpine

# This Dockerfile is more complex than a typical database Dockerfile
# because your project uses Node.js scripts to initialize the database
# instead of the standard .sql scripts.
#
# Therefore, we need to install Node.js and npm inside the postgres container
# so that we can run your 'init-db.js' script.
#
# In a more standard setup, you would just copy .sql files to /docker-entrypoint-initdb.d/
# and the official postgres entrypoint would run them for you.
#
# Another popular and recommended approach is to use Docker Compose to manage
# both the API and DB services, and run the initialization script from the API
# container once the DB container is healthy.

# Install Node.js and npm.
# We use the package manager for the Alpine Linux distribution, which is 'apk'.
# '--no-cache' is a good practice to keep the image size small.
RUN apk add --no-cache nodejs npm

# Set a working directory for our app's scripts.
WORKDIR /app

# Copy the package.json and package-lock.json files to install dependencies.
COPY package*.json ./

# Copy the scripts directory, which contains the init-db.js script.
COPY scripts/ ./scripts/

# Install the Node.js dependencies required for the scripts (e.g., 'pg').
RUN npm install

# Copy the custom entrypoint script that will manage the database initialization.
# This script will start PostgreSQL, wait for it to be ready, and then run our
# Node.js initialization script.
COPY entrypoint.sh /usr/local/bin/

# Make the entrypoint script executable.
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set our custom script as the entrypoint for the container.
# This overrides the default entrypoint of the postgres image.
ENTRYPOINT ["entrypoint.sh"]

# Expose the default PostgreSQL port.
EXPOSE 5432

# Set the default command.
# Our entrypoint.sh script will pass this command to the original postgres entrypoint.
CMD ["postgres"]
