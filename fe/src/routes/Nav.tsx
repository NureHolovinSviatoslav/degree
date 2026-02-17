import { Button, ButtonGroup } from "@mui/material";
import { Link } from "react-router-dom";
import ACLWrapper from "../components/ACLWrapper";
import { ACL } from "../utils/ACL";
import { UserRole } from "../types/User";

export const Nav = () => {
  return (
    <div
      style={{
        marginBottom: "35px",
      }}
    >
      <div className="nav">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: ".5rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gridTemplateRows: "auto auto",
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
              <ACLWrapper
                fallback={<>&nbsp;</>}
                allowedRoles={[UserRole.Admin, UserRole.Staff]}
              >
                Перегляд:
              </ACLWrapper>
            </p>
            <div style={{ height: "auto" }}>
              <ButtonGroup variant="contained">
                <ACLWrapper fallback={null} {...ACL.users}>
                  <Link to="/users">
                    <Button>Користувачі</Button>
                  </Link>
                </ACLWrapper>

                <ACLWrapper fallback={null} {...ACL.locations}>
                  <Link to="/locations">
                    <Button>Локації</Button>
                  </Link>
                </ACLWrapper>

                <ACLWrapper fallback={null} {...ACL.locationItems}>
                  <Link to="/location-items">
                    <Button>Елементи локацій</Button>
                  </Link>
                </ACLWrapper>

                <ACLWrapper fallback={null} {...ACL.vaccines}>
                  <Link to="/vaccines">
                    <Button>Вакцини</Button>
                  </Link>
                </ACLWrapper>

                <ACLWrapper fallback={null} {...ACL.notifications}>
                  <Link to="/notifications">
                    <Button>Сповіщення</Button>
                  </Link>
                </ACLWrapper>

                <ACLWrapper fallback={null} {...ACL.sensorData}>
                  <Link to="/sensor-data">
                    <Button>Дані датчиків</Button>
                  </Link>
                </ACLWrapper>
              </ButtonGroup>
            </div>

            <ACLWrapper
              fallback={
                <>
                  <p
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      margin: ".5rem",
                    }}
                  >
                    &nbsp;
                  </p>
                  <div>&nbsp;</div>
                </>
              }
              {...ACL.graphs}
            >
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  margin: ".5rem",
                }}
              >
                Графіки даних датчиків:
              </p>
              <div>
                <ButtonGroup variant="contained">
                  <Link to="/graphs/sensor-data/location">
                    <Button>Для локацій</Button>
                  </Link>
                  <Link to="/graphs/sensor-data/vaccine">
                    <Button>Для вакцин</Button>
                  </Link>
                </ButtonGroup>
              </div>
            </ACLWrapper>

            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                margin: ".5rem",
              }}
            >
              &nbsp;
            </p>
            <div>&nbsp;</div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexDirection: "column",
            }}
          >
            <Link to="/">
              <Button variant="contained" color="success">
                Головна
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="contained" color="success">
                Профіль
              </Button>
            </Link>
          </div>
        </div>

        <div
          style={{
            border: "3px solid #ccc",
            margin: "0.5rem 0 0 0 ",
          }}
        />
      </div>
    </div>
  );
};
