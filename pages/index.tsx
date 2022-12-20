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

      const response = await fetch('/api/user/@me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        }
      })

      if (response.status != 200) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
        // throw new Error('Invalid Token');
      }

      const responseData = await response.json();

      if (responseData.room_id != '') {
        router.push(`/room/${responseData.room_id}`);
        return;
      }

      setUsername(responseData.username);
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
