const express = require('express');
const watch = require('node-watch');
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const multer  = require('multer')
const FormData = require('form-data');
const nodePath = require('path');
const { success, error } = require('consola');

const upload = multer({ dest: 'uploads/' })
const app = express();
const PORT = process.env.PORT;

// Watch
const syncOutDir = process.env.SYNC_OUT_DIR;
const syncInDir = process.env.SYNC_IN_DIR;

watch(syncOutDir, { recursive: true }, async (evt, name) => {
    
    const file = fs.createReadStream(name);

    const form = new FormData();
    
    form.append("file", file);

    const response = await fetch(`${process.env.REMOTE_URL}/files`, 
    { 
        method: 'POST', 
        body: form
    })
    fs.unlinkSync(name);
})

app.post('/files', upload.single('file'), function (req, res, next) {
    const { originalname, path } = req.file;
    const file = fs.readFileSync(path);
    // write to "in" folder
    fs.writeFileSync(nodePath.join(syncInDir, originalname), file);
    fs.unlinkSync(path); // Remove file from "out" folder
    res.status(200);
    res.send('Success!')
});

// Starting server function
const startApp = () => {
    app.listen(PORT, () => success({ badge: true, message: `Drop Files Microservice running on port: ${PORT}`}));
};

startApp();