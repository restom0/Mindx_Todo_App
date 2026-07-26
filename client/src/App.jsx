import {lazy, Suspense, useEffect} from "react";
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import AppShell from "./components/AppShell.jsx";
import Skeleton from "./components/Skeleton.jsx";
import {selectLanguage, selectTheme, setLanguage} from "./features/settings/settingsSlice.js";
import {SERVER_DOWN_EVENT, SERVER_DOWN_PATH} from "./utils/serverDown.js";

const TodoPage = lazy(() => import("./pages/TodoPage.jsx"));
const InsightsPage = lazy(() => import("./pages/InsightsPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));
const ServerDownPage = lazy(() => import("./pages/ServerDownPage.jsx"));
const getStoredLanguage = () => {
  try {
    return localStorage.getItem("mindx-language");
  } catch {
    return null;
  }
};

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useSelector(selectTheme);
  const language = useSelector(selectLanguage);
  const {i18n} = useTranslation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [i18n, language]);

  useEffect(() => {
    const browserLanguage = globalThis.navigator?.language?.split("-")[0];
    const supported = ["en", "ca", "fr", "de", "es", "it"];
    const savedLanguage = getStoredLanguage();

    if (!savedLanguage && supported.includes(browserLanguage)) {
      dispatch(setLanguage(browserLanguage));
    }
  }, [dispatch]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleServerDown = () => {
      if (location.pathname !== SERVER_DOWN_PATH) {
        navigate(SERVER_DOWN_PATH);
      }
    };

    window.addEventListener(SERVER_DOWN_EVENT, handleServerDown);
    return () => window.removeEventListener(SERVER_DOWN_EVENT, handleServerDown);
  }, [location.pathname, navigate]);

  return (
    <AppShell>
      <Suspense fallback={<Skeleton rows={6} />}>
        <Routes>
          <Route path="/" element={<TodoPage />} />
          <Route path="/demo" element={<TodoPage demoMode />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path={SERVER_DOWN_PATH} element={<ServerDownPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

export default App;
