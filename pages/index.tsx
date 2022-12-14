import Head from 'next/head'
import styles from '@styles/Home.module.css'
import querystring from 'querystring';
import { useEffect, useState } from 'react';

export async function getStaticProps() {
  return {
    props: {

    }
  }
}

export default function Home() {

  const [authenticated, setAuthenticated] = useState<boolean>(false);
  useEffect(() => {
    async function fetchData(){

      const {code, state} = querystring.decode(window.location.search.slice(1));
      const token = localStorage.getItem('token');
      
      if((!code || !state) && !token){
        window.location.assign('/login');
        return;
      }

      const response = await fetch(`api/user/auth?code=${code}&state=${state}`)
      if(response.status != 200){
        //ERROR
        return;
      }
      
      const data = await response.json();

      localStorage.setItem('token', data.token);
      setAuthenticated(true);
      if(code && state){
        window.location.assign('/');
      }
    };

    fetchData();
  }, []);

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
