// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import 'lib/mongo';
import type { NextApiRequest, NextApiResponse } from 'next'
import querystring from 'querystring';

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

    if (!req.query.code) {
        res.status(400).send('No code');
        return;
    }

    const token_url = 'https://accounts.spotify.com/api/token?' +
        querystring.stringify({
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: 'https://feuchtnas.ddns.net/api/user/auth',
        })

    const { client_id, client_secret } = await import('config');

    const response = await fetch(token_url, {
        headers: {
            Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST'
    });

    try {
        const response_data = await response.json();

        //do stuff

        res.status(200).json({token:'t'});
    } catch (_) {
        res.status(500).send(await response.text());
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

