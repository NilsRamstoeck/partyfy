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