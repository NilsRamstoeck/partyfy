// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { State } from 'database/state';
import { User } from 'database/user';
import 'lib/mongo';
import { getSpotifyAccessToken, getSpotifyUserInfo } from 'lib/spotify';
import type { NextApiRequest, NextApiResponse } from 'next'
import {sign as signJWT} from 'jsonwebtoken';
import { jwt_secret_key } from 'config';

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
    const { code, state } = req.query;

    if (typeof code != 'string' || typeof state != 'string') {
        res.status(400).send('Bad Request');
        return;
    }

    const state_document = await State.findOne({ state: state });

    if (state_document?.state != state) {
        res.status(403).send('Forbidden');
        return;
    }

    state_document.delete();

    const spotify_token = await getSpotifyAccessToken(code);

    if (!spotify_token) {
        res.status(500).send('Could not get token from Spotify');
        return;
    }
    
    const {access_token, refresh_token, expires_in} = spotify_token;
    const user_info = await getSpotifyUserInfo(access_token);

    if (!user_info) {
        res.status(500).send('Could not retrieve user info');
        return;
    }

    const {email, display_name:username } = user_info;

    if(!await User.exists({email})){
        User.create({
            username,
            email,
            access_token,
            refresh_token,
            expires_in
        })
    } else {
        User.findOneAndUpdate({email}, {
            username,
            access_token,
            refresh_token,
            expires_in
        });
    }
        
    const token = signJWT({email}, jwt_secret_key);

    res.status(200).json({token});
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

