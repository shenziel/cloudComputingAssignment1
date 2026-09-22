const express = require('express');
const app = express();
const port = 3001;
const server = require('http').createServer(app);
const os = require('os');

const MAXTHREADS = process.env.MAXTHREADS || 10;
const ArchiveManager = require('./cardsManager');
app.use(express.json());

// Express setup
// --------------------
var router = express.Router();
router.get('/', (req, res) => res.send('Museum Worker is running'));
router.post('/addArchive', addArchive);
router.get('/listArchives', listArchives);
router.get('/listArchives/:title', listArchivesByTitle);
router.get('/searchArchive/:title', searchArchivesByTitle);
app.use('/', router);

// Here's the core of the poodle
// --------------------
function startSearch(req, res) {
    if (!req.params.searchString) return res.send('EMPTY');
    let title = req.params.textTitle.replaceAll('+', ' ').trim();
    let searchTerm = req.params.searchString.replaceAll('+', ' ').trim();
    let archiveManager = new ArchiveManager();
    let textSearcher = new ActiveSearchStrategy();
    console.log('Searching in', title, 'for:', searchTerm);
    return archiveManager.connect()
        .then( () => archiveManager.startSearch( {searchString: searchTerm, cardTitle: title}, MAXTHREADS, textSearcher) )
        .then( result => result.flat().map( r => { return { textTitle: title,
                                                            contents: r.replace(/[\n\r]/g, ' ').trim()};}))
        .then( r => { console.log('Number of results:',r.length); return r; })
        .then( cleaned => res.send(cleaned) );
}

function addArchive(req, res) {
    const {title, description, contents} = req.body;
    if (!title) return res.send('EMPTY');
    let archiveManager = new ArchiveManager();
    console.log('Adding archive:', title);
    return archiveManager.connect()
        .then( () => archiveManager.addArchive(title, description, contents).catch(err => console.log('Error while inserting test archive:', err.message)))
        .then( () => console.log('Archive added:', title, description, contents))
        .then( () => res.send('OK') );
}

function listArchives(req, res) {
    let archiveManager = new ArchiveManager();
    return archiveManager.connect()
        .then( () => archiveManager.listArchives())
        .then( archives => archives.filter( a => a.name !== 'DrCain' && a.name !== 'X'))
        .then( archives => res.send(archives) );
}

function listArchivesByTitle(req, res) {
    let archiveManager = new ArchiveManager();
    let title = req.params.title.replaceAll('+', ' ').trim();
    return archiveManager.connect()
        .then( () => archiveManager.listArchives())
        .then( archives => archives.filter( a => a.name === title))
        .then( archives => res.send(archives) );
}

function searchArchivesByTitle(req, res) {
    let archiveManager = new ArchiveManager();
    let title = req.params.title.replaceAll('+', ' ').trim();
    return archiveManager.connect()
        .then( () => archiveManager.listArchives())
        .then( archives => archives.filter( a => a.name.includes(title)))
        .then( archives => res.send(archives) );
}

// Simple error handling
// --------------------
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    console.log('Page not found: ' + req.url);
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.log('Error %d, url: %s', err.status, req.url);
    console.log('Body: %s', JSON.stringify(req.body));

    if ('/favicon.ico' != req.url) {
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('Error %d, remoteAddress: %s', err.status, ip);
        console.log('If running inside Vagrant, this may give some clues to the callers identity:');
        console.log(req.ip);
        console.log(req.ips);
        console.log(req.hostname);
        console.log(req.headers);   
    }     
    
    // render the error page
    res.status(err.status || 500);
    res.send('error');
});

// All done, start listening
server.listen(port, () => {
    console.log(`Reploid Museum Worker listening on port ${port}`);
    console.log('Server id:', os.hostname());
});
