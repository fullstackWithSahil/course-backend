const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 800,
    easing: "easeOutQuart",
  },
  elements: {
    line: {
      tension: 0.3,
    },
    point: {
      radius: 2,
      hoverRadius: 5,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: "index",
      intersect: false,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      padding: 10,
      cornerRadius: 4,
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        callback: function (value) {
          return value;
        },
      },
    },
  },
};

// Create CPU chart
const cpuChartConfig = {
  ...chartOptions,
  scales: {
    ...chartOptions.scales,
    y: {
      ...chartOptions.scales.y,
      max: 100,
      ticks: {
        callback: function (value) {
          return value + "%";
        },
      },
    },
  },
};

// Create Memory chart
const memoryChartConfig = {
  ...chartOptions,
  scales: {
    ...chartOptions.scales,
    y: {
      ...chartOptions.scales.y,
      ticks: {
        callback: function (value) {
          return value + " GB";
        },
      },
    },
  },
};

// Initialize chart instances
let cpuChart, memoryChart;
let currentTimeRange = "1h"; // Default to 1 hour

function initCharts() {
  // CPU Chart
  const cpuCtx = document.getElementById("cpuChart").getContext("2d");
  cpuChart = new Chart(cpuCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "CPU Usage",
          data: [],
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          borderWidth: 2,
          fill: true,
        },
      ],
    },
    options: cpuChartConfig,
  });

  // Memory Chart
  const memoryCtx = document.getElementById("memoryChart").getContext("2d");
  memoryChart = new Chart(memoryCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Memory Usage",
          data: [],
          borderColor: "#2ecc71",
          backgroundColor: "rgba(46, 204, 113, 0.1)",
          borderWidth: 2,
          fill: true,
        },
      ],
    },
    options: memoryChartConfig,
  });
}

// Format timestamp based on the current time range
function formatTimestamp(timestamp, timeRange) {
  const date = new Date(timestamp);

  if (timeRange === "1h") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (timeRange === "24h") {
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " " +
      date.toLocaleDateString([], { month: "short", day: "numeric" })
    );
  } else {
    // 3d
    return (
      date.toLocaleDateString([], { month: "short", day: "numeric" }) +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit" })
    );
  }
}

// Update last updated text
function updateLastUpdated() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  document.getElementById(
    "lastUpdated"
  ).textContent = `Last updated: ${timeString}`;
}

// Fetch data for the selected time range
async function fetchData() {
  // Show loading indicator
  const refreshIcon = document.getElementById("refreshIcon");
  const refreshButton = document.getElementById("refreshButton");
  refreshIcon.innerHTML = '<span class="loading"></span>';
  refreshButton.disabled = true;

  try {
    // Add time range parameter to the API call
    const response = await fetch(`/api/metrics/data?range=${currentTimeRange}`);
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      return;
    }

    // Process data for charts
    const labels = data.map((item) =>
      formatTimestamp(item.timestamp, currentTimeRange)
    );
    const cpuData = data.map((item) => parseFloat(item.cpu_usage).toFixed(2));
    const memoryData = data.map((item) =>
      parseFloat(item.memory_usage_gb).toFixed(2)
    );

    // Update current values
    const currentCpu = cpuData[cpuData.length - 1];
    const currentMemory = memoryData[memoryData.length - 1];

    document.getElementById("currentCpu").textContent = `${currentCpu}%`;
    document.getElementById(
      "currentMemory"
    ).textContent = `${currentMemory} GB`;

    // Update charts
    cpuChart.data.labels = labels;
    cpuChart.data.datasets[0].data = cpuData;

    // Adjust the point density based on the time range
    if (currentTimeRange === "1h") {
      cpuChart.options.elements.point.radius = 2;
    } else if (currentTimeRange === "24h") {
      cpuChart.options.elements.point.radius = 1;
    } else {
      // 3d
      cpuChart.options.elements.point.radius = 0;
    }

    cpuChart.update();

    memoryChart.data.labels = labels;
    memoryChart.data.datasets[0].data = memoryData;

    // Match the point density settings
    memoryChart.options.elements.point.radius =
      cpuChart.options.elements.point.radius;

    memoryChart.update();

    // Update last updated text
    updateLastUpdated();
  } catch (error) {
    console.error("Error fetching metrics data:", error);
    alert("Failed to fetch metrics data. See console for details.");
  } finally {
    // Restore button
    refreshIcon.textContent = "↻";
    refreshButton.disabled = false;
  }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  initCharts();

  // Set up time range buttons
  const timeRangeButtons = document.querySelectorAll(".time-range-button");
  timeRangeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active button
      timeRangeButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Set current time range
      currentTimeRange = button.dataset.range;

      // Fetch data for the new time range
      fetchData();
    });
  });

  // Initial data fetch
  fetchData();

  // Set up refresh button
  document.getElementById("refreshButton").addEventListener("click", fetchData);

  // Auto-refresh every 30 seconds for 1h view, less frequently for longer ranges
  setInterval(() => {
    if (currentTimeRange === "1h") {
      fetchData();
    }
  }, 5000);

  // Auto-refresh every 5 minutes for 24h and 3d views
  setInterval(() => {
    if (currentTimeRange !== "1h") {
      fetchData();
    }
  }, 5000);
});
