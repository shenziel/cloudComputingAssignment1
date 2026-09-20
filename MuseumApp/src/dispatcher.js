const fetch = require('node-fetch');
const DEFAULTTIMEOUT = 20;
const DEFAULTWORKER = "museumworker";


class Dispatcher {
    constructor() {
        this.TIMEOUT = 1000 * (process.env.TIMEOUT || DEFAULTTIMEOUT);
        this.WORKER = process.env.WORKER || DEFAULTWORKER;
    }

    formatJobs(searchString, cards) {
        return cards.map( card => { return {searchString: searchString,  card};});
    }

    dispatchSearch(searchString, jobs, socket) {
        console.log('Searching for : ' + searchString);
        let baseurl = 'http://' + this.WORKER + ':3000';

        if (0 >= jobs.length) {
            socket.emit('done', {msg: 'no texts available' }); 
            return 'DONE'
        };        

        setTimeout( () => socket.emit('done', {msg: 'timeout'}), this.TIMEOUT);

        return Promise.all(jobs.map( j => {
            let title = j.card.title.replaceAll(' ','+');
            let search = j.searchString.replaceAll(' ','+');
            let url = baseurl + '/' + title + '/' +search;
            console.log('Using url:', url);
            return fetch(url)
                .then(res => res.json())
                .then(res => res.forEach( t => socket.emit('answer', JSON.stringify(t))));
        }))
        .then( () => socket.emit('done', {msg: 'done'}));
    }

}

module.exports = Dispatcher;