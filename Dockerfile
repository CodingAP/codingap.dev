FROM denoland/deno:2.1.4

# The port that your application listens to.
EXPOSE 1337

WORKDIR /app

# These steps will be re-run upon each file change in your working directory:
COPY . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache server.ts

CMD ["run", "--allow-read", "--allow-net", "server.ts"]