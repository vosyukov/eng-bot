FROM denoland/deno:2.3.5 AS builder

# Create app directory
WORKDIR /app

COPY . ./

RUN deno install
RUN deno compile \
    --include="./src/static/p.txt" \
    --output ./app \
    --allow-net \
    --allow-env \
    --allow-read \
    ./src/index.ts


FROM debian:bullseye-slim


RUN addgroup --system deno && \
    adduser --system --ingroup deno deno

WORKDIR /app

COPY --from=builder /app/app /app/app
COPY --from=builder /app/src/static/p.txt /app/src/static/p.txt

USER deno

CMD ["/app/app"]
