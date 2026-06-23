import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Animations.css';

const Home = () => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, categoriesRes] = await Promise.all([
          fetch('/api/games'),
          fetch('/api/categories'),
        ]);

        const gamesJson = await gamesRes.json();
        const categoriesJson = await categoriesRes.json();

        if (gamesJson.success) {
          setGames(gamesJson.data);
        } else {
          setError(gamesJson.message);
        }

        if (categoriesJson.success && Array.isArray(categoriesJson.data)) {
          setCategories(categoriesJson.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* Bootstrap carousel manual init (SAFARI/SPA fix) */
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || typeof window.bootstrap === 'undefined') return;
    const carousel = new window.bootstrap.Carousel(el, {
      interval: 5000,
      pause: 'hover',
      wrap: true,
    });
    return () => { carousel.dispose(); };
  }, []);

  const trendingGames = games.filter(g => g.badge);
  const filteredGames =
    activeCategory === 'all'
      ? games
      : games.filter(g => g.category && g.category.slug === activeCategory);

  /* ── shared render helpers ────────────────── */
  const renderGameCard = (game, extraClass = '') => (
    <Link
      key={game.id}
      to={`/game/${game.slug}`}
      className={`home-game-card${extraClass ? ' ' + extraClass : ''}`}
    >
      {game.badge && (
        <span
          className={`home-game-card-badge home-game-card-badge--${game.badge.toLowerCase()}`}
        >
          {game.badge}
        </span>
      )}
      <div className="home-game-card-logo-wrap">
        {game.logo ? (
          <img
            src={game.logo}
            alt={game.name}
            className="home-game-card-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              const ph = e.target.parentElement?.querySelector(
                '.home-game-card-logo-placeholder'
              );
              if (ph) ph.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="home-game-card-logo-placeholder"
          style={{ display: game.logo ? 'none' : 'flex' }}
        >
          <span className="home-game-card-logo-letter">
            {game.name.charAt(0)}
          </span>
        </div>
      </div>
      <p className="home-game-card-title">{game.name}</p>
    </Link>
  );

  /* ── carousel slides ──────────────────────── */
  const heroSlides = [
    {
      title: 'Top Up Game Terpercaya',
      subtitle:
        'Murah, Cepat, dan Aman. Harga termurah untuk ribuan game favoritmu.',
      cta: 'Lihat Game',
      href: '#all-games',
    },
    {
      title: 'Harga Termurah & Promo',
      subtitle:
        'Dapatkan harga spesial setiap hari. Cashback 1% untuk setiap transaksi!',
      cta: 'Trending Sekarang',
      href: '#trending',
    },
    {
      title: 'Instant Delivery 24/7',
      subtitle:
        'Pemesanan diproses otomatis dan dikirim dalam hitungan detik. Kapanpun, di manapun.',
      cta: 'Kenapa RAST-7?',
      href: '#why-rast7',
    },
  ];

  /* ── why-rast-7 items ─────────────────────── */
  const whyItems = [
    {
      icon: 'bi-lightning-fill',
      title: 'Instant Delivery',
      text: 'Top up langsung masuk ke akun game kamu dalam hitungan detik setelah pembayaran berhasil.',
    },
    {
      icon: 'bi-shield-check',
      title: '100% Aman & Terpercaya',
      text: 'Transaksi dienkripsi dan menggunakan metode pembayaran resmi. Data kamu selalu aman.',
    },
    {
      icon: 'bi-coin',
      title: 'Cashback 1% + Promo',
      text: 'Dapatkan cashback 1% setiap transaksi dan nikmati promo spesial setiap minggunya.',
    },
  ];

  return (
    <>
      <div className="home-bg-layer" aria-hidden="true" />

      <main className="home-main">
        <div className="home-index-container">
          {/* =============================================
              1.  HERO CAROUSEL
              ============================================= */}
          <section className="home-hero-carousel" aria-label="Promo Slideshow">
            <div
              id="homeHeroCarousel"
              className="carousel slide"
              ref={carouselRef}
            >
              {/* indicators */}
              <div className="carousel-indicators">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    data-bs-target="#homeHeroCarousel"
                    data-bs-slide-to={i}
                    className={i === 0 ? 'active' : ''}
                    aria-current={i === 0 ? 'true' : undefined}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* slides */}
              <div className="carousel-inner">
                {heroSlides.map((slide, i) => (
                  <div
                    key={i}
                    className={`carousel-item${i === 0 ? ' active' : ''}`}
                  >
                    <div
                      className="home-hero-slide"
                      style={{ backgroundImage: 'url(/asset/banner.png)' }}
                    >
                      <div className="home-hero-overlay" />
                      <div className="home-hero-content">
                        <h1 className="home-hero-title">{slide.title}</h1>
                        <p className="home-hero-subtitle">{slide.subtitle}</p>
                        <a href={slide.href} className="home-hero-cta">
                          {slide.cta}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* controls */}
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#homeHeroCarousel"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true" />
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#homeHeroCarousel"
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon" aria-hidden="true" />
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </section>

          {/* ────── Glow Divider ────── */}
          <div className="home-section-divider" />

          {/* =============================================
              2.  TRUST STRIP
              ============================================= */}
          <section className="home-trust-strip">
            <div className="home-trust-item">
              <i className="bi bi-credit-card" />
              <span>Visa</span>
            </div>
            <div className="home-trust-item">
              <i className="bi bi-paypal" />
              <span>PayPal</span>
            </div>
            <div className="home-trust-item">
              <i className="bi bi-wallet2" />
              <span>GoPay</span>
            </div>
            <div className="home-trust-item">
              <i className="bi bi-wallet2" />
              <span>DANA</span>
            </div>
            <div className="home-trust-item">
              <i className="bi bi-qr-code" />
              <span>QRIS</span>
            </div>

            <span className="home-trust-strip-divider" />

            <div className="home-trust-badge">
              <i className="bi bi-lightning-fill" />
              <span>24/7 Instant Delivery</span>
            </div>
          </section>

          {/* ────── Glow Divider ────── */}
          <div className="home-section-divider" />

          {/* =============================================
              3.  TRENDING GAMES
              ============================================= */}
          <section id="trending">
            <h2 className="home-section-title">
              <span className="home-section-title-icon">🔥</span>
              Trending Games
            </h2>

            {loading ? (
              <p className="home-status-text">Memuat game...</p>
            ) : trendingGames.length === 0 ? (
              <p className="home-status-text">Belum ada game trending</p>
            ) : (
              <div className="home-trending-scroll">
                {trendingGames.map(game => renderGameCard(game, 'home-trending-card'))}
              </div>
            )}
          </section>

          {/* ────── Glow Divider ────── */}
          <div className="home-section-divider" />

          {/* =============================================
              4.  ALL GAMES  +  FILTER TABS
              ============================================= */}
          <section id="all-games">
            <h2 className="home-section-title">
              <span className="home-section-title-icon">🎮</span>
              All Games
            </h2>

            {!loading && categories.length > 0 && (
              <div className="home-filter-bar">
                <button
                  className={`home-filter-btn${activeCategory === 'all' ? ' home-filter-btn--active' : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`home-filter-btn${activeCategory === cat.slug ? ' home-filter-btn--active' : ''}`}
                    onClick={() => setActiveCategory(cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            <div className="home-game-container">
              {loading ? (
                <p className="home-status-text" style={{ gridColumn: '1 / -1' }}>
                  Memuat game...
                </p>
              ) : error ? (
                <p className="home-status-text home-status-text--error" style={{ gridColumn: '1 / -1' }}>
                  Gagal memuat game: {error}
                </p>
              ) : filteredGames.length === 0 ? (
                <p className="home-status-text" style={{ gridColumn: '1 / -1' }}>
                  Belum ada game tersedia
                </p>
              ) : (
                filteredGames.map(game => renderGameCard(game))
              )}
            </div>
          </section>

          {/* ────── Glow Divider ────── */}
          <div className="home-section-divider" />

          {/* =============================================
              5.  WHY RAST-7
              ============================================= */}
          <section id="why-rast7" className="home-why-section">
            <h2 className="home-section-title">
              <span className="home-section-title-icon">⚡</span>
              Why RAST-7?
            </h2>

            <div className="home-why-grid">
              {/* Video / Visual */}
              <div className="home-why-video-wrap">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/asset/banner.png"
                >
                  <source
                    src="/asset/MLBB 9th Anniversary _ Global Player-Created Film _Your Day_ _ Mobile Legends_ Bang Bang.mp4"
                    type="video/mp4"
                  />
                  <div className="home-why-video-fallback">
                    <i className="bi bi-play-circle" />
                    <p>Browser Anda tidak mendukung tag video.</p>
                  </div>
                </video>
              </div>

              {/* Bullet points */}
              <div className="home-why-card">
                {whyItems.map((item, i) => (
                  <div key={i} className="home-why-item">
                    <div className="home-why-item-icon">
                      <i className={`bi ${item.icon}`} />
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ────── Final Glow Divider ────── */}
          <div className="home-section-divider" />
        </div>
      </main>
    </>
  );
};

export default Home;
