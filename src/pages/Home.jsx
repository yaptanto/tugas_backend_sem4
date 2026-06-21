import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Animations.css';

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setGames(json.data);
        } else {
          setError(json.message);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <main className="home-main">
        <div className="home-index-container">
          <div className="home-banner">
            <img src="/asset/banner.png" alt="banner" width="100%" />
          </div>
          <div className="home-audiowide-regular">GAMES</div>
          <div className="home-game-container">
            {loading ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', width: '100%', padding: '40px 0' }}>
                Memuat game...
              </p>
            ) : error ? (
              <p style={{ color: '#ef4444', textAlign: 'center', width: '100%', padding: '40px 0' }}>
                Gagal memuat game: {error}
              </p>
            ) : games.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', width: '100%', padding: '40px 0' }}>
                Belum ada game tersedia
              </p>
            ) : (
              games.map(game => (
                <Link key={game.id} to={`/game/${game.slug}`} className="home-gamecard">
                  {game.logo ? (
                    <img src={game.logo} alt={game.name} className="home-gameicon" onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                  ) : null}
                  <div className="home-gameicon-placeholder" style={{ display: game.logo ? 'none' : 'flex' }}>
                    <span className="home-gameicon-letter">{game.name.charAt(0)}</span>
                  </div>
                  <p className="home-gametitle">{game.name}</p>
                </Link>
              ))
            )}
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
