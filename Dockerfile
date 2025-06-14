#############################################
# Stage 1: Build and compile your Deno app  #
#############################################
FROM denoland/deno:2.3.5 AS builder

# Create app directory
WORKDIR /app

# Cache dependencies (adjust if you use deps.ts)
#COPY deps.ts ./
#RUN deno cache deps.ts

# Copy source code
COPY . ./
RUN ls
# Compile the app into a single binary (optional)
# Replace `main.ts` with your entrypoint
RUN deno compile \
    --include="./src/static/p.txt" \
    --output ./app \
    --allow-net \
    --allow-env \
    --allow-read \
    ./src/index.ts

#############################################
# Stage 2: Runtime                          #
#############################################
FROM debian:bullseye-slim

# Create a non-root user (optional but recommended)
RUN addgroup --system deno && \
    adduser --system --ingroup deno deno

WORKDIR /app

# Copy the compiled binary (or the whole project if you prefer single-stage)
COPY --from=builder /app/app /app/app
COPY --from=builder /app/src/static/p.txt /app/src/static/p.txt
COPY --from=builder /app/src/static/p.txt /app/src/static/p.txt

# Expose the port your app listens on
EXPOSE 8000

# Switch to non-root user
USER deno

# Run the compiled binary
CMD ["/app/app"]
