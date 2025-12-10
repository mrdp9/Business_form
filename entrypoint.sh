#!/bin/sh
# This is a shell script, which is a script that the shell (like bash or sh) can execute.
# The '#!/bin/sh' is called a shebang. It tells the system that this script should be run with the 'sh' interpreter.

# 'set -e' will cause the script to exit immediately if any command fails.
# This is a good practice for scripts to avoid unexpected behavior.
set -e

# This script is a wrapper around the original entrypoint of the postgres image.
# The original entrypoint is located at /usr/local/bin/docker-entrypoint.sh.
# We need to run it to start the PostgreSQL server.

# We start the original entrypoint in the background using '&'.
# This allows our script to continue executing while the database server starts up.
# '$@' is a special variable that holds all the arguments passed to this script.
# We pass them along to the original entrypoint. In our case, this will be "postgres".
docker-entrypoint.sh "$@" &

# Wait for the PostgreSQL server to be ready to accept connections.
# We use a loop with 'pg_isready', which is a utility that comes with PostgreSQL.
# -h localhost: the server is running on the same container.
# -p 5432: the default postgres port.
# -U "$POSTGRES_USER": checks with the user defined by the environment variable.
# The loop continues until pg_isready returns a success exit code.
until pg_isready -h localhost -p 5432 -U "$POSTGRES_USER"; do
  # If it's not ready, we print a message and wait for 1 second.
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

# Once the loop finishes, we know the database is ready.
>&2 echo "Postgres is up - running init script"

# Change to the /app directory where our scripts and package.json are.
cd /app

# Now, run the Node.js database initialization script.
# This script will connect to the database and create the necessary tables.
# Note: This script needs the database connection environment variables to be set
# (e.g., DB_USER, DB_PASSWORD, DB_NAME), just like your server.js.
# You will need to pass these to the 'docker run' command using the -e flag.
node scripts/init-db.js

# After our script is done, we use the 'wait' command.
# This command waits for the background process (the postgres server) to finish.
# This effectively brings the postgres server process to the foreground.
# If we don't do this, the script would end, and the container would stop.
wait
