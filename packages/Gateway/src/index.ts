import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import winston from 'winston';
import { ccipGateway } from './http/ccipGateway';
import { getSigner } from './utils/getSigner';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());

(async () => {
    app.locals.logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    app.locals.config = {
        spamProtection: process.env.SPAM_PROTECTION === 'true',
    };

    const signer = getSigner();

    app.use('/', ccipGateway(signer));
})();
const port = process.env.PORT || '8081';
server.listen(port, () => {
    app.locals.logger.info(
        '[Server] listening at port ' + port + ' and dir ' + __dirname,
    );
});
