import {CheckCircle2, Sparkles} from "lucide-react";
import {Link, NavLink} from "react-router-dom";
import {useTranslation} from "react-i18next";
import GoogleLoginButton from "./GoogleLoginButton.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import MusicPlayer from "./MusicPlayer.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";

function AppShell({children}) {
  const {t} = useTranslation();

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t("nav.skipToContent")}
      </a>
      <header className="topbar">
        <Link className="brand" to="/" aria-label={t("app.title")}>
          <CheckCircle2 size={28} aria-hidden="true" />
          <span>{t("app.title")}</span>
        </Link>

        <nav className="topbar__nav" aria-label={t("nav.primary")}>
          <NavLink to="/">{t("nav.todos")}</NavLink>
          <NavLink className="topbar__demo-link" to="/demo">
            <Sparkles size={16} aria-hidden="true" />
            <span>{t("nav.demo")}</span>
          </NavLink>
          <NavLink to="/insights">{t("nav.insights")}</NavLink>
        </nav>

        <div className="topbar__actions">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <GoogleLoginButton />
        </div>
      </header>

      <main className="app-shell__main" id="main-content">
        {children}
      </main>

      <aside className="app-shell__music" aria-label={t("music.label")}>
        <MusicPlayer />
      </aside>
    </div>
  );
}

export default AppShell;
