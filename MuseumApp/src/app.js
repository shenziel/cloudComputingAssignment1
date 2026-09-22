const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const server = require('http').createServer(app);
const axios = require('axios');
const redis = require('redis');
const queueHost = process.env.MESSAGEQUEUE_HOST || 'messagequeue';
const queuePort = process.env.MESSAGEQUEUE_PORT || 6379;
const queueKey = process.env.QUEUE_KEY || 'archives:jobs';
const queueClient = redis.createClient({ url: `redis://${queueHost}:${queuePort}` });
queueClient.on('error', (err) => {
    console.error('Queue error:', err);
});
await queueClient.connect().then(() => {
    console.log('Connected to Redis queue at', queueHost + ':' + queuePort);
}).catch((err) => {
    console.error('Could not connect to Redis queue at', queueHost + ':' + queuePort, 'Error:', err);
});
const urlBackend = process.env.URL_BACKEND || 'http://museumworker:3001'; 
const io = require('socket.io')(server);
const { io: ioClient } = require('socket.io-client');
const workerSocket = ioClient(urlBackend);

workerSocket.on('connect', () => {
    console.log('Connected to backend worker:', workerSocket.id);
});

workerSocket.on('disconnect', () => {
    console.log('Disconnected from backend worker');
});

app.set('view engine', 'ejs');

app.set('views',path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, "public")));

app.use('/css', express.static(path.join(__dirname, 'public/css')));

app.get('/', (req, res) => {
    return listArchivesTitle('DrCain').then(archives => {
        res.render('index', { archives: archives });
    });
});

app.get('/specialExhibits', (req, res) => {
    return listArchives().then(archives => {
        res.render('specialExhibits', { archives: archives });
    });
});

app.get('/searchSpecialExhibits', (req, res) => {
    return searchArchives(req.query.search).then(archives => {
        res.render('specialExhibits', { archives: archives });
    });
});

app.get('/reploidBeginnings', (req, res) => {
    return listArchivesTitle('X').then(archives => {
        res.render('reploidBeginnings', { archives: archives });
    });
});

app.get('/submitExhibit', (req, res) => {
    res.render('submitExhibit');
});

app.post('/submitExhibit', express.urlencoded({ extended: true }), (req, res) => {
    const { title, description, image } = req.body;
    addArchive(title, description, image);
    res.redirect('/specialExhibits');
});

async function addArchive(title, description, image) { 
    const newCard = {
        title: title,
        description: description,
        image: image
    };
    sampleCards.push(newCard);
      let url = image || 'https://static.wikia.nocookie.net/megaman/images/b/bb/MM_X_Titanium-X.png/revision/latest?cb=20130302182543';
        let archiveTitle = title || '';
        console.log('Adding Archive', title);
         console.log('Fetched archive: ', url);
            return queueClient.lpush(queueKey, JSON.stringify({
                title: archiveTitle,
                description: description,
                contents: url
            }), (err) => {
                if (err) {
                    console.error('Error adding archive to queue:', err);
                } else {
                    console.log('Archive added to queue:', archiveTitle);
                }
            })
            .then( () => workerSocket.emit('addArchive', { title: archiveTitle, description: description, image: url }) )
            .then( () => console.log('Emitted addArchive event to backend worker.'))
            .then( () => socket.emit('archiveAdded', archiveTitle) )
            .then(() => console.log('Archive added.'))
            .catch( (err) => {
                console.log('Could not add archive. Error', err);
            });
}

function listArchives() {
    return axios.get(urlBackend + '/listArchives')
        .then( response => {
            console.log('Archives:', response.data);
            console.log('urlBackend:', urlBackend);
            return response.data;
        })
        .catch( (err) => {
            console.log('Could not list archives. Error', err);
            return [];
        });
}

function listArchivesTitle(listArchivesTitle) {
    return axios.get(urlBackend + '/listArchives/' + listArchivesTitle)
        .then( response => {
            console.log('Archives:', response.data);
            return response.data;
        })
        .catch( (err) => {
            console.log('Could not list archives. Error', err);
            return [];
        });
}

function searchArchives(searchString) {
    return axios.get(urlBackend + '/searchArchive/' + searchString)
        .then( response => {
            console.log('Search results:', response.data);
            return response.data;
        })
        .catch( (err) => {
            console.log('Could not search archives. Error', err);
            return [];
        });
}

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);  
});

io.on('connection', (socket) => {
    console.log('A user connected',socket.id);
    socket.emit('message', 'Welcome to the Reploid Museum!');
    socket.on('addArchive', (data) => {
        console.log('Received new archive data:', data);
        addArchive(data.title, data.description, data.image);
        io.emit('newArchive', data);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected',socket.id);
    });
}); 