import sererConfig from "../.config/server.yml";

const log = (data: any[]) => {
  if (sererConfig.logs_enabled) {
    
  }
}

const server = Bun.serve({
  port: sererConfig.port,

  fetch(req) {
    console.log("HTTP 200 OpenHttp ", req.url);
    return new Response("OpenHttp Server OK");
  },
});

console.log(`Server running at ${server.url}`);
