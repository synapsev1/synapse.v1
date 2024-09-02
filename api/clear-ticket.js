import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const attendeesPath = path.join(process.cwd(), 'data', 'attendees.json');
        const ticketsDir = path.join(process.cwd(), 'data', 'tickets');

        fs.writeFileSync(attendeesPath, JSON.stringify([], null, 2));
        fs.readdirSync(ticketsDir).forEach(file => fs.unlinkSync(path.join(ticketsDir, file)));

        res.redirect('/manage-tickets.html');
    } else {
        res.status(405).send('Method Not Allowed');
    }
}