const https = require('https');

/*
 * Complete the function below.
 * Use console.log to print the result, you should not return from the function.
 */
function getMovieTitles(substr) {
    getFirstPage(substr);
}

var list = [];
var pagesRead = 0;
var pagesExpected;

function getFirstPage(substr) {
    const prefix = "https://jsonmock.hackerrank.com/api/movies/search/";
    const url = prefix + "?Title=" + substr + "&page=1";
    https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            pagesExpected = body.total_pages;
            for (var ii = 2; ii <= pagesExpected; ii++) {
                getPage(substr, ii);
            }
            checkCompletion(body.data);
        });
    });
}

function getPage(substr, ii) {
    const prefix = "https://jsonmock.hackerrank.com/api/movies/search/";
    const url = prefix + "?Title=" + substr + "&page=" + ii;
    https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            checkCompletion(body.data);
        });
    });
}

function checkCompletion(bodyData) {
    pagesRead += 1;
    list = list.concat(bodyData.map(function (item) {
        return item.Title;
    }));

    if (pagesRead >= pagesExpected) {
        list.sort();
        list.forEach(value => console.log(value) );
    }
}

getMovieTitles('water');
