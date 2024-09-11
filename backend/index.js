const connectToMongo = require("./db");
connectToMongo();
const cors = require("cors")
const express = require('express')
const app = express()
const port = 4500
app.use(cors())
app.use(express.json())

// Available routes
app.use('/api/auth/', require('./routes/auth'))
app.use('/api/notes/', require('./routes/notes'))
app.listen(port, () => {
    console.log(`iNotebook Backend listening on port ${port}`)
})

