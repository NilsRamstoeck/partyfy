import Head from 'next/head'
import styles from '@styles/Room.module.css'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Room() {
  const router = useRouter();
  const [members, setMembers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);

  const { id: roomId } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

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
      console.log(members);
      dispatchEvent(new Event('loaded'));
    })();

    //TESTING ONLY
    fetch(`/api/room/${roomId}`, {
      method: 'OPTIONS',
      headers: {
        Authorization: 'Bearer ' + token,
      }
    })

  }, [router]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Partyfy</title>
        <meta name="description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <p className="card">
          {members}
        </p>

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

function HostOptions(){
  return (
    <div>HOST OPTIONS</div>
  );
}