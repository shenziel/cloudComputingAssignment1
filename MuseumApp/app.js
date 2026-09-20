const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const server = require('http').createServer(app);

app.set('view engine', 'ejs');

app.set('views',path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, "public")));

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);  
});
