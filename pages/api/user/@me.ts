// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { jwt_secret_key } from 'config';
import { Jwt, JwtPayload, verify as verifyJWT } from 'jsonwebtoken';
import { User } from 'database/user';

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
    if (Object.hasOwn(methods, method))
        await methods[method as keyof typeof methods](req, res);
}

async function _get(req: NextApiRequest, res: NextApiResponse) {
    const authorization_header = req.headers['authorization'];

    if (typeof authorization_header != 'string') {
        res.status(400).json({ err: 'Bad Request' });
        return;
    }

    const [token_type, token] = authorization_header.split(' ');

    if (token_type != 'Bearer') {
        res.status(400).json({ err: 'Bad Request' });
        return;
    }

    let verified_token: JwtPayload | string;

    try {
        verified_token = verifyJWT(token, jwt_secret_key);
    } catch {
        res.status(401).json({ err: 'Unauthorized' });
        return;
    }

    if (typeof verified_token == 'string') {
        res.status(500).json({ err: 'Internal Server Error' });
        return;
    }

    const user = await User.findOne({
        email: verified_token.email
    }, {
        username: true
    })

    if (!user) {
        res.status(401).json({ err: 'Invalid User' })
        return;
    }

    res.status(200).json({username: user.username});
}

async function _post(req: NextApiRequest, res: NextApiResponse) {
    res.status(500).json({ err: 'Method has not been implemented' });
}

async function _put(req: NextApiRequest, res: NextApiResponse) {
    res.status(500).json({ err: 'Method has not been implemented' });
}

async function _delete(req: NextApiRequest, res: NextApiResponse) {
    res.status(500).json({ err: 'Method has not been implemented' });
}

async function _head(req: NextApiRequest, res: NextApiResponse<any>) {
    res.status(500).json({ err: 'Method has not been implemented' });
}
async function _update(req: NextApiRequest, res: NextApiResponse<any>) {
    res.status(500).json({ err: 'Method has not been implemented' });
}

async function _trace(req: NextApiRequest, res: NextApiResponse<any>) {
    res.status(500).json({ err: 'Method has not been implemented' });
}

async function _options(req: NextApiRequest, res: NextApiResponse) {
    res.status(500).json({ err: 'Method has not been implemented' });
}

