import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const attendeesPath = path.join('..', 'data', 'attendees.json');
            fs.writeFileSync(attendeesPath, JSON.stringify([], null, 2));
            const ticketsDir = path.join('data', 'tickets');
            fs.readdirSync(ticketsDir).forEach(file => fs.unlinkSync(path.join(ticketsDir, file)));
            res.statusCode = 200;
            res.end('Tickets cleared');
        } catch (error) {
            console.error('Error clearing tickets:', error);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
}
