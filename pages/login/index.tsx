import Head from 'next/head'
import styles from '@styles/Home.module.css'
import querystring from 'querystring';
import { generatePrimeSync } from 'crypto';
import { NextPageContext } from 'next';
import { MouseEvent } from 'react';

type ServerProps = NonNullable<Awaited<ReturnType<typeof getServerSideProps>>['props']>;

export async function getServerSideProps({ req }: NextPageContext) {
  const state = Buffer.from(generatePrimeSync(128)).toString('hex');
  const scope = 'user-read-email user-modify-playback-state user-read-playback-state user-read-currently-playing';
  const ip = req?.headers['x-real-ip'];

  if(!ip){
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
          redirect_uri: 'https://feuchtnas.ddns.net/',
          state: state
        })
    }
  };
}

export default function Home({ login_url }: ServerProps) {

  async function saveState(e:MouseEvent<HTMLAnchorElement>){
    e.preventDefault();
    const {state} = querystring.decode(login_url.split('?')[1]);

    const response = await fetch(`/api/state/${state}`, {method:'POST'});

    if(response.status != 200){
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

        <p className={styles.description}>
          <a className={styles.card} onClick={saveState} href={login_url}>
            Login with Spotify
          </a>
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
