"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import "../styles/globals.css";

const ThreeCanvas = dynamic(() => import("@/components/ThreeCanvas"), { ssr: false });

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEarthReady, setIsEarthReady] = useState(false);

  const handleLoadComplete = () => {
    setIsLoaded(true);
  };

  const handleEarthReady = () => {
    setIsEarthReady(true);
    const container = document.getElementById("container");
    if (container) {
      const boxText = document.createElement("div");
      boxText.id = "box-text";
      boxText.className = "box-text";
      boxText.innerHTML = `
        <div class="box-text-inner">
          <h1>SakuTech blog</h1>
          <p>
            This is webGL created by SakeTech blog.
            <br />
            Stack technology uses Next.js14 and Three.js.
          </p>
        </div>
      `;
      container.appendChild(boxText);

      // 少し遅延させてクラスを追加
      setTimeout(() => {
        boxText.classList.add('visible');
      }, 100); // 100msの遅延
    }
  };

  return (
    <>
      <div id="progress-bar">
        <div id="progress"></div>
      </div>
      <div id="container">
        <ThreeCanvas onLoadComplete={handleLoadComplete} onEarthReady={handleEarthReady} />
        <div id="veil"></div>
      </div>
    </>
  );
};

export default Home;