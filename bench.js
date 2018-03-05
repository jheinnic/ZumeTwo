const mainAll = require('./mainAll');
const Benchmark = require('benchmark');
const util = require('util');
const suite = new Benchmark.Suite;
const searchStr = 'water';


// add tests
suite.add('main.js', {
    defer: true,
    delay: 0.5,
    initCount: 3,
    minSamples: 10,
    minTime: 2,
    fn: function (deferred) {
        return mainAll.getMovieTitlesOne(searchStr, deferred.resolve.bind(deferred));
    }
})
    .add('main2.js', {
        defer: true,
        delay: 0.5,
    	initCount: 3,
    	minSamples: 10,
    	minTime: 2,
        fn: function (deferred) {
            return mainAll.getMovieTitlesTwo(searchStr).then(deferred.resolve.bind(deferred));
        }
    })
    .add('main3.js', {
        defer: true,
        delay: 0.5,
    	initCount: 3,
    	minSamples: 10,
    	minTime: 2,
        fn: function (deferred) {
            return mainAll.getMovieTitlesThree(searchStr).then(deferred.resolve.bind(deferred));
        }
    })
    // add listeners
    .on('cycle', function (event) {
        console.error(event.target.name);
        console.error(util.inspect(event.target.stats));
        console.error(util.inspect(event.target.times));
    })
    .on('complete', function () {
        console.error('Fastest is ' + this.filter('fastest').map('name'));
        console.error(util.inspect(this));
    })
    // run sync
    .run({'async': false});
