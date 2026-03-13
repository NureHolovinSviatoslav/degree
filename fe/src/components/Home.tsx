import { useContext } from "react";

import { CurrentUserContext } from "../App";

const Home = () => {
  const user = useContext(CurrentUserContext);

  return (
    <div>
      Вітаємо, <b>{user.username}</b>! Оберіть сторінку для перегляду в меню
      зверху ^
    </div>
  );
};

export default Home;
