import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";
import styles from '@styles/Loader.module.css';

export function Loader() {

    const [loaderColor, setLoaderColor] = useState<string>('');
    const [loaderSize, setLoaderSize] = useState<number>(0);
  
    useEffect(() => {
      setLoaderColor(getComputedStyle(document.body).getPropertyValue('--clr-primary'));
      setLoaderSize(window.visualViewport.width / 5);
    }, []);

    return (
        <div className={styles.container}>
            <HashLoader
                color={loaderColor}
                size={loaderSize}
            ></HashLoader>
        </div>
    )
}