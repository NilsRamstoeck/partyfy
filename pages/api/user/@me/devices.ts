// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { User } from 'database/user';
import { authorizeToken } from 'lib/auth';
import { connectToDatabase } from 'lib/mongo';
import { getSpotifyDevices, refreshSpotifyToken } from 'lib/spotify';
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
        }, {
            access_token: true,
            refresh_token: true
        })

        if (!user) {
            res.status(404).json({ err: 'User does not exist' })
            return;
        }
        
        const devices = await getSpotifyDevices(user);

        res.status(200).json(devices);
        return
    } catch (_) {
        res.status(500).json({ err: 'No Connection to Database' })
    }
}

async function _post(req: NextApiRequest, res: NextApiResponse) {
    res.status(500).send('Method has not been implemented');
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

