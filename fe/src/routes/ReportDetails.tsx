import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { useReportQuery } from "../features/useReportQuery";
import { useVaccineQuery } from "../features/useVaccineQuery";
import { Button } from "@mui/material";
import { useReactToPrint } from "react-to-print";

export const ReportDetails = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());

  const id = useParams().id;
  const query = useReportQuery(id || "");

  const vaccinesQuery = useVaccineQuery();

  const values = useMemo(() => {
    return query.data || null;
  }, [query.data]);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Звіт локації #${id}`,
  });

  useEffect(() => {
    if (query.isError) {
      setError((query.error as Error)?.message || "Unknown error");
    }
    if (vaccinesQuery.isError) {
      setError((vaccinesQuery.error as Error)?.message || "Unknown error");
    }
  }, [query.isError, vaccinesQuery.isError, query.error, vaccinesQuery.error]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000 * 10);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (query.isLoading || vaccinesQuery.isLoading) {
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
          Звіт локації не знайдено
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
          Звіт локації #{id}
        </h4>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 10,
        }}
      >
        {
          <div style={{ color: "red" }}>
            {error && <>{`Щось пішло не так: ${error}`}</>}
          </div>
        }

        <Button variant="contained" color="success" onClick={handlePrint}>
          Експортувати звіт як PDF
        </Button>
      </div>

      <div ref={reportRef}>
        <div
          style={{
            borderRadius: "5px",
            backgroundColor: "#f5f5f5",
            padding: "1rem",
            marginBottom: "1rem",
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
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                margin: ".5rem",
              }}
            >
              Назва:
            </p>
            <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
              {
                <Link className="link" to={`/locations/${values.location_id}`}>
                  {values.name}
                </Link>
              }
            </p>

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
              Використано місця:
            </p>
            <p style={{ fontSize: "1.2rem", margin: ".5rem" }}>
              {values.used_quantity}
            </p>
          </div>
        </div>

        <h4
          style={{
            textTransform: "uppercase",
            fontWeight: "bold",
            marginBlock: 30,
          }}
        >
          Елементи локації
        </h4>
        {values.location_items && values.location_items.length > 0 ? (
          <div
            style={{
              overflowX: "auto",
              borderRadius: "5px",
              backgroundColor: "#f5f5f5",
              padding: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    ID
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    Вакцина
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    Місткість
                  </th>
                </tr>
              </thead>
              <tbody>
                {values.location_items.map((item) => (
                  <tr key={item.location_item_id}>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      <Link
                        className="link"
                        to={`/location-items/${item.location_item_id}`}
                      >
                        {item.location_item_id}
                      </Link>
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      <Link
                        className="link"
                        to={`/vaccines/${item.vaccine_id}`}
                      >
                        {vaccinesQuery.data?.find(
                          (vaccine) => vaccine.vaccine_id === item.vaccine_id,
                        )?.name || "-"}
                      </Link>
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: "0.5rem" }}>Немає елементів локації</p>
        )}

        <h4
          style={{
            textTransform: "uppercase",
            fontWeight: "bold",
            marginBlock: 30,
          }}
        >
          Дані сенсора
        </h4>
        {values.sensor_data && values.sensor_data.length > 0 ? (
          <div
            style={{
              overflowX: "auto",
              borderRadius: "5px",
              backgroundColor: "#f5f5f5",
              padding: "0.5rem",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    ID
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    Час надсилання
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    Температура
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    Вологість
                  </th>
                </tr>
              </thead>
              <tbody>
                {values.sensor_data.map((data) => (
                  <tr key={data.sensor_data_id}>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      <Link
                        className="link"
                        to={`/sensor-data/${data.sensor_data_id}`}
                      >
                        {data.sensor_data_id}
                      </Link>
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      {new Date(data.updated_at).toLocaleString()}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      {data.temperature} °C
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      {data.humidity} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: "0.5rem" }}>Немає даних сенсора</p>
        )}

        <div
          style={{
            marginTop: "1rem",
            color: "#888",
            textAlign: "right",
          }}
        >
          Звіт складено для локації #{id} ({values.name}) на{" "}
          {now.toLocaleString()}
        </div>
      </div>
    </>
  );
};

export default ReportDetails;
