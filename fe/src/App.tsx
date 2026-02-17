import { createContext } from "react";
import { Outlet } from "react-router-dom";
import Loader from "./components/Loader";
import SignIn from "./components/SignIn";
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
      <Outlet />
    </CurrentUserContext.Provider>
  );
};

export default App;
