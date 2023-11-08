const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = 3001
let filename = "unchanged";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'backend/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
            console.log("wrong file type");
            return cb(new Error('File must be a .png, .jpg, or .jpeg'), false);
        }
        cb(null, true);
    }

}).single('file');

app.use(cors({ origin: 'http://localhost:4200' }));

app.post('/upload', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message })
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Did you forget to attach a file?' });
        }
        res.send({ message: `File Uploaded` });
    })
});


app.get('/hello', (req, res) => {
    res.send('Hello World from File Uploader!');
});

app.listen(3001, () => {
    console.log(`Server listening on port ${PORT}`);
});