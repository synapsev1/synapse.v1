import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { invitationCode } = req.body;

        if (!invitationCode) return res.status(400).send('Invitation code is required');

        const attendeesPath = path.join(process.cwd(), 'data', 'attendees.json');
        let attendees = JSON.parse(fs.readFileSync(attendeesPath, 'utf8'));

        const ticketPath = path.join(process.cwd(), 'data', 'tickets', `${invitationCode}.png`);
        if (fs.existsSync(ticketPath)) {
            fs.unlinkSync(ticketPath);
        }

        attendees = attendees.filter(ticket => ticket.invitationCode !== invitationCode);
        fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));

        res.redirect('/manage-tickets.html');
    } else {
        res.status(405).send('Method Not Allowed');
    }
}