import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react';
import { Loader } from 'components/Loader';

export default function App({ Component, pageProps }: AppProps) {
  const [loaderColor, setLoaderColor] = useState<string>('');
  const [loaderSize, setLoaderSize] = useState<number>(0);

  useEffect(() => {
    setLoaderColor(getComputedStyle(document.body).getPropertyValue('--clr-primary'));
    setLoaderSize(window.visualViewport.width / 5);
  }, []);

  return true ?
    <Loader></Loader> :
    <Component {...pageProps} />
}
