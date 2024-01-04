import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});
// const chartSetting = {

const valueFormatter = (value) => `Rating ${value} star`;

export default function Chart({ data }) {
  if (data.length === 0) return;
  return (
    <ThemeProvider theme={darkTheme}>
      <BarChart
        dataset={data}
        xAxis={[{ scaleType: "band", dataKey: "rating" }]}
        series={[
          {
            dataKey: "number",
            // label: 'number',
            valueFormatter,
          },
        ]}
        bottomAxis={null}
        leftAxis={null}
        width={140}
        height={90}
        margin={{
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        colors={["#99aabb"]}

        //   sx={{
        //     "& .css-1vuxth3-MuiBarElement-root": {
        //         fill:"#99aabb"
        //     //   backgroundColor: "#445566",
        //     //   color: "#ccd7ff",
        //       //  fontWeight: 700,
        //     },}}
      />
    </ThemeProvider>
  );
}
