import { Button } from "@mui/material";
import { useContext } from "react";
import { useQueryClient } from "react-query";
import { CurrentUserContext } from "../App";
import { CURRENT_USER_QUERY_KEY } from "../features/useCurrentUserQuery";

export const Profile = () => {
  const user = useContext(CurrentUserContext);
  const queryClient = useQueryClient();

  return (
    <>
      <div
        style={{
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: ".25rem",
          }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              localStorage.removeItem("jwt");
              queryClient.resetQueries(CURRENT_USER_QUERY_KEY);
            }}
          >
            Вийти
          </Button>
        </div>
      </div>

      <div
        style={{
          borderRadius: "5px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: ".3fr 1fr",
            gap: "0.5rem 1rem",
            alignItems: "center",
          }}
        >
          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Ім&apos;я:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>{user.username}</p>

          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Телефон:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {user.phone ?? "-"}
          </p>

          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Роль:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>{user.role}</p>
        </div>
      </div>
    </>
  );
};

export default Profile;
