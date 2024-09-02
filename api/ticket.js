import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method === 'GET') {
        const { invitationCode } = req.query;

        if (!invitationCode) return res.status(400).send('Invitation code is required');

        const attendeesPath = path.join(process.cwd(), 'data', 'attendees.json');
        const attendees = JSON.parse(fs.readFileSync(attendeesPath, 'utf8'));

        const ticket = attendees.find(ticket => ticket.invitationCode === invitationCode);

        if (ticket) {
            res.json(ticket);
        } else {
            res.status(404).send('Ticket not found');
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
}