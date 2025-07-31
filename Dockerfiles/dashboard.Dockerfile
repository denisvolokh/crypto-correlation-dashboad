FROM denoland/deno:alpine-1.39.1

WORKDIR /app

COPY dashboard /app/dashboard

CMD ["run", "--allow-net", "--allow-read", "dashboard/server.ts"]
