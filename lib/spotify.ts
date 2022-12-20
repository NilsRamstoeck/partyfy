import { client_id, client_secret, redirect_uri } from 'config';
import { IUser } from 'database/user';
import { Document } from 'mongoose';
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

interface SpotifyPlaybackState {
    device: {
        id: string,
        is_active: boolean,
        is_private_session: boolean,
        is_restricted: boolean,
        name: string,
        type: string,
        volume_percent: number
    },
    shuffle_state: boolean,
    repeat_state: string,
    timestamp: number,
    context: {
        external_urls: {
            spotify: string
        },
        href: string,
        type: string,
        uri: string
    },
    progress_ms: number,
    item: {
        album: {
            album_type: string,
            artists: [any],
            available_markets: [any],
            external_urls: [any],
            href: string,
            id: string,
            images: any,
            name: string,
            release_date: string,
            release_date_precision: string,
            total_tracks: number,
            type: string,
            uri: string
        },
        artists: [[Object]],
        disc_number: number,
        duration_ms: number,
        explicit: boolean,
        external_ids: { isrc: string },
        external_urls: {
            spotify: string
        },
        href: string,
        id: string,
        is_local: boolean,
        name: string,
        popularity: number,
        preview_url: string,
        track_number: number,
        type: string,
        uri: string
    },
    currently_playing_type: string,
    actions: { disallows: { pausing: boolean, skipping_prev: boolean } },
    is_playing: boolean
}

interface SpotifyDevice {
    id: string,
    is_active: boolean,
    is_private_session: boolean,
    is_restricted: boolean,
    name: string,
    type: string,
    volume_percent: number
}

export async function getSpotifyAccessToken(code: string): Promise<SpotifyToken | null> {
    const spotifyTokenUrl = 'https://accounts.spotify.com/api/token?' +
        querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri,
        })

    const response = await fetch(spotifyTokenUrl, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(client_id + ':' + client_secret).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

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

export async function refreshSpotifyToken(user: Document & IUser) {
    const spotifyTokenUrl = 'https://accounts.spotify.com/api/token?' +
        querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: user.refresh_token
        })

    const response = await fetch(spotifyTokenUrl, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(client_id + ':' + client_secret).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    try {
        const responseData = await response.json();

        if (response.status != 200) {
            throw new Error('Error from Spotify: ' + JSON.stringify(responseData));
        }

        user.access_token = responseData.access_token;
        await user.save();

        console.log(responseData);

    } catch (e) {
        console.log(e);
    }
}

async function spotifyAPIRequest(url: string, method: string, access_token: string, body?: Object) {

    const response = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: body?JSON.stringify(body):null
    });

    const responseText = await response.text();

    try {
        if (response.status == 204) return null;

        if (response.status != 200) {
            throw new Error('Error from Spotify: ' + responseText);
        }

        const responseData = JSON.parse(responseText);

        return responseData;
    } catch (e) {
        console.log(e);
        console.log(responseText);
        return null;
    }
}

export function getSpotifyUserInfo(access_token: string): Promise<SpotifyUserData | null> {
    return spotifyAPIRequest('https://api.spotify.com/v1/me', 'GET', access_token);
}

export function getSpotifyPlaybackState({ access_token }: IUser): Promise<SpotifyPlaybackState | null> {
    return spotifyAPIRequest('https://api.spotify.com/v1/me/player', 'GET', access_token);
}

export async function getSpotifyDevices({ access_token }: IUser): Promise<SpotifyDevice[] | null> {
    return (await spotifyAPIRequest('https://api.spotify.com/v1/me/player/devices', 'GET', access_token)).devices;
}

export function activatePlaybackDevice({ access_token }: IUser, device: SpotifyDevice) {
    return spotifyAPIRequest('https://api.spotify.com/v1/me/player', 'PUT', access_token, {
        device_ids: [device.id],
    });
}

export function pauseCurrentSong({ access_token }: IUser): Promise<void> {
    return spotifyAPIRequest('https://api.spotify.com/v1/me/player/pause', 'PUT', access_token);
}

export function playCurrentSong({ access_token }: IUser): Promise<void> {
    return spotifyAPIRequest('https://api.spotify.com/v1/me/player/play', 'PUT', access_token);
}

export function setCurrentSong({ access_token }: IUser) {


}