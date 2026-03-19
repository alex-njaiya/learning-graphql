const { GraphQLError } = require("graphql/error")
const { authors, books } = require("./resources")

const { gql } = require("graphql-tag");

const {v4: uuidv4} = require("uuid")

const typeDefs = gql`
    type Author {
        name: String!,
        id: ID!,
        born: Int,
        bookCount: Int!,
    }

    type Book {
        title: String!,
        published: Int,
        author: String!,
        id: ID!,
        genres: [String]
    }

    type Query {
        bookCount: Int!,
        authorCount: Int!,
        allBooks(author: String, genre: String): [Book!]!,
        allAuthors(name: String): [Author!]!
    }

    type Mutation {
        addBook(
            title: String!,
            author: String!,
            published: Int,
            genres: [String]!
        ): Book
    }
`

const resolvers = {
    Query: {
        bookCount: () => books.length,
        authorCount: () => authors.length,
        allBooks: (root, args) => {
            if(!args.author && !args.genre){
                return books
            } else if (args.author && !args.genre){
                return books.filter(bk => bk.author === args.author)
            } else if(args.genre && !args.author){
                return books.filter(bk => bk.genres.includes(args.genre))
            }
        },
        allAuthors: () => authors
    },
    Author: {
        bookCount: (parent) => {
            const authorBookCount = books.filter(b => b.author === parent.name)
            return authorBookCount.length
        }
    },
    Mutation: {
        addBook: (root, args) => {

            if(books.find(bk => bk.title === args.title)){
                throw new GraphQLError('Name must be unique', {
                    extensions: {
                        code: 'Bad User Input',
                        invalidArgs: args.title
                    }
                })
            }

            const book = {...args, id: uuidv4()}
            books = books.concat(book)
            return book
        }
    }
}

module.exports = { typeDefs, resolvers }