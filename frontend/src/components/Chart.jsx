import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer, 
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Chart({ data }) {
  return (
 
    <ResponsiveContainer width="80%" height={500}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="okres"
          angle={-45}
          textAnchor="end"
          height={80} 
          interval="preserveStartEnd"
          minTickGap={30} 
        />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="zgony" stroke="#8884d8" dot={false} />
        <Brush dataKey="okres" height={30} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default Chart;