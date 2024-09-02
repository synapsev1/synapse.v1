import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin_kushal123';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const form = new IncomingForm();
        form.parse(req, (err, fields) => {
            if (err) return res.status(500).send('Internal Server Error');
            const { username, password } = fields;
            if (username === ADMIN_USER && password === ADMIN_PASS) {
                res.writeHead(302, { Location: '/dashboard.html' });
                res.end();
            } else {
                res.status(401).send('Invalid credentials');
            }
        });
    } else {
        res.status(405).send('Method Not Allowed');
    }
}