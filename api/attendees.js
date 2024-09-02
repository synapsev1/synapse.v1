import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method === 'GET') {
        const attendeesPath = path.join(process.cwd(), 'data', 'attendees.json');
        const attendees = JSON.parse(fs.readFileSync(attendeesPath, 'utf8'));
        res.json(attendees);
    } else {
        res.status(405).send('Method Not Allowed');
    }
}