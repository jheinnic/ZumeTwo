const JSONStream = require("JSONStream");
const https = require("https");
const stream = require("stream");
const Writable = stream.Writable;

/*
 * Complete the function below.
 * Use console.log to print the result, you should not return from the function.
 */
function getMovieTitles(substr) {
    return new Promise((resolveHeader, rejectHeader) => {
        const prefix = "https://jsonmock.hackerrank.com/api/movies/search/";
        const url = prefix + "?Title=" + substr + "&page=1";
        https.get(url, res => {
            res.setEncoding("utf8");
            const parse = JSONStream.parse(['data', true, 'Title']);
            parse.on("header", data => {
                if (!data || (data.total_pages <= 0)) {
                    rejectHeader(data);
                } else {
                    resolveHeader([
                        data.total_pages,
                        new Promise((resolveBody, rejectBody) => {
                            parse.pipe(
                                new ResultWritable(resolveBody, rejectBody)
                            );
                        })
                    ]);
                }
            });


            res.pipe(parse);
        });
    }).then(valuePair => {
        const [pagesExpected, promiseOne] = valuePair;
        const allPromises = new Array(pagesExpected);

        allPromises[0] = promiseOne;
        for (let ii = 1; ii < pagesExpected; ii++) {
            allPromises[ii] = getAdditionalPage(substr, ii);
        }

        return Promise.all(allPromises)
            .then(allResults => {
                const combined = flatten(allResults);
                combined.sort();
                combined.forEach(value => console.log(value));
            });
    }).catch(err => {
        console.error("Failed to parse header: " + err);
    });
}

function flatten(arr, result = []) {
    for (let i = 0, length = arr.length; i < length; i++) {
        const value = arr[i];
        if (Array.isArray(value)) {
            flatten(value, result);
        } else {
            result.push(value);
        }
    }

    return result;
};

function getAdditionalPage(subString, ii) {
    return new Promise((resolveBody, rejectBody) => {
        const prefix = "https://jsonmock.hackerrank.com/api/movies/search/";
        const url = prefix + "?Title=" + subString + "&page=" + (ii + 1);
        https.get(url, res => {
            const parse = JSONStream.parse(['data', true, 'Title']);
            const writer = new ResultWritable(resolveBody, rejectBody);
            res.setEncoding("utf8");
            res.pipe(parse).pipe(writer);
        });
    });
}

class ResultWritable extends Writable {
    constructor(resolve, reject) {
        super({decodeStrings: false});
        this.result = new Array(0);
        this.resolve = resolve;
        this.reject = reject;
    }

    _write(chunk, encoding, callback) {
        this.result.push(chunk);
        callback();
    }

    _final(callback) {
        this.resolve(this.result);
        callback();
    }
}

getMovieTitles('water');

