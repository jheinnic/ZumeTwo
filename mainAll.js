const https = require("https");
const stream = require("stream");
const Writable = stream.Writable;
const Transform = stream.Transform;
const JSONStream = require("JSONStream");
const pagesRegex = /"total_pages":([0-9]*),(.*)$/;
const titleRegex = /"Title":"([^"]*)",(.*)$/;

/*
 * Complete the function below.
 * Use console.log to print the result, you should not return from the function.
 */
function getMovieTitlesOne(substr, resolveBench) {
    list = []
    pagesRead = 0;
    pagesExpected = 999999;
    getFirstPageOne(substr, resolveBench);
}

let list = [];
let pagesRead = 0;
let pagesExpected = 999999;

function getFirstPageOne(substr, resolveBench) {
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
            for (let ii = 2; ii <= pagesExpected; ii++) {
                getPageOne(substr, ii, resolveBench);
            }
            checkCompletionOne(body.data, resolveBench);
        });
    });
}

function getPageOne(substr, ii, resolveBench) {
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
            checkCompletionOne(body.data, resolveBench);
        });
    });
}

function checkCompletionOne(bodyData, resolveBench) {
    pagesRead += 1;
    list = list.concat(bodyData.map(function (item) {
        return item.Title;
    }));

    if (pagesRead >= pagesExpected) {
        list.sort();
        list.forEach(value => console.log(value));
        resolveBench();
    }
}


/*
 * Complete the function below.
 * Use console.log to print the result, you should not return from the function.
 */
function getMovieTitlesTwo(subString) {
    return new Promise((resolveHeader, rejectHeader) => {
        const prefix = "https://jsonmock.hackerrank.com/api/movies/search/";
        const url = prefix + "?Title=" + subString + "&page=1";
        https.get(url, res => {
            res.setEncoding("utf8");
            res.pipe(new HeaderTransformTwo(resolveHeader, rejectHeader));
        });
    }).then(valuePair => {
        const [pagesExpected, promiseOne] = valuePair;
        const allPromises = new Array(pagesExpected);

        allPromises[0] = promiseOne;
        for (let ii = 1; ii < pagesExpected; ii++) {
            allPromises[ii] = getAdditionalPageTwo(subString, ii);
        }

        return Promise.all(allPromises)
            .then(allResults => {
                const combined = flatten(allResults);
                combined.sort();
                combined.forEach(value => {
                    console.log(value);
                });
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

function getAdditionalPageTwo(subString, ii) {
    return new Promise((resolveBody, rejectBody) => {
        const prefix = "https://jsonmock.hackerrank.com/api/movies/search/";
        const url = prefix + "?Title=" + subString + "&page=" + (ii + 1);
        https.get(url, res => {
            res.setEncoding("utf8");
            const parse = new ParseTransformTwo();
            const writer = new ResultWritableTwo(resolveBody, rejectBody);
            res.pipe(parse).pipe(writer);
        });
    });
}


class HeaderTransformTwo extends Transform {
    constructor(resolveHeader, rejectHeader) {
        super({decodeStrings: false});
        this.resolveHeader = resolveHeader;
        this.rejectHeader = rejectHeader;
        this.headerMatch = null;
    }

    _transform(chunk, encoding, callback) {
        if (!this.headerMatch) {
            this.headerMatch = pagesRegex.exec(chunk);
            if (!!this.headerMatch && (this.headerMatch.length === 3)) {
                this.resolveHeader([
                    Number(this.headerMatch[1]),
                    new Promise((resolveBody, rejectBody) => {
                        this.pipe(
                            new ParseTransformTwo()
                        ).pipe(
                            new ResultWritableTwo(resolveBody, rejectBody)
                        );
                    })
                ]);
                this.push(this.headerMatch[2]);
            }
        } else {
            this.push(chunk);
        }

        callback();
    }
}


class ParseTransformTwo extends Transform {
    constructor() {
        super({decodeStrings: false});
        this.prevTail = '';
    }

    _transform(chunk, encoding, callback) {
        this.prevTail += chunk;
        let match = titleRegex.exec(this.prevTail);
        while (!!match && (match.length === 3)) {
            this.push(match[1]);
            this.prevTail = match[2];
            match = titleRegex.exec(match[2]);
        }

        callback();
    }
}

class ResultWritableTwo extends Writable {
    constructor(resolve, reject) {
        super({decodeStrings: false});
        this.result = new Array(0);
        this.resolve = resolve;
        this.reject = reject;
    }

    _write(chunk, encoding, callback) {
        this.result.push(
            chunk.toString("utf8"));
        callback();
    }

    _final(callback) {
        this.resolve(this.result);
        callback();
    }
}


/*
 * Complete the function below.
 * Use console.log to print the result, you should not return from the function.
 */
function getMovieTitlesThree(substr) {
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
                                new ResultWritableThree(resolveBody, rejectBody)
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
            allPromises[ii] = getAdditionalPageThree(substr, ii);
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


function getAdditionalPageThree(subString, ii) {
    return new Promise((resolveBody, rejectBody) => {
        const prefix = "https://jsonmock.hackerrank.com/api/movies/search/";
        const url = prefix + "?Title=" + subString + "&page=" + (ii + 1);
        https.get(url, res => {
            const parse = JSONStream.parse(['data', true, 'Title']);
            const writer = new ResultWritableThree(resolveBody, rejectBody);
            res.setEncoding("utf8");
            res.pipe(parse).pipe(writer);
        });
    });
}

class ResultWritableThree extends Writable {
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

module.exports.getMovieTitlesOne = getMovieTitlesOne;
module.exports.getMovieTitlesTwo = getMovieTitlesTwo;
module.exports.getMovieTitlesThree = getMovieTitlesThree;

