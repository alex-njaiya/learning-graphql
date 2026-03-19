const {gql} = require("graphql-tag")
const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
const {GraphQLError} = require("graphql")

const {v4: uuidv4} = require("uuid")


let persons = [
    {
        name: "Arto Hellas",
        phone: "040-123543",
        street: "Tapiolankatu 5 A",
        city: "Espoo",
        id: "3d594650-3436-11e9-bc57-8b80ba54c431"
    },
    {
        name: "Matti Luukkainen",
        phone: "040-432342",
        street: "Malminkaari 10 A",
        city: "Helsinki",
        id: '3d599470-3436-11e9-bc57-8b80ba54c431'
    },
    {
        name: "Venla Ruuska",
        street: "Nallemäentie 22 C",
        city: "Helsinki",
        id: '3d599471-3436-11e9-bc57-8b80ba54c431'
    },
];


const typeDefs = gql ` 

    enum YesNo {
        YES
        NO
    }

   type Address {
        street: String!
        city: String!
    }


    type Person {
        name: String!
        phone: String
        address: Address!
        id: ID!
    }


    type Query {
        personCount: Int!
        allPersons(phone: YesNo): [Person!]!
        findPerson(name: String!): Person
    }

    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): Person,
        editPhone(
            name: String!
            phone: String!
        ): Person,
        deletePerson(
            name: String!
        ): Person
    }

`

const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: (root, args) => {
            if(!args.phone){
                return persons
            }

            const byPhone = (person) => 
                args.phone === 'YES' ? person.phone : !person.phone
            return persons.filter(byPhone)
        },
        findPerson: (root, args) => {
            const person = persons.find(p => p.name === args.name)
            return person
        }
    },
    Person: {
        address: ({street, city}) => {
            return {
                street,
                city
            }
        }
    },
    Mutation: {
        addPerson: (root, args) => {
            if(persons.find(p => p.name === args.name)){
                throw new GraphQLError(`Name must be unique: ${args.name}`, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name
                    }
                })
            }
            const person = {...args, id: uuidv4()}
            persons = persons.concat(person)
            return person
        },
        editPhone: (root, args) => {
            const person = persons.find(p => p.name === args.name);

            if(!person){
                return null;
            }

            const updatedPerson = {...person, phone: args.phone}
            persons = persons.map(p => p.name === args.name ? updatedPerson: p)
            return updatedPerson
        },
        deletePerson: (root, args) => {
            const userToDelete = persons.find(p => p.name === args.name);

            if(!userToDelete){
                throw new Error('user not found')
            }

            persons = persons.filter(p => p.name !== userToDelete.name)

            return userToDelete

        }
    }
}


const server = new ApolloServer({
    typeDefs,
    resolvers
});

async function startServer(){
    const {url} = await startStandaloneServer(server);
    console.log(`Server running at ${url}`)
}

startServer()