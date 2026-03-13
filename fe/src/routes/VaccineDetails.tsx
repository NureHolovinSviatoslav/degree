import { useState } from "react";
import Loader from "../components/Loader";
import { useVaccineQuery } from "../features/useVaccineQuery";
import { useDetails } from "../utils/useDetails";
import { Link, useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useVaccineMutation } from "../features/useVaccineMutation";

export const VaccineDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useVaccineQuery, setError);

  const mutation = useVaccineMutation();
  const navigate = useNavigate();

  if (isLoading) {
    return <Loader />;
  }

  if (!values) {
    return (
      <div
        style={{
          paddingInline: 10,
        }}
      >
        <h4
          style={{
            textTransform: "uppercase",
            fontWeight: "bold",
            marginBlock: 30,
          }}
        >
          Вакцину не знайдена
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
          Деталі вакцини # {id}
        </h4>

        <div>
          <Link to={`/vaccines/update/${id}`}>
            <IconButton aria-label="edit">
              <Edit />
            </IconButton>
          </Link>
          <IconButton
            aria-label="delete"
            onClick={() => {
              setError("");
              const confirm = window.confirm(
                `Видалити вакцину ${values.name}?`,
              );
              if (!confirm) {
                return;
              }
              mutation
                .mutateAsync({
                  type: "delete",
                  data: { vaccine_id: id ?? "" },
                })
                .then(() => {
                  navigate("/vaccines");
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

      <div
        style={{
          color: "red",
          paddingBottom: 10,
        }}
      >
        {error && <>Щось пішло не так: {error}</>}
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
            Назва:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>{values.name}</p>
          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Опис:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.description}
          </p>
          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Мінімальна температура:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.min_temperature} °C
          </p>
          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Максимальна температура:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.max_temperature} °C
          </p>
          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Мінімальна вологість:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.min_humidity} %
          </p>
          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: ".5rem" }}
          >
            Максимальна вологість:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.max_humidity} %
          </p>
        </div>
      </div>
    </>
  );
};

export default VaccineDetails;
