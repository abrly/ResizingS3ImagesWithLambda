
const AWS = require('aws-sdk'); 
var jimp = require("jimp");

const s3 = new AWS.S3(); 

const DEST_BUCKET = process.env.DEST_BKT_PATH;


async function imgResize(data) {
    const buffer = Buffer.from(data);
    const res = await jimp.read(buffer);   
    return await res.resize(200,200);
}
  
  
exports.handler = async (event) => {

    let myFileOps = event.Records.map( async(record) => {

        let bucket = record.s3.bucket.name;
        let filename = record.s3.object.key;
        
        var params = {
            Bucket: bucket,
            Key: filename
        };

        let inputData = await s3.getObject(params).promise();

        const img = await imgResize(inputData.Body); 
        
        let resizedBuffer;
        
        await img.getBuffer(jimp.MIME_JPEG, (err, buffer) => {

            resizedBuffer = buffer;
           
          });
       
          let targetFilename = filename;
                
          var params = {
              Bucket: DEST_BUCKET,
              Key: targetFilename,
              Body: resizedBuffer,
              ContentType: 'image/jpeg'
          };

      await s3.putObject(params).promise();

    });

    await Promise.all(myFileOps);
    console.log("done");
    return "done";
}