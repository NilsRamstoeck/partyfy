import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react';
import { Loader } from 'components/Loader';

export default function App({ Component, pageProps }: AppProps) {

  const [childLoaded, setchildLoaded] = useState(false);
  const [selfLoaded, setSelfLoaded] = useState(false);

  useEffect(() => {
    addEventListener('loaded', () => {
      setchildLoaded(true);
    });
    setSelfLoaded(true);
  }, []);

  useEffect(() => {
    setchildLoaded(false);
  }, [Component]);

  return <div>
    {!childLoaded && <Loader />}
    {selfLoaded && <Component {...pageProps} />}
  </div>
}
