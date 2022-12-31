import Head from 'next/head'
import styles from '@styles/Room.module.css'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { syncQueueWithRoomLoop } from 'lib/partyfy-client';
import type { SpotifyDevice } from 'lib/spotify';
import { SpotifyDevices } from 'components/SpotifyDevices';

export default function Room() {
  const router = useRouter();
  const [members, setMembers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [host, setHost] = useState<string>('');
  const [token, setToken] = useState<string>('');

  const { id: roomId } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof roomId != 'string') return;


    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setToken(token);

    addEventListener('queue-update', ((e: CustomEvent) => console.log(e.detail)) as EventListener);

    (async function () {

      const postRoomRespose = await fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        }
      });

      const getRoomResponse = await fetch(`/api/room/${roomId}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        }
      })

      if (getRoomResponse.status == 401 || postRoomRespose.status == 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (getRoomResponse.status != 200 || postRoomRespose.status != 200) {
        // router.push('/');
        return;
      }

      const getRoomResponseData = await getRoomResponse.json();

      setMembers(getRoomResponseData.members);
      setIsHost(getRoomResponseData.is_host);
      setHost(getRoomResponseData.host_name);
      if (getRoomResponseData.is_host) {
        console.log('START LOOP');
        syncQueueWithRoomLoop(token, roomId)
          .catch(() => console.error('Could not sync, aborting loop'));
      }
      dispatchEvent(new Event('loaded'));
    })();

  }, [router]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Partyfy</title>
        <meta name="description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.headline}>Welcome to {host}'s Party!</h1>
        <p className="card">
          {members}
        </p>
        {/* <div className="card">
          {token!=''?<SpotifyDevices
            token={token}
          ></SpotifyDevices>:''}
        </div> */}
      </main>

      <footer className={styles.footer}>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          Partyfy &#169; 2022 Nils Ramstöck
        </a>
      </footer>

    </div>
  )
}

function HostOptions() {
  return (
    <div>HOST OPTIONS</div>
  );
}