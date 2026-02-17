import { useState } from "react";
import Loader from "../components/Loader";
import { useDetails } from "../utils/useDetails";
import { useLocationItemQuery } from "../features/useLocationItemQuery";
import { useLocationQuery } from "../features/useLocationQuery";
import { useVaccineQuery } from "../features/useVaccineQuery";
import { Link, useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useLocationItemMutation } from "../features/useLocationItemMutation";

export const LocationItemDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useLocationItemQuery, setError);

  const locationQuery = useLocationQuery();
  const vaccineQuery = useVaccineQuery();

  const mutation = useLocationItemMutation();
  const navigate = useNavigate();

  if (isLoading || locationQuery.isLoading || vaccineQuery.isLoading) {
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
          Елемент локації не знайдено
        </h4>
      </div>
    );
  }

  const location = locationQuery.data?.find(
    (loc) => loc.location_id === values.location_id,
  );
  const vaccine = vaccineQuery.data?.find(
    (vac) => vac.vaccine_id === values.vaccine_id,
  );

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
          Деталі елемента локації # {id}
        </h4>

        <div>
          <Link to={`/location-items/update/${id}`}>
            <IconButton aria-label="edit">
              <Edit />
            </IconButton>
          </Link>
          <IconButton
            aria-label="delete"
            onClick={() => {
              setError("");
              const confirm = window.confirm(`Видалити елемент локації ${id}?`);
              if (!confirm) {
                return;
              }
              mutation
                .mutateAsync({
                  type: "delete",
                  data: { location_item_id: id ?? "" },
                })
                .then(() => {
                  navigate("/location-items");
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
            ID:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.location_item_id}
          </p>

          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: ".5rem",
            }}
          >
            Локація:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {location ? (
              <Link className="link" to={`/locations/${location.location_id}`}>
                {location.name}
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
            Вакцина:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {vaccine ? (
              <Link className="link" to={`/vaccines/${vaccine.vaccine_id}`}>
                {vaccine.name}
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
            Кількість:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.quantity}
          </p>
        </div>
      </div>
    </>
  );
};

export default LocationItemDetails;
