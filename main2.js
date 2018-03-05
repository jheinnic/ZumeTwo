const https = require("https");
const stream = require("stream");
const Writable = stream.Writable;
const Transform = stream.Transform;
const pagesRegex = /"total_pages":([0-9]*),(.*)$/;
const titleRegex = /"Title":"([^"]*)",(.*)$/;


/*
 * Complete the function below.
 * Use console.log to print the result, you should not return from the function.
 */
function getMovieTitles(subString) {
    return new Promise((resolveHeader, rejectHeader) => {
        const prefix = "https://jsonmock.hackerrank.com/api/movies/search/";
        const url = prefix + "?Title=" + subString + "&page=1";
        https.get(url, res => {
            res.setEncoding("utf8");
            res.pipe(new HeaderTransform(resolveHeader, rejectHeader));
        });
    }).then(valuePair => {
        const [pagesExpected, promiseOne] = valuePair;
        const allPromises = new Array(pagesExpected);

        allPromises[0] = promiseOne;
        for (let ii = 1; ii < pagesExpected; ii++) {
            allPromises[ii] = getAdditionalPage(subString, ii);
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

function getAdditionalPage(subString, ii) {
    return new Promise((resolveBody, rejectBody) => {
        const prefix = "https://jsonmock.hackerrank.com/api/movies/search/";
        const url = prefix + "?Title=" + subString + "&page=" + (ii + 1);
        https.get(url, res => {
            res.setEncoding("utf8");
            const parse = new ParseTransform();
            const writer = new ResultWritable(resolveBody, rejectBody);
            res.pipe(parse).pipe(writer);
        });
    });
}


class HeaderTransform extends Transform {
    constructor(resolveHeader, rejectHeader) {
        super({decodeStrings: false});
        this.resolveHeader = resolveHeader;
        this.rejectHeader = rejectHeader;
        this.headerMatch = null;
    }

    _transform(chunk, encoding, callback) {
        if (! this.headerMatch) {
            this.headerMatch = pagesRegex.exec(chunk);
            if(!!this.headerMatch && (this.headerMatch.length === 3)) {
                this.resolveHeader([
                    Number(this.headerMatch[1]),
                    new Promise((resolveBody, rejectBody) => {
                        this.pipe(
                            new ParseTransform()
                        ).pipe(
                            new ResultWritable(resolveBody, rejectBody)
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


class ParseTransform extends Transform {
    constructor() {
        super({decodeStrings: false});
        this.prevTail = '';
    }

    _transform(chunk, encoding, callback) {
        this.prevTail += chunk;
        let match = titleRegex.exec(this.prevTail);
        while(!!match && (match.length === 3)) {
            this.push(match[1]);
            this.prevTail = match[2];
            match = titleRegex.exec(match[2]);
        }

        callback();
    }
}

class ResultWritable extends Writable {
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

getMovieTitles('water');


