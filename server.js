const http = require("http")
//const express = require("express")

const app = require('./upload')
const port = process.env.PORT || 5000;

const server = http.createServer(app)




server.listen(port, ()=>{
    console.log(` app is listening on port ${port}`)
})