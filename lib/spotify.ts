import { client_id, client_secret, redirect_uri } from 'config';
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

async function spotifyAPIRequest(input: RequestInfo | URL, init?: RequestInit) {
    const response = await fetch(input, init);
    try {
        const responseData = await response.json();

        if (response.status != 200) {
            throw new Error('Error from Spotify: ' + JSON.stringify(responseData));
        }

        return responseData;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export function getSpotifyUserInfo(token: string): Promise<SpotifyUserData | null> {
    return spotifyAPIRequest('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'GET'
    }
    );
}

export function getSpotifyAccessToken(code: string): Promise<SpotifyToken | null> {
    const spotify_token_url = 'https://accounts.spotify.com/api/token?' +
        querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri,
        })

    return spotifyAPIRequest(spotify_token_url, {
        headers: {
            Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST'
    });
}