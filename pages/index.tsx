import Head from 'next/head'
import styles from '@styles/Home.module.css'
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const token = localStorage.getItem('token');

  async function createRoom(e: MouseEvent<HTMLParagraphElement>) {
    const response = await fetch('/api/room', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token
      }
    })

    if (response.status != 201) {
      //TODO: Handle error
      return;
    }

    const { room_id } = await response.json();

    router.push(`room/${room_id}`);
  }

  useEffect(() => {
    if (!router.isReady) return;
    if (username != '') return;

    if (!token) {
      router.push('/login');
      return;
    }
    async function getData() {
      const roomResponsePromise = fetch('/api/room', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        }
      });

      const usernameResponsePromise = fetch('/api/user/@me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        }
      })

      const roomResponse = await roomResponsePromise;
      const usernameResponse = await usernameResponsePromise;

      if (roomResponse.status == 200) {
        const roomResponseData = await roomResponse.json();
        router.push(`/room/${roomResponseData.room_id}`);
        return;
      }

      if (usernameResponse.status != 200) {
        console.log(usernameResponse);
        localStorage.removeItem('token');
        // router.push('/login');

        throw new Error('Invalid Token');
      }

      const usernameResponseData = await usernameResponse.json();
      setUsername(usernameResponseData.username);
      setTimeout(() => dispatchEvent(new Event('loaded')), 1000);
    }

    getData();
  }, [router, token, username]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Partyfy</title>
        <meta name="description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Hello, {username}
        </h1>

        <div className={styles.content}>
          <span className={styles.card} onClick={createRoom}>
            Create Room
          </span>
        </div>
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
