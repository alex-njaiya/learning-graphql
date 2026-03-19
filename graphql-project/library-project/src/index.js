const {ApolloServer} = require("@apollo/server")
const {startStandaloneServer} = require("@apollo/server/standalone");
const {resolvers, typeDefs} = require("./schema")


const server = new ApolloServer({
    typeDefs,
    resolvers
});

async function startServer(){
    const {url} = await startStandaloneServer(server);
    console.log(`Server running at ${url}`)
}

startServer()