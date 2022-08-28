const DATABASE_URL = process.env.DATABASE_URL || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@tell-a-tale.5ug6yzj.mongodb.net/storiesDB?retryWrites=true&w=majority`

const PORT = process.env.PORT || 8080

module.exports = { DATABASE_URL, PORT }
                  //bc the key and value are the same

