import Head from 'next/head'
import styles from '@styles/Home.module.css'
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Room() {
  const router = useRouter();

  const { id: roomId } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`/api/room/${roomId}`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
      }
    })

  }, [router, roomId]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Partyfy</title>
        <meta name="description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
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
