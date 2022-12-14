// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Room } from 'database/room';
import { User } from 'database/user';
import { authorizeToken } from 'lib/auth';
import { connectToDatabase } from 'lib/mongo';
import type { NextApiRequest, NextApiResponse } from 'next'

const methods = {
    GET: (req: NextApiRequest, res: NextApiResponse) => _get(req, res),
    HEAD: (req: NextApiRequest, res: NextApiResponse) => _head(req, res),
    POST: (req: NextApiRequest, res: NextApiResponse) => _post(req, res),
    PUT: (req: NextApiRequest, res: NextApiResponse) => _put(req, res),
    DELETE: (req: NextApiRequest, res: NextApiResponse) => _delete(req, res),
    UPDATE: (req: NextApiRequest, res: NextApiResponse) => _update(req, res),
    OPTIONS: (req: NextApiRequest, res: NextApiResponse) => _options(req, res),
    TRACE: (req: NextApiRequest, res: NextApiResponse) => _trace(req, res),
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const method = req.method ?? 'GET';
    connectToDatabase();
    if (Object.hasOwn(methods, method))
        await methods[method as keyof typeof methods](req, res);
}

async function _get(req: NextApiRequest, res: NextApiResponse) {
    const authorizationHeader = req.headers['authorization'];
    const { id: roomId } = req.query;

    if (typeof roomId != 'string') {
        res.status(400).json({ err: 'Bad Request' });
        return;
    }

    if (!authorizationHeader) {
        res.status(401).json({ err: 'No authorization provided' });
        return;
    }

    const { isValid, payload } = authorizeToken(authorizationHeader);

    if (!isValid || !payload) {
        res.status(401).json({ err: 'Invalid Token' });
        return;
    }

    try {
        const user = await User.findOne({
            email: payload.email
        }, { room: true })
            .populate('room');

        if (!user) {
            res.status(401).json({ err: 'User does not exist' })
            return;
        }

        const room = await Room.findOne({
            id: roomId
        }, { members: true, host: true })
            .populate('members')
            .populate('host');

        if (!room) {
            res.status(404).json({ err: 'Room does not exist' })
            return;
        }

        if (!user.room || user.room.id != roomId) {
            res.status(403).json({ err: 'User is not currently in this room' })
            return;
        }

        res.status(200).json({
            members: room.members.map(user => user.username),
            is_host: payload.email == room.host.email,
            host_name: room.host.username
        });
        return;
    } catch (_) {
        res.status(500).json({ err: 'No Connection to Database' })
    }
}

async function _post(req: NextApiRequest, res: NextApiResponse) {
    const authorizationHeader = req.headers['authorization'];
    const { id: roomId } = req.query;

    if (typeof roomId != 'string') {
        res.status(400).json({ err: 'Bad Request' });
        return;
    }

    if (!authorizationHeader) {
        res.status(401).json({ err: 'No authorization provided' });
        return;
    }

    const { isValid, payload } = authorizeToken(authorizationHeader);

    if (!isValid || !payload) {
        res.status(401).json({ err: 'Invalid Token' });
        return;
    }

    try {
        const user = await User.findOne({
            email: payload.email
        }, { room: true })
            .populate('room');

        if (!user) {
            res.status(401).json({ err: 'User does not exist' })
            return;
        }

        const room = await Room.findOne({
            id: roomId
        }, { members: true })
            .populate('members');

        if (!room) {
            res.status(404).json({ err: 'Room does not exist' })
            return;
        }

        if (user.room) {
            //@ts-ignore
            user.room.members.pull(user);
        }

        user.room = room;
        //@ts-ignore
        room.members.addToSet(user);

        room.save();
        user.save();
        res.status(200).json({ result: 'success' });
        return;
    } catch (_) {
        res.status(500).json({ err: 'No Connection to Database' })
    }
}

async function _put(req: NextApiRequest, res: NextApiResponse) {
    res.status(500).send('Method has not been implemented');
}

async function _delete(req: NextApiRequest, res: NextApiResponse) {
    res.status(500).send('Method has not been implemented');
}

async function _head(req: NextApiRequest, res: NextApiResponse<any>) {
    res.status(500).send('Method has not been implemented');
}
async function _update(req: NextApiRequest, res: NextApiResponse<any>) {
    res.status(500).send('Method has not been implemented');
}

async function _trace(req: NextApiRequest, res: NextApiResponse<any>) {
    res.status(500).send('Method has not been implemented');
}

async function _options(req: NextApiRequest, res: NextApiResponse) {
    res.status(500).send('Method has not been implemented');
}

