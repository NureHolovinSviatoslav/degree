import { useState } from "react";
import Loader from "../components/Loader";
import { useDetails } from "../utils/useDetails";
import { useNotificationQuery } from "../features/useNotificationQuery";
import { Link } from "react-router-dom";

export const NotificationDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useNotificationQuery, setError);

  if (isLoading) {
    return <Loader />;
  }

  if (!values) {
    return (
      <div style={{ paddingInline: 10 }}>
        <h4
          style={{
            textTransform: "uppercase",
            fontWeight: "bold",
            marginBlock: 30,
          }}
        >
          Повідомлення не знайдено
        </h4>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4
          style={{
            textTransform: "uppercase",
            fontWeight: "bold",
            marginBlock: 30,
          }}
        >
          Деталі повідомлення # {id}
        </h4>
      </div>

      <div style={{ color: "red", paddingBottom: 10 }}>
        {error && <>Щось пішло не так: {error}</>}
      </div>

      <div
        style={{
          borderRadius: "5px",
          backgroundColor: "#f5f5f5",
          padding: "1rem",
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
            ID:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.notification_id}
          </p>

          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Користувач:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.notified_username ? (
              <Link className="link" to={`/users/${values.notified_username}`}>
                {values.notified_username}
              </Link>
            ) : (
              "-"
            )}
          </p>

          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Телефон:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.phone ? (
              <a className="link" href={`tel:${values.phone}`}>
                {values.phone}
              </a>
            ) : (
              "-"
            )}
          </p>

          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Відправлено:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {new Date(values.sent_at).toLocaleString()}
          </p>

          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Повідомлення:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.message}
          </p>

          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Тип повідомлення:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.notification_type}
          </p>
        </div>
      </div>
    </>
  );
};

export default NotificationDetails;
