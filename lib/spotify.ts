import { client_id, client_secret } from 'config';
import querystring from 'querystring';

interface SpotifyUserData {
    display_name: string,
    email: string,
    external_urls: {
        spotify: string
    },
    followers: {
        href: string | null,
        total: number
    },
    href: string,
    id: string,
    images: Array<string>,
    type: string,
    uri: string
}

interface SpotifyToken {
    token_type: string,
    expires_in: number,
    access_token: string,
    refresh_token: string,
    scope: string
}

export async function getSpotifyUserInfo(token: string): Promise<SpotifyUserData | null> {
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'GET'
    });

    try {
        return await response.json();
    } catch (e_) {
        return null;
    }
}

export async function getSpotifyAccessToken(code: string): Promise<SpotifyToken | null> {
    const spotify_token_url = 'https://accounts.spotify.com/api/token?' +
        querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://feuchtnas.ddns.net/',
        })


    const response = await fetch(spotify_token_url, {
        headers: {
            Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST'
    });

    try {
        return await response.json();
    } catch (e_) {
        return null;
    }
}