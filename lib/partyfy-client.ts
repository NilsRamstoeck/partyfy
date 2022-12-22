import type { SpotifyDevice } from "./spotify";

export async function runInLoop(toRun: Function, timeout: number): Promise<void> {
    const loop = async () => {
        try {
            await toRun();
            console.log('LOOPED: ' + toRun.name);
            setTimeout(() => loop(), timeout)
        } catch (_) {
            throw new Error('Could not run function in loop');
        }
    }

    return new Promise((_resolve, reject) => {
        try {
            loop();
        } catch (error) {
            reject(error);
        }
    })

}

async function partyfyAPIRequest(url: string, token: string, method: string, body?: Object) {
    return await fetch(url, {
        method,
        headers: {
            Authorization: 'Bearer ' + token
        },
        body: body ? JSON.stringify(body) : null
    })
}

export async function syncQueueWithRoom(token: string, roomId: string) {
    const response = await fetch(`/api/room/${roomId}/sync`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token
        }
    });

    if (response.status != 200) {
        throw new Error('Could not sync Queue')
    }

    const responseData = await response.json();

    dispatchEvent(new CustomEvent('queue-update', { detail: responseData }));
}

export function syncQueueWithRoomLoop(token: string, roomId: string): Promise<void> {
    return runInLoop(async () => {
        try {
            await syncQueueWithRoom(token, roomId);
        } catch (_) {
            throw _
        }
    }, 2000)
}

export async function getAvailableDevices(token: string): Promise<SpotifyDevice[] & { err?: string }> {
    return await (await partyfyAPIRequest('/api/user/@me/devices', token, 'GET')).json();
}