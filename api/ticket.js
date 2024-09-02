import { json } from 'micro';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { invitationCode } = await json(req);
        if (!invitationCode) {
            res.statusCode = 400;
            res.end('Invitation code is required');
            return;
        }
        try {
            const attendeesPath = path.join('..', 'data', 'attendees.json');
            const attendees = JSON.parse(fs.readFileSync(attendeesPath, 'utf8'));
            const ticket = attendees.find(ticket => ticket.invitationCode === invitationCode);
            res.statusCode = 200;
            res.json(ticket || {});
        } catch (error) {
            console.error('Error fetching ticket:', error);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
}
