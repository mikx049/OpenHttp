const server = Bun.serve({
    port: 3000,

    fetch(req) {
        return new Response("MyApp Server OK");
    },
});

console.log(`Server running at ${server.url}`);