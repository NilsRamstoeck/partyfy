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

export async function syncHostQueueWithRoom(token: string, roomId: string) {
    const response = await fetch(`/api/room/${roomId}/sync`);
    if (response.status != 200) {
        throw new Error('Could not sync Queue')
    }
}

export function syncHostQueueWithRoomLoop(token: string, roomId: string): Promise<void> {
    return runInLoop(async () => {
        try {
            await syncHostQueueWithRoom(token, roomId);
        } catch (_) {
            throw _
        }
    }, 2000)
}