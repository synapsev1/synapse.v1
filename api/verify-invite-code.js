import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { inviteCode } = req.body;
        if (!inviteCode) {
            res.statusCode = 400;
            res.end('Invitation code is required');
            return;
        }
        try {
            const attendeesPath = path.join('data', 'attendees.json');
            const attendees = JSON.parse(fs.readFileSync(attendeesPath, 'utf8'));
            const ticket = attendees.find(ticket => ticket.invitationCode === inviteCode);
            if (ticket) {
                ticket.alreadyEntered = true;
                fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));
                res.statusCode = 200;
                res.json({ valid: true, data: ticket });
            } else {
                res.statusCode = 404;
                res.json({ valid: false });
            }
        } catch (error) {
            console.error('Error verifying invite code:', error);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
}
