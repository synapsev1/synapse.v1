import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { invitationCode } = req.body;
        if (!invitationCode) {
            res.statusCode = 400;
            res.end('Invitation code is required');
            return;
        }
        try {
            const attendeesPath = path.join('..', 'data', 'attendees.json');
            const attendees = JSON.parse(fs.readFileSync(attendeesPath, 'utf8'));
            const ticket = attendees.find(ticket => ticket.invitationCode === invitationCode);
            res.statusCode = ticket ? 200 : 404;
            res.json({ valid: !!ticket, data: ticket || null });
        } catch (error) {
            console.error('Error validating invitation code:', error);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
}
