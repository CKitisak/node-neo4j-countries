// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// libraries
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var async   = require('async');
var colors  = require('colors/safe');
var fs      = require('fs');
var neo4j   = require('neo4j-driver').v1;
var path    = require('path');
var Promise = require('promise');



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// globals
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var CONFIG = {
    NEO4J: {
        SERVER: 'bolt://localhost',
        USERNAME: 'neo4j',
        PASSWORD: 'neo4j'
    },
    SOURCE_FILE: path.join(__dirname, 'countries.json')
};



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// functions
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function errorHandler(error) {
    console.log(error);
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// core
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var retrieveCountries = new Promise(getCountries);

retrieveCountries.then(getCountriesOk, errorHandler);


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// main
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getCountries(resolve, reject) {
    var countries = fs.readFileSync(CONFIG.SOURCE_FILE, {encoding: 'utf8'});
    countries = JSON.parse(countries);
    
    var temp = [];

    async.each(countries.data,
    	function(country, callback) {
            if (country.row && country.row.length > 0) {
                console.log(colors.rainbow(country.row[0].name));
                temp.push(country.row[0]);
                callback();
            } else {
                callback('no data');
            }
    	},
    	function(error) {
    		if (error) {
    			console.log(colors.red.underline('error reading file'));
                reject(error);
    		} else {
    			console.log(colors.green.underline('reading file success'));
                resolve(temp);
    		}
    	}
    );
}

function getCountriesOk(countries) {
    
    var driver = neo4j.driver(CONFIG.NEO4J.SERVER, neo4j.auth.basic(CONFIG.NEO4J.USERNAME, CONFIG.NEO4J.PASSWORD));
    var session = driver.session();

    var query = 'UNWIND {COUNTRIES} AS country '+
                'CREATE (n:Countries) '+
                'SET n = country '+
                'RETURN COUNT(n) ';

    var queryParams = {
        COUNTRIES: countries
    };

    session.run(query, queryParams)
        .then(function(result) {
            session.close();
            driver.close();
    
            if (result.summary.updateStatistics._stats.nodesCreated == countries.length) {
                console.log(colors.green.underline.bold('node created ' + result.summary.updateStatistics._stats.nodesCreated + ' from ' + countries.length));
            } else {
                console.log(colors.red.underline('node created ' + result.summary.updateStatistics._stats.nodesCreated + ' from ' + countries.length));
            }
        })
        .catch(function(error) {
            driver.close();
            
            console.log(colors.red.underline('session error creating node'));
            errorHandler(error);
        });

}

    
