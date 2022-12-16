import Head from 'next/head'
import styles from '@styles/Home.module.css'
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { HashLoader } from 'react-spinners';

export async function getStaticProps() {
  return {
    props: {

    }
  }
}
export default function Home() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {

    if (!router.isReady) return;
    if (authenticated) return;

    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/user/@me', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      }
    })
      .then(response => {
        if (response.status == 200) return response;
        console.log('NOT AUTHORIZED');
        throw new Error('Invalid Token')
      })
      .then(response => response.json())
      .then(data => setUsername(data.username))
      .then(_ => setTimeout(() => dispatchEvent(new Event('loaded')), 1000))
      // .then(_ => dispatchEvent(new Event('loaded')))
      .then(_ => console.log('HOME LOADED'))
      .catch(_ => console.error(_));

  }, [router, authenticated]);

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
          <span className={styles.card}>
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
