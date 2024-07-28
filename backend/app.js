const express = require('express');
const multer = require('multer');
const cors = require('cors');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');


const app = express();
const PORT = 3001;
let filename = "unchanged";

const allowedOrigins = ['http://localhost:4200', 'https://read.teacherjake.com', 'https://app.teacherjake.com', 'https://purplepeoplesreader.com'];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/var/www/apps/assets');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/webp' && file.mimetype !== 'audio/mpeg') {
            console.log("wrong file type");
            return cb(new Error('File must be a .png, .jpg, .jpeg, .webp, or .mp3'), false);
        }
        filename = file.originalname;
        cb(null, true);
    }
}).single('file');

app.use(cors({
    origin: function (origin, callback) {
        // reject requests with no origin 
        if (!origin) return callback(new Error('No origin provided'), false);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.post('/upload', (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).send({ message: err.message, path: 'failed' });
        }
        if (!req.file) {
            return res.status(400).send({ message: 'Did you forget to attach a file?' });
        }

        const { originalname, mimetype, path: filePath } = req.file;

        if (mimetype === 'audio/mpeg') {
            const tempPath = `/var/www/apps/assets/temp_${originalname}`;
            console.log(`Starting conversion for file: ${filePath}`);
            // Convert the uploaded MP3 file to 48kbps and save to a temporary location
            ffmpeg(filePath)
                .audioQuality(9)
                .audioCodec('libmp3lame')
                .on('end', () => {
                    console.log(`File converted to 48kbps and saved to: ${tempPath}`);
                    
                    // Move the compressed file back to the original file path
                    fs.rename(tempPath, filePath, (err) => {
                        if (err) {
                            console.error(`Error moving compressed file: ${err.message}`);
                            return res.status(500).json({ message: 'Error moving compressed file', path: 'failed' });
                        }

                        console.log(`Compressed file moved back to original path: ${filePath}`);
                        return res.status(200).send({ message: 'Audio File uploaded and converted to 48kbps', path: filePath });
                    });
                })
                .on('error', (err) => {
                    console.error(`Error converting file: ${err.message}`);
                    return res.status(500).json({ message: 'Error converting file', path: 'failed' });
                })
                .on('progress', (progress) => {
                    console.log(`Processing: ${progress.percent}% done`);
                })
                .save(tempPath);
        } else if (mimetype === 'image/webp') {
            const compressedPath = `/var/www/apps/assets/webp/${originalname}`;
            const thumbnailFilename = `${path.parse(originalname).name}_thumbnail.png`;
            const thumbnailPath = path.join('/var/www/apps/assets/thumbnails', thumbnailFilename);

            try {
                // Compress the WebP image
                await sharp(filePath)
                    .webp({ quality: 50 })
                    .toFile(compressedPath);

                // Move the compressed file back to the original file path
                fs.rename(compressedPath, filePath, async (err) => {
                    if (err) {
                        console.error(`Error moving compressed file: ${err.message}`);
                        return res.status(500).json({ message: 'Error moving compressed file', path: 'failed' });
                    }

                    console.log(`Compressed file moved back to original path: ${filePath}`);

                    // Generate a thumbnail
                    await sharp(filePath)
                        .resize(null, 64)
                        .toFile(thumbnailPath);

                    res.status(200).send({ message: 'File uploaded, compressed, and thumbnail generated', path: filePath });
                });
            } catch (err) {
                res.status(500).send({ message: 'Error processing image' });
            }
        }
        else {
            const thumbnailFilename = `${path.parse(originalname).name}_thumbnail.png`;
            const thumbnailPath = path.join('/var/www/apps/assets/thumbnails', thumbnailFilename);

            try {
                await sharp(filePath)
                    .resize(null, 64)
                    .toFile(thumbnailPath);

                res.status(200).send({ message: 'File uploaded and thumbnail generated', path: filename });
            } catch (err) {
                res.status(500).send({ message: 'Error processing image' });
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
