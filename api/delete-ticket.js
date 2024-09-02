import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { invitationCode } = req.query;
        if (!invitationCode) {
            res.statusCode = 400;
            res.end('Invitation code is required');
            return;
        }
        try {
            const attendeesPath = path.join('data', 'attendees.json');
            let attendees = JSON.parse(fs.readFileSync(attendeesPath, 'utf8'));
            attendees = attendees.filter(ticket => ticket.invitationCode !== invitationCode);
            fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));
            
            const ticketPath = path.join('data', 'tickets', `${invitationCode}.png`);
            if (fs.existsSync(ticketPath)) {
                fs.unlinkSync(ticketPath);
            }

            res.statusCode = 200;
            res.end('Ticket deleted');
        } catch (error) {
            console.error('Error deleting ticket:', error);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
}
