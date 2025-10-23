import React from "react";
import "../../styles/Dashboard/Dashboard.scss";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";

const DashboardPage = () => {

  const dataNaPinasa = useSelector((state) => state.auth.dataToParent);

  console.log(dataNaPinasa)

  return <Box className="dash"></Box>;
};

export default DashboardPage;
