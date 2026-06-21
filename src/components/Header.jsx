import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPages, setFilteredPages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarKey, setAvatarKey] = useState(() => Date.now());
  const [games, setGames] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(json => {
        if (json.success) setGames(json.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const loadUserData = () => {
      try {
        // ⚡ Ganti localStorage ke sessionStorage
        const authToken = sessionStorage.getItem("authToken");
        const currentUser = sessionStorage.getItem("currentUser");

        if (authToken && currentUser) {
          const user = JSON.parse(currentUser);
          setUserData(user);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserData(null);
      }
    };

    loadUserData();

    // ❌ Hapus listener 'storage' karena sessionStorage tidak men-support event ini
    // Tetap pertahankan custom event untuk komunikasi antar komponen
    const handleUserLoggedIn = () => {
      console.log("User logged in event received");
      loadUserData();
    };

    const handleUserLoggedOut = () => {
      console.log("User logged out event received");
      setUserData(null);
    };

    const handleUserDataUpdated = (e) => {
      console.log("User data updated event received", e.detail);
      if (e.detail) {
        setUserData(e.detail);
      } else {
        // Jika event tanpa detail, reload dari sessionStorage
        loadUserData();
        setAvatarKey(Date.now()); // ⭐ trigger re-mount gambar
      }
    };

    window.addEventListener("userLoggedIn", handleUserLoggedIn);
    window.addEventListener("userLoggedOut", handleUserLoggedOut);
    window.addEventListener("userDataUpdated", handleUserDataUpdated);

    return () => {
      window.removeEventListener("userLoggedIn", handleUserLoggedIn);
      window.removeEventListener("userLoggedOut", handleUserLoggedOut);
      window.removeEventListener("userDataUpdated", handleUserDataUpdated);
    };
  }, []);

  const topupPages = games.map(g => ({
    name: g.name,
    path: `/game/${g.slug}`,
    image: g.logo || '/asset/logo_game/diamond.png',
  }));

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    setErrorMessage("");

    if (query.trim() === "") {
      setShowDropdown(false);
      setFilteredPages([]);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = topupPages.filter(
        (page) => page.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredPages(filtered);
      setShowDropdown(true);
    }
  };

  const handleSelectGame = (path) => {
    navigate(path);
    setSearchTerm("");
    setShowDropdown(false);
    setErrorMessage("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredPages.length > 0) {
      handleSelectGame(filteredPages[0].path);
    } else if (searchTerm.trim() !== "") {
      setErrorMessage(`Waduh, game "${searchTerm}" belum tersedia.`);
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  // ⚡ Bantu fungsi untuk mendapatkan src avatar yang benar
  const getAvatarSrc = () => {
  if (userData?.avatar) {
    return userData.avatar; // sudah berupa endpoint seperti "/api/avatar/12345"
  }
  return "/asset/user.png";
};

  return (
    <header>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <img src="/asset/logo.png" alt="icon_game" width="120px" />
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/promo">
                  Promo
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/contact">
                  Contact
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/login">
                  Login
                </Link>
              </li>
            </ul>

            <form
              className="d-flex position-relative"
              role="search"
              onSubmit={handleSearchSubmit}
            >
              <input
                className="form-control me-2"
                type="search"
                placeholder="Cari Game Anda"
                value={searchTerm}
                onChange={handleInputChange}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              <button
                className="btn btn-outline-primary"
                style={{ marginRight: "10px" }}
                type="submit"
              >
                Search
              </button>

              {showDropdown && (
                <div
                  className="dropdown-menu show position-absolute w-100 mt-1 shadow-sm"
                  style={{
                    top: "100%",
                    left: 0,
                    zIndex: 1000,
                    padding: "0.5rem 0",
                  }}
                >
                  {filteredPages.length > 0 ? (
                    filteredPages.map((game, index) => (
                      <button
                        key={index}
                        type="button"
                        className="dropdown-item d-flex align-items-center py-2"
                        onClick={() => handleSelectGame(game.path)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={game.image}
                          alt={game.name}
                          style={{
                            width: "30px",
                            height: "30px",
                            objectFit: "cover",
                            borderRadius: "5px",
                            marginRight: "10px",
                          }}
                          onError={(e) => (e.target.src = "/asset/logo.png")}
                        />
                        <span style={{ fontWeight: "500" }}>{game.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="dropdown-item text-muted disabled">
                      Game tidak ditemukan
                    </div>
                  )}
                </div>
              )}

              {errorMessage && (
                <div
                  className="position-absolute shadow"
                  style={{
                    top: "115%",
                    left: 0,
                    width: "calc(100% - 85px)",
                    zIndex: 1050,
                    background: "linear-gradient(135deg, #ff0055, #a100ff)",
                    color: "white",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 15px rgba(255, 0, 85, 0.4)",
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                  {errorMessage}
                </div>
              )}
            </form>

            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    key={avatarKey}
                    src={getAvatarSrc()}  // ⚡ Gunakan fungsi pembantu
                    alt="profile"
                    className="header-profile-icon"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginRight: "8px",
                      border: userData ? "2px solid #00f2ff" : "none",
                    }}
                    onError={(e) => (e.target.src = "/asset/user.png")} // fallback jika error
                  />
                  <span
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontWeight: "500",
                      color: userData ? "#00f2ff" : "#fff",
                    }}
                  >
                    {userData?.username || "GUEST"}
                  </span>
                  {userData && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "0.7rem",
                        background: "linear-gradient(135deg, #7000ff, #a100ff)",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      Lvl {userData.level || 1}
                    </span>
                  )}
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      View Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/history">
                      History
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/point">
                      Point
                    </Link>
                  </li>
                  {userData?.isAdmin && (
                    <li><hr className="dropdown-divider" /></li>
                  )}
                  {userData?.isAdmin && (
                    <li>
                      <Link className="dropdown-item" to="/admin" style={{ color: '#6366f1', fontWeight: 600 }}>
                        ◆ Admin Panel
                      </Link>
                    </li>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;