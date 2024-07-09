const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = 3001
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
    origin: function(origin, callback){
      // reject requests with no origin 
      if(!origin) return callback(new Error('No origin provided'), false);
      if(allowedOrigins.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
}));

app.post('/upload', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message, path:'failed' })
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Did you forget to attach a file?' });
        }
        res.send({ message: `File Uploaded to`, path: `apps/assets/${filename}` });
    })
});

app.get('/hello', (req, res) => {
    res.send('Hello World from File Uploader!');
});

app.listen(3001, () => {
    console.log(`Server listening on port ${PORT}`);
});