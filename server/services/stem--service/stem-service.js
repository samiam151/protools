var AWS = require("aws-sdk");
const fs = require("fs");
const configs = require("./config").configs;

// Setup AWS connection
let config = new AWS.Config();
config.accessKeyId = configs.credentials.accessKeyID;
config.secretAccessKey = configs.credentials.secretAccessKey;
var s3 = new AWS.S3(config);
const logPrefix = /^log/;


let StemService = {};
StemService.getStemList = function(bucket){
    console.log(bucket);
    return new Promise((resolve, reject) => {
        s3.listObjects({
            Bucket: bucket,
            MaxKeys: 1000
        } ,(err, data) => {
            if (err) {reject(err);}
            else {
                resolve(data.Contents.filter(field => {
                    return !(logPrefix.test(field.Key));
                })
                .map(field => field.Key));
            }

        });
    });
}

StemService.getStemObject = function(bucketName, key) {
    return new Promise((resolve, reject) => {
        var params = { Bucket: bucketName, Key: key };
        s3.getObject(params, function (err, data) {
            if (err) {
                reject(err.stack);
            }
            resolve(data);
        });
    });
}

if (require.main === module){
    // StemService.getStemList("bulhtriostems").then(data => console.log(data));
    StemService.getStemObject("bulhtriostems", "01_KickInside.wav").then(data => console.log(data));
}
else {
    exports.StemService = StemService;
}