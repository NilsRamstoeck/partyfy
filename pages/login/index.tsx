import Head from 'next/head'
import styles from '@styles/Login.module.css'
import querystring from 'querystring';
import { generatePrimeSync } from 'crypto';
import { NextPageContext } from 'next';
import { MouseEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { redirect_uri } from 'config';

type Props = NonNullable<Awaited<ReturnType<typeof getServerSideProps>>['props']>;

export async function getServerSideProps({ req }: NextPageContext) {
  const state = Buffer.from(generatePrimeSync(128)).toString('hex');
  const scope = 'user-read-email user-modify-playback-state user-read-playback-state user-read-currently-playing';
  const ip = req?.headers['x-real-ip'];

  if (!ip) {
    return {
      redirect: {
        destination: '/login'
      }
    }
  }

  return {
    props: {
      login_url: 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: (await import('config')).client_id,
          scope: scope,
          redirect_uri,
          state: state
        })
    }
  };
}

async function getJWT(code: string, state: string) {
  const response = await fetch(`api/user/auth?code=${code}&state=${state}`)
  if (response.status != 200) {
    throw new Error('Could not get JWT');
  }
  const data = await response.json();
  return data.token as string;
}

export default function Login({ login_url }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    
    const { code, state } = router.query;
    const token = localStorage.getItem('token');

    if (token) {
      router.push('/');
      return;
    };

    if (typeof code != 'string' || typeof state != 'string') {
      console.log('LOGIN LOADED');
      dispatchEvent(new Event('loaded'));
      return;
    }

    getJWT(code, state)
      .then((token) => {
        localStorage.setItem('token', token);
        router.push('/');
      })
      .catch((e) => {
        console.error(e);
      })
      

  }, [router]);

  async function saveState(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const { state } = querystring.decode(login_url.split('?')[1]);

    const response = await fetch(`/api/state/${state}`, { method: 'POST' });

    if (response.status != 200) {
      //ERROR
    }

    window.location.assign(login_url);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Partyfy</title>
        <meta name="description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Partyfy
        </h1>

        <div className={styles.content}>
          <a className={styles.card} onClick={saveState} href={login_url}>
            Login with Spotify
          </a>
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
