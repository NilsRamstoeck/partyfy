import { client_id, client_secret, redirect_uri } from 'config';
import { IRoom, RoomQueue, Song } from 'database/room';
import { IUser } from 'database/user';
import { Document } from 'mongoose';
import querystring from 'querystring';

export interface SpotifyUserData {
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

export interface SpotifyToken {
    token_type: string,
    expires_in: number,
    access_token: string,
    refresh_token: string,
    scope: string
}

export interface SpotifyPlaybackState {
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
    item: SpotifyTrack,
    currently_playing_type: string,
    actions: { disallows: { pausing: boolean, skipping_prev: boolean } },
    is_playing: boolean
}

export interface SpotifyDevice {
    id: string,
    is_active: boolean,
    is_private_session: boolean,
    is_restricted: boolean,
    name: string,
    type: string,
    volume_percent: number
}

export interface SpotifyTrack {
    album: {
        album_type: string,
        artists: any[],
        available_markets: any[],
        external_urls: any[],
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
    artists: Object[],
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
        body: body ? JSON.stringify(body) : null
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

export async function syncRoomWithSpotify(user: IUser, room: Document & IRoom): Promise<boolean> {
    const spotifyQueue = await getSpotifyQueue(user);
    const currentSong = await getCurrentSong(user);

    if (!spotifyQueue || !currentSong) {
        room.queue = [];
        room.current_song = null;
        await room.save();
        return false;
    }

    room.queue = spotifyQueue.map(({ uri, artists, name, album }) => ({ uri, artists, name, album: album.name }));
    room.current_song = {
        track: {
            album: currentSong.album.name,
            artists: currentSong.artists,
            name: currentSong.name,
            uri: currentSong.uri
        },
        progress: currentSong.progress,
        is_playing: currentSong.is_playing
    }

    // console.log('ROOM ' + room.id + ' UPDATED');
    console.log(room.current_song);


    await room.save();
    return true;
}

export async function syncSpotifyWithRoom(room: IRoom) {
    room.members.forEach(async member => {
        if (member.email == room.host.email) return;
        const currentSongRoom = room.current_song;

        if (!currentSongRoom || !currentSongRoom.is_playing) {
            pauseCurrentSong(member);
            return;
        }

        const currentSongMember = await getCurrentSong(member);

        if (!currentSongMember || currentSongMember.uri != currentSongRoom.track.uri) {

        }
    });
    //Get current track and position of host
    //if within the first or last 5 seconds of track, return
    //get current track and position of client
    //if within the first or last 5 seconds of track, return
    //if song is correct and progress is out of sync <= 2 seconds, return
    //if song is correct but out of sync, update progress to be back in sync and return 

}

export function getSpotifyUserInfo(access_token: string): Promise<SpotifyUserData | null> {
    return spotifyAPIRequest('https://api.spotify.com/v1/me', 'GET', access_token);
}

export function getSpotifyPlaybackState({ access_token }: IUser): Promise<SpotifyPlaybackState | null> {
    return spotifyAPIRequest('https://api.spotify.com/v1/me/player', 'GET', access_token);
}

export async function getCurrentSong({ access_token }: IUser) {
    const responseData = await spotifyAPIRequest('https://api.spotify.com/v1/me/player/currently_playing', 'GET', access_token);
    if (!responseData.item) return null;
    const track = {
        ...(responseData.item as SpotifyTrack),
        progress: (responseData.progress_ms as number),
        is_playing: (responseData.is_playing as boolean)
    };

    return track;
}

export async function getSpotifyDevices({ access_token }: IUser): Promise<SpotifyDevice[] | null> {
    return (await spotifyAPIRequest('https://api.spotify.com/v1/me/player/devices', 'GET', access_token)).devices;
}

export async function getSpotifyQueue({ access_token }: IUser): Promise<SpotifyTrack[] | null> {
    return (await spotifyAPIRequest('https://api.spotify.com/v1/me/player/queue', 'GET', access_token)).queue;
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

export function setSpotifyPlayback({ access_token }: IUser, queue: RoomQueue) {
    return spotifyAPIRequest('https://api.spotify.com/v1/me/player/play', 'PUT', access_token, {
        uris: queue.map(song => song.name)
    });
}

export function setCurrentSong({ access_token }: IUser, song:string, position:number) {
    return spotifyAPIRequest('https://api.spotify.com/v1/me/player/play', 'PUT', access_token, {
        uris: [song],
        position_ms: position
    });
}