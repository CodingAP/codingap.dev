FROM denoland/deno:alpine

WORKDIR /app

# Copy source
COPY . .

# Expose the server port
EXPOSE 8000

# Run using deno task
CMD ["deno", "task", "run"]