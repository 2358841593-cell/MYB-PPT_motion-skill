import fs from "node:fs";
import path from "node:path";

const parseCSV = (content) => {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((h, i) => {
      const val = values[i];
      row[h] = isNaN(Number(val)) ? val : Number(val);
    });
    return row;
  });

  return { headers, rows };
};

const extractLineChartData = (data, options = {}) => {
  const { xColumn, yColumn } = options;

  if (Array.isArray(data)) {
    if (data[0] && typeof data[0] === "object") {
      const firstRow = data[0];
      const keys = Object.keys(firstRow);

      if (xColumn && yColumn) {
        return {
          labels: data.map((row) => String(row[xColumn])),
          values: data.map((row) => Number(row[yColumn]) || 0),
        };
      }

      const labelKey = keys[0];
      const valueKey = keys[1] || keys[0];
      return {
        labels: data.map((row) => String(row[labelKey])),
        values: data.map((row) => Number(row[valueKey]) || 0),
      };
    }

    if (typeof data[0] === "number") {
      return {
        labels: data.map((_, i) => `${i + 1}`),
        values: data,
      };
    }
  }

  if (data.labels && data.values) {
    return { labels: data.labels, values: data.values };
  }

  return { labels: [], values: [] };
};

const extractBarChartData = (data, options = {}) => {
  const { xColumn, yColumn, seriesColumn } = options;

  if (Array.isArray(data)) {
    if (seriesColumn && data[0] && data[0][seriesColumn]) {
      const seriesMap = new Map();
      const labelsSet = new Set();

      data.forEach((row) => {
        const seriesName = row[seriesColumn];
        const label = xColumn ? row[xColumn] : Object.values(row)[0];
        const value = yColumn
          ? Number(row[yColumn])
          : Number(Object.values(row)[1]) || 0;

        labelsSet.add(label);
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, []);
        }
        seriesMap.get(seriesName).push({ label, value });
      });

      const labels = Array.from(labelsSet);
      const series = Array.from(seriesMap.entries()).map(([name, items]) => ({
        name,
        values: labels.map((label) => {
          const item = items.find((i) => i.label === label);
          return item ? item.value : 0;
        }),
      }));

      return { labels, series };
    }

    const result = extractLineChartData(data, { xColumn, yColumn });
    return { labels: result.labels, values: result.values, series: null };
  }

  if (data.labels && data.values) {
    return {
      labels: data.labels,
      values: data.values,
      series: data.series || null,
    };
  }

  return { labels: [], values: [], series: null };
};

const extractPieChartData = (data, options = {}) => {
  const { labelColumn, valueColumn } = options;

  if (Array.isArray(data)) {
    if (data[0] && typeof data[0] === "object") {
      const firstRow = data[0];
      const keys = Object.keys(firstRow);

      const labelKey = labelColumn || keys[0];
      const valueKey = valueColumn || keys[1] || keys[0];

      return {
        segments: data.map((row) => ({
          label: String(row[labelKey]),
          value: Number(row[valueKey]) || 0,
        })),
      };
    }
  }

  if (data.segments) {
    return { segments: data.segments };
  }

  if (data.labels && data.values) {
    return {
      segments: data.labels.map((label, i) => ({
        label,
        value: data.values[i] || 0,
      })),
    };
  }

  return { segments: [] };
};

export const loadDataFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".json") {
    return JSON.parse(content);
  }

  if (ext === ".csv") {
    const { rows } = parseCSV(content);
    return rows;
  }

  throw new Error(`Unsupported file format: ${ext}`);
};

export const getChartData = (data, chartType, options = {}) => {
  switch (chartType) {
    case "line":
    case "line-chart":
      return extractLineChartData(data, options);
    case "bar":
    case "bar-chart":
      return extractBarChartData(data, options);
    case "pie":
    case "pie-chart":
      return extractPieChartData(data, options);
    default:
      throw new Error(`Unknown chart type: ${chartType}`);
  }
};

export const loadDataForSlide = (
  projectDir,
  dataSource,
  chartType,
  options = {},
) => {
  const dataPath = path.join(projectDir, "sources", "data", dataSource);
  const data = loadDataFile(dataPath);
  return getChartData(data, chartType, options);
};

if (process.argv[1].includes("load-data.mjs")) {
  const args = process.argv.slice(2);
  const filePath = args[0];
  const chartType = args[1] || "line";

  if (!filePath) {
    console.log("Usage: node load-data.mjs <data-file> [chart-type]");
    console.log("Chart types: line, bar, pie");
    process.exit(1);
  }

  try {
    const data = loadDataFile(filePath);
    const chartData = getChartData(data, chartType);
    console.log(JSON.stringify(chartData, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}
