import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Animations.css';

const Home = () => {
  return (
    <>
      <main className="home-main">
        <div className="home-index-container">
          <div className="home-banner">
            <img src="/asset/banner.png" alt="banner" width="100%" />
          </div>
          <div className="home-audiowide-regular">GAMES</div>
          <div className="home-game-container">
            <Link to="/game/mlbb" className="home-gamecard">
              <img src="/asset/logo_game/mlbb.png" alt="" width="180" className="home-gameicon" />
              <p className="home-gametitle">Mobile Legends: Bang Bang</p>
            </Link>
            <Link to="#" className="home-gamecard">
              <img src="/asset/logo_game/roblox.png" alt="" width="180" className="home-gameicon" />
              <div className="home-gametitle">Roblox Gift Card </div>
            </Link>
            <Link to="/game/valorant" className="home-gamecard">
              <img src="/asset/logo_game/valorant.png" alt="" width="180" className="home-gameicon" />
              <div className="home-gametitle">valorant</div>
            </Link>
            <Link to="#" className="home-gamecard">
              <img src="/asset/logo_game/coc.png" alt="" width="180" className="home-gameicon" />
              <div className="home-gametitle">Clash Of Clans</div>
            </Link>
          </div>

          <div className="home-banner home-video-border">
            <video autoPlay muted loop width="100%">
              <source src="/asset/MLBB 9th Anniversary _ Global Player-Created Film _Your Day_ _ Mobile Legends_ Bang Bang.mp4" type="video/mp4" />
              Browser Anda tidak mendukung tag video.
            </video>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
