import Head from 'next/head'
import styles from '@styles/Home.module.css'
import querystring from 'querystring';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export async function getStaticProps() {
  return {
    props: {

    }
  }
}
export default function Home() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (authenticated) return;

    const token = localStorage.getItem('token');

    if(!token){
      router.push('/login');
      return;
    }

  }, [router, authenticated]);

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
