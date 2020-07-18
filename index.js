const express = require("express");
const fs = require("fs")
const path = require("path");
const app = express();
const isHttps = process.argv.length > 4;

function showUsage() {
    console.log("Usage: node index <port> <serve_path> " +
        "[ssl_cert_path] [ssl_key_path]");
}

if (process.argv.length < 4) {
    showUsage();
    return;
}

if (process.argv.length == 5) {
    showUsage();
    console.log("If ssl_cert_path is given then " +
        "ssl_key_pat must also be given");
    return;
}

const config = {
    port: process.argv[2],
    distPath: null,
    certPath: null,
    keypath: null
};

function setConfig(key, value) {
    if (value.startsWith("/")) {
        // Absolute path.
        config[key] = value;
        return;
    }

    config[key] = path.resolve(__dirname, value);
}

setConfig("distPath", process.argv[3]);
app.use(express.static(config.distPath));

if (!isHttps) {
    require("http").createServer(app).listen(config.port);
    console.log(`http server listening on ${config.port}`);
    return;
}

setConfig("certPath", process.argv[4]);
setConfig("keyPath", process.argv[5]);

const credentials = {
    key: fs.readFileSync(config.keyPath, "utf8"),
    cert: fs.readFileSync(config.certPath, "utf8")
};

require("https").createServer(credentials, app).listen(config.port);
console.log(`https server listening on ${config.port}`);
