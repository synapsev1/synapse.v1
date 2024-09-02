import { json, redirect } from 'micro';
import { parse } from 'url';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin_kushal123';

export default async function handler(req, res) {
    const { username, password } = await json(req);

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        redirect(res, '/dashboard.html');
    } else {
        res.statusCode = 401;
        res.end('Invalid credentials');
    }
}