"use client";

import { useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const detectLocation = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/detect");
      const data = await response.json();
      setGeoData(data);
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      alert("Failed to fetch geolocation data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>IP Geolocation Detector</h1>

        <button className={styles.button} onClick={detectLocation} disabled={loading}>
          {loading ? "Detecting..." : "Detect My Location"}
        </button>

        {geoData && (
          <div className={styles.result}>
            <h2>Geolocation Results</h2>
            <pre>{JSON.stringify(geoData, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}
