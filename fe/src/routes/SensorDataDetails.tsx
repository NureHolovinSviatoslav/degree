import { useState } from "react";
import Loader from "../components/Loader";
import { useDetails } from "../utils/useDetails";
import { useSensorDataQuery } from "../features/useSensorDataQuery";
import { useLocationQuery } from "../features/useLocationQuery";
import { Link } from "react-router-dom";

export const SensorDataDetails = () => {
  const [error, setError] = useState("");
  const { id, values, isLoading } = useDetails(useSensorDataQuery, setError);
  const locationQuery = useLocationQuery();

  if (isLoading || locationQuery.isLoading) {
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
          Дані сенсора не знайдені
        </h4>
      </div>
    );
  }

  const location = locationQuery.data?.find(
    (loc) => loc.location_id === values.location_id,
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
          Деталі даних сенсора # {id}
        </h4>
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
            {values.sensor_data_id}
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
            Час надсилання:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {new Date(values.updated_at).toLocaleString()}
          </p>

          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: ".5rem",
            }}
          >
            Температура:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.temperature} °C
          </p>

          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: ".5rem",
            }}
          >
            Вологість:
          </p>
          <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
            {values.humidity} %
          </p>
        </div>
      </div>
    </>
  );
};

export default SensorDataDetails;
