const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const server = require('http').createServer(app);
const ejs = require('ejs');
const io = require('socket.io')(server);
const axios = require('axios');
const urlBackend = 'http://localhost:3001'; // Replace with your backend URL

const firstCard = [{
    title: "DrCain",
    description: "The human who created the Reploids",
    image: "https://static.wikia.nocookie.net/megaman/images/6/61/Drcain.jpg/revision/latest/scale-to-width-down/268?cb=20181209035029",
  }];

const sampleCards = [{
    title: "Capsule",
    description: "The capsule that contained X",
    image: "https://static.wikia.nocookie.net/megaman/images/4/4c/MMXCapsule.png/revision/latest/scale-to-width-down/153?cb=20181210222749"
  },
  {
    title: "Sigma",
    description: "The leader of the Maverick hunters",
    image: "https://static.wikia.nocookie.net/megaman/images/e/e2/X4_SigmaGood_%28stitched%29.png/revision/latest/scale-to-width-down/180?cb=20221001170235"
  },
  {
    title: "Thomas Light",
    description: "The father of Robotics",
    image: "https://megamanwiki.s3.us-east-va.io.cloud.ovh.us/thumb/c/c9/MHX_-_Dr._Light_Art_1.png/250px-MHX_-_Dr._Light_Art_1.png"
  }
    ];

const sampleCards2 = [{
    title: "X",
    description: "The robot that inspired the creation of the reploids",
    image: "https://static.wikia.nocookie.net/megaman/images/b/bb/MM_X_Titanium-X.png/revision/latest?cb=20130302182543"
  }];


async function addCard(title, description, image) { 
    const newCard = {
        title: title,
        description: description,
        image: image
    };
    sampleCards.push(newCard);
      let url = image || 'https://static.wikia.nocookie.net/megaman/images/b/bb/MM_X_Titanium-X.png/revision/latest?cb=20130302182543';
        let cardTitle = title || '';
        console.log('Adding Text', title);
         console.log('Fetched text: ', url);
            return await axios.post(urlBackend + '/addArchive', {
                title: cardTitle,
                description: description,
                content: url
            })
            .then( () => socket.emit('archiveAdded', cardTitle) )
            .then(() => console.log('Archive added.'))
            .catch( (err) => {
                console.log('Could not add text. Error', err);
            });
}

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

app.get('/reploidBeginnings', (req, res) => {
    res.render('reploidBeginnings', { cards: sampleCards2 });
});

app.get('/submitExhibit', (req, res) => {
    res.render('submitExhibit');
});

app.post('/submitExhibit', express.urlencoded({ extended: true }), (req, res) => {
    const { title, description, image } = req.body;
    addCard(title, description, image);
    res.redirect('/specialExhibits');
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);  
});

io.on('connection', (socket) => {
    console.log('A user connected',socket.id);
    socket.emit('message', 'Welcome to the Reploid Museum!');
    socket.on('addCard', (data) => {
        console.log('Received new card data:', data);
        addCard(data.title, data.description, data.image);
        io.emit('newCard', data);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected',socket.id);
    });
}); 