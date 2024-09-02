import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { invitationCode } = req.body;

        if (!invitationCode) return res.status(400).send('Invitation code is required');

        const attendeesPath = path.join(process.cwd(), 'data', 'attendees.json');
        let attendees = JSON.parse(fs.readFileSync(attendeesPath, 'utf8'));

        const ticket = attendees.find(ticket => ticket.invitationCode === invitationCode);

        if (ticket) {
            res.json({ valid: true, data: ticket });
        } else {
            res.json({ valid: false });
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
}