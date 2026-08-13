import sererConfig from "../.config/server.yml";

const server = Bun.serve({
  port: sererConfig.port,

  fetch(req) {
    return new Response("OpenHttp Server OK");
  },
});

console.log(`Server running at ${server.url}`);
