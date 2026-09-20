const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const server = require('http').createServer(app);
const ejs = require('ejs');

const firstCard = [{
    title: "DrCain",
    description: "The human who created the Reploids",
    image: "/images/DrCain.jpg",
  }];

const sampleCards = [{
    title: "Capsule",
    description: "The capsule that contained X",
    image: "/images/MMXCapsule.jpg"
  },
  {
    title: "reploids",
    description: "The reploids that were created by Dr. Cain",
    image: "/images/reploid.jpg"
  }
    ];


app.set('view engine', 'ejs');

app.set('views',path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, "public")));

app.use('/css', express.static(path.join(__dirname, 'public/css')));

app.get('/', (req, res) => {
    res.render('index', { cards: firstCard });
});

app.get('/specialExhibits', (req, res) => {
    res.render('specialExhibits', { cards: sampleCards });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);  
});
