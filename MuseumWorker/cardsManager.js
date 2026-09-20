var mongoose = require('mongoose');
var dbServer = '127.0.0.1:27017';
const dbPort = '27017';
const dbName = 'Archives';
var Text = require('./archives');

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
            //.then( () => console.log('Connected to database', dbName))
            .catch( (err) => {
                console.error('Database connection error', dbName);
                console.error(' trying to connect to server:', connection);
            });
    }

}

module.exports = ArchivesManager;