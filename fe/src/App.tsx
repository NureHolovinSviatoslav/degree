import { createContext } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import Loader from "./components/Loader";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import { Nav } from "./routes/Nav";
import { useCurrentUserQuery } from "./features/useCurrentUserQuery";
import { User } from "./types/User";

export const CurrentUserContext = createContext<User>({} as User);

const App = () => {
  const query = useCurrentUserQuery();
  const location = useLocation();

  if (query.isLoading) {
    return <Loader />;
  }
  if (!query.data) {
    if (location.pathname === "/register") {
      return <SignUp />;
    }
    return <SignIn />;
  }

  if (location.pathname === "/register" || location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  return (
    <CurrentUserContext.Provider value={query.data}>
      <TooltipProvider>
        <div className="flex h-screen">
          <Nav />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </TooltipProvider>
    </CurrentUserContext.Provider>
  );
};

export default App;
