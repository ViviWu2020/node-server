import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    const {method, url: path} = request;
    if (method === 'POST') {
        response.statusCode = 403;
        response.end();
        return;
    }
    const {pathname} = url.parse(path);
    let filename = pathname.substr(1);
    if (filename === '') {
        filename = 'index.html';
    }
    fs.readFile(p.resolve(publicDir, filename), (err, data) => {
        if (err) {
            if (err.errno === -4058) {
                response.statusCode = 404;
                fs.readFile(p.resolve(publicDir, '404.html'), (err, data) => {
                    response.end(data);
                });
            } else if (err.errno === -4068) {
                response.writeHead(300, {'Content-Type': 'text/plain;charset=utf-8'});
                response.end('无权访问目录');
            } else {
                response.writeHead(500, {'Content-Type': 'text/plain;charset=utf-8'});
                response.end('服务器繁忙，请稍后重试');
            }
        } else {
            response.setHeader('Cache-Control','public, max-age=31536000')
            response.end(data);
        }
    });
});

server.listen(8888);