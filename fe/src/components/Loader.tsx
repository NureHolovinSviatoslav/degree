import { CircularProgress } from "@mui/material";

const Loader = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 16px - 35px)",
      }}
    >
      <CircularProgress />
    </div>
  );
};

export default Loader;
