import { Delete, Edit, Summarize } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useLocationMutation } from "../features/useLocationMutation";
import { useLocationQuery } from "../features/useLocationQuery";
import { useDetails } from "../utils/useDetails";

export const LocationDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useLocationQuery, setError);

  const mutation = useLocationMutation();
  const navigate = useNavigate();

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
          Локацію не знайдено
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
          Деталі локації # {id}
        </h4>

        <div>
          <Link to={`/locations/report/${id}`}>
            <IconButton aria-label="report">
              <Summarize />
            </IconButton>
          </Link>
          <Link to={`/locations/update/${id}`}>
            <IconButton aria-label="edit">
              <Edit />
            </IconButton>
          </Link>
          <IconButton
            aria-label="delete"
            onClick={() => {
              setError("");
              const confirm = window.confirm(
                `Видалити локацію ${values.name}?`,
              );
              if (!confirm) {
                return;
              }
              mutation
                .mutateAsync({
                  type: "delete",
                  data: { location_id: id ?? "" },
                })
                .then(() => {
                  navigate("/locations");
                })
                .catch((error) => {
                  setError(error.message);
                });
            }}
          >
            <Delete />
          </IconButton>
        </div>
      </div>

      <div style={{ color: "red", paddingBottom: 10 }}>
        {error && <>Щось пішло не так: {error}</>}
      </div>

      <div style={{ borderRadius: "5px", backgroundColor: "#f5f5f5" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: ".3fr 1fr",
            gap: "0.5rem 1rem",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: ".5rem",
            }}
          >
            Назва:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>{values.name}</p>

          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: ".5rem",
            }}
          >
            Адреса:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.address}
          </p>

          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: ".5rem",
            }}
          >
            Відповідальний:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.responsible_username ? (
              <Link
                className="link"
                to={`/users/${values.responsible_username}`}
              >
                {values.responsible_username}
              </Link>
            ) : (
              "-"
            )}
          </p>

          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: ".5rem",
            }}
          >
            Максимальна місткість:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.max_quantity}
          </p>
        </div>
      </div>
    </>
  );
};

export default LocationDetails;
