import { createContext } from "react";
import { Outlet } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import Loader from "./components/Loader";
import SignIn from "./components/SignIn";
import { Nav } from "./routes/Nav";
import { useCurrentUserQuery } from "./features/useCurrentUserQuery";
import { User } from "./types/User";

export const CurrentUserContext = createContext<User>({} as User);

const App = () => {
  const query = useCurrentUserQuery();

  if (query.isLoading) {
    return <Loader />;
  }
  if (!query.data) {
    return <SignIn />;
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
