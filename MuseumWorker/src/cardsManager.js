var mongoose = require('mongoose');
var dbServer = '127.0.0.1:27017';
const dbPort = '27017';
const dbName = 'Archives';
var Archive = require('./archives');

class ArchivesManager {
    constructor() {
    }

    connect() {
        if (!process.env.ARCHIVESTORE_HOST) {
            console.log('WARNING: the environment variable ARCHIVESTORE_HOST is not set');        
        } else {
            dbServer = process.env.ARCHIVESTORE_HOST + ':' + dbPort;
        }

        let connection = `mongodb://${dbServer}/${dbName}`
        return mongoose.connect(connection)
            .then( () => console.log('Connected to database', dbName))
            .catch( (err) => {
                console.error('Database connection error', dbName);
                console.error(' trying to connect to server:', connection);
            });
    }

    startSearch(job, nrthreads, searchStrategy) {
        console.log('Starting search for', job.searchString);
        return Archive.find({title: job.cardTitle})
            .then(results => {
                let batches = Array.from(Array(nrthreads), () => Array());
                let roundRobin = 0;
                results.forEach(doc => {
                    batches[roundRobin++].push(doc);
                    roundRobin %= nrthreads;
                });            
                return batches;
            })
            .then( batches => batches.map( batch => Promise.resolve(batch).then( batch => this._runSearch(job, batch, searchStrategy) )) )
            .then( batches => Promise.all(batches) )
            .then( results => this._flattenResults(results) );
    }

    addArchive(title, description, contents) {
        content = contents || '';
        console.log('Storing archive to database');
        new Archive({name: title, description: description, imageUrl: content})
            .save()
            .catch(err => console.log('Error while inserting test archive:', err.message));
    }

    _runSearch(job, batch, searchStrategy) {
        return Promise.resolve(batch)
        .then( batch => {
            let results = [];
            batch.forEach( doc => {
                results.push(searchStrategy.search(job.searchString, doc.contents));
            });

            return results;
        });
    }

}

module.exports = ArchivesManager;