import { json } from 'micro';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const attendeesPath = path.join('..', 'data', 'attendees.json');
            const attendees = fs.existsSync(attendeesPath) ? JSON.parse(fs.readFileSync(attendeesPath, 'utf8')) : [];
            res.statusCode = 200;
            res.json(attendees);
        } catch (error) {
            console.error('Error fetching attendees:', error);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
}
