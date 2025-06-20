"use strict"
/**
 * @author Arpit Nakarani
 * @description Server and REST API config
 */
import * as bodyParser from 'body-parser';
import express, { Request, Response } from 'express';  
import http from 'http';
import cors from 'cors'
import { mongooseConnection} from './database'
import * as packageInfo from '../package.json'
import { router } from './Routes'
import { productRoutes } from './Routes/product';
import { categoryRoutes } from './Routes/category';
import { cmsRoutes } from './Routes/cms';
import { runSeeds } from './database/seed';
import { config } from '../config';

const app = express();


app.use(cors())
app.use(mongooseConnection)
app.use(bodyParser.json({ limit: '200mb' }))
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))
const health = (req, res) => {
    return res.status(200).json({
        message: `Sahjanand Server is Running, Server health is green`,
        app: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,   
        author: packageInfo.author,
        license: packageInfo.license
    })
}
const bad_gateway = (req, res) => { return res.status(502).json({ status: 502, message: "Sahjanand Backend API Bad Gateway" }) }

app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req, res) => {
    res.send('Server is running ');
});
app.use(router)

// Run database seeds
runSeeds().then(() => {
    console.log('Database seeding completed');
}).catch(error => {
    console.error('Error during database seeding:', error);
});

let server = new http.Server(app);
export default server;