"use client";

import { useState } from "react";
import styles from "../styles/Home.module.css";

interface GeolocationData {
  geo?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country_code2?: string;
  };
  zipcode?: string;
  useragent?: {
    name?: string;
    type?: string;
    version?: string;
  };
}

export default function Home() {
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const detectLocation = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/detect");
      const data: GeolocationData = await response.json();
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
