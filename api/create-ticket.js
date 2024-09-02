import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';
import multer from 'multer';
import { promisify } from 'util';
import { json } from 'micro';

// Register the custom font
registerFont(path.resolve('public', 'fonts', 'Expansiva bold.otf'), { family: 'ExpansivaBold' });
registerFont(path.resolve('public', 'fonts', 'Expansiva.otf'), { family: 'Expansiva' });
registerFont(path.resolve('public', 'fonts', 'Expansiva italic.otf'), { family: 'ExpansivaItalic' });

const upload = multer({ storage: multer.memoryStorage() }).single('profilePicture');

function generateInvitationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req, res) {
    await new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });

    const { name, date, time, purchasedFrom, place, isVIP } = req.body;
    const invitationCode = generateInvitationCode();
    const profilePicture = req.file ? `data:image/png;base64,${req.file.buffer.toString('base64')}` : '';

    try {
        const ticket = {
            name,
            date,
            time,
            purchasedFrom,
            place,
            invitationCode,
            isVIP: isVIP === 'on',
            status: 'Paid',
            profilePicture,
            alreadyEntered: false
        };

        const attendeesPath = path.join('data', 'attendees.json');
        let attendees = [];
        if (fs.existsSync(attendeesPath)) {
            attendees = JSON.parse(fs.readFileSync(attendeesPath, 'utf8'));
        }
        attendees.push(ticket);
        fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));

        const canvasWidth = 1080;
        const canvasHeight = 1080;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        const backgroundImagePath = isVIP === 'on' 
            ? path.join('public', 'images', 'vipbg.png') 
            : path.join('public', 'images', 'bg.jpg');

        const background = await loadImage(backgroundImagePath);
        ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

        const logo = await loadImage(path.join('public', 'images', 'logo.png'));
        ctx.drawImage(logo, 30, 30, 150, 150);

        if (profilePicture) {
            const profileImg = await loadImage(profilePicture);
            const profilePicSize = 200;
            ctx.save();
            ctx.beginPath();
            ctx.rect(canvasWidth - profilePicSize - 30, 210, profilePicSize, profilePicSize);
            ctx.clip();
            ctx.drawImage(profileImg, canvasWidth - profilePicSize - 30, 210, profilePicSize, profilePicSize);
            ctx.restore();
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(canvasWidth - 170, 60, 150, 50);
        ctx.fillStyle = '#000000';
        ctx.font = 'normal 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(invitationCode, canvasWidth - 95, 85);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'normal 32px ExpansivaBold';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;

        const textStartX = 30;
        const textStartY = 200;
        const lineHeight = 50;

        ctx.fillText(`Name: ${name}`, textStartX, textStartY);
        ctx.fillText(`Date: ${date}`, textStartX, textStartY + lineHeight);
        ctx.fillText(`Time: ${time}`, textStartX, textStartY + 2 * lineHeight);
        ctx.fillText(`Given By: ${purchasedFrom}`, textStartX, textStartY + 3 * lineHeight);
        ctx.fillText(`Place: ${place}`, textStartX, textStartY + 4 * lineHeight);
        ctx.fillText('Status: Paid', textStartX, textStartY + 5 * lineHeight);
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = isVIP === 'on' ? '#FFD700' : '#FFFFFF';
        ctx.fillText(isVIP === 'on' ? 'VIP Ticket' : 'Regular Ticket', textStartX, textStartY + 6 * lineHeight);
        ctx.font = 'bold 27px ExpansivaItalic';
        ctx.textAlign = 'center';
        ctx.fillText("Ya'll better pull up, we'll be pleased", canvasWidth / 2, canvasHeight - 62);

        const ticketPath = path.join('data', 'tickets', `${invitationCode}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(ticketPath, buffer);

        res.redirect('/manage-tickets.html');
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.statusCode = 500;
        res.end('Internal Server Error');
    }
}
