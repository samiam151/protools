const fs = require('fs');

let url = "audiostems/chonta/full";
let urls = [];

populateURLS().then(data => {
    fs.writeFile("server/data/chonta-full.json", JSON.stringify({
        "urls": urls
    }, null, 4), (err) => {
        if (err) {
            console.log(err);
            return;
        }
    });
});

function populateURLS() { 
    return new Promise((resolve, reject) => {
        fs.readdir(url, (err, files) => {
            if (err) reject(err);
            files.forEach(file => {
                console.log(file);
                urls.push(file);
            });
            resolve(urls);
        });
    });
}
