const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/storiesDB"

const PORT = process.env.PORT || 8080

module.exports = { DATABASE_URL, PORT }
                  //bc the key and value are the same

