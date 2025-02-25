export const PatchingConstant = Object.freeze({
  CARDSDATA: [
    {
      name: "FULLY PATCHED",
      value: 1875,
      icon: "anticon-safety",
      color: "#46b65d",
    },
    {
      name: "PARTIALLY PATCHED",
      value: 375,
      icon: "anticon-clock-circle",
      color: "#cb9838",
    },
    {
      name: "OUT OF COMPLIANCE",
      value: 200,
      icon: "anticon-warning",
      color: "#C34A2C",
    },
    {
      name: "NOT REPORTING",
      value: 50,
      icon: "anticon-database",
      color: "#1c2e3c",
    },
  ],
  OVERALLPATCH_STATUS: [
    {
      lable: "Fully Patched",
      values: 1875,
    },
    {
      lable: "Partially Patched",
      values: 375,
    },
    {
      lable: "Out of Compliance",
      values: 200,
    },
    {
      lable: "Not Reporting",
      values: 50,
    },
  ],
  COMPLIANCE_TREND: [
    {
      name: "Actual Compliance",
      data: [
        {
          month: "Jan",
          data: 75,
        },
        {
          month: "Feb",
          data: 78,
        },
        {
          month: "Mar",
          data: 81.6,
        },
        {
          month: "Apr",
          data: 83,
        },
        {
          month: "May",
          data: 85,
        },
      ],
    },
    {
      name: "Target",
      data: [
        {
          month: "Jan",
          data: 95,
        },
        {
          month: "Feb",
          data: 95,
        },
        {
          month: "Mar",
          data: 95,
        },
        {
          month: "Apr",
          data: 95,
        },
        {
          month: "May",
          data: 95,
        },
      ],
    },
  ],
  PATCH_SEVERITY: [
    { label: "Critical", value: { Pending: 17, Installed: 8 }},
    { label: "High", value: { Pending: 27, Installed: 105 }},
    { label: "Medium", value: { Pending: 8, Installed: 88 }},
    { label: "Low", value: { Pending: 36, Installed: 26 }},
  ],
  OS_DISTRIBUTION: [
    {
        name: "Windows Server 2019",
        systems: 727
    },
    {
        name: "Windows Server 2016",
        systems: 941
    },
    {
        name: "RHEL 8",
        systems: 878
    },
    {
        name: "RHEL 7",
        systems: 793
    },
    {
        name: "Ubuntu 20.04",
        systems: 265
    },
  ],
  AGE_DISTRIBUTION: [
    {
        name: "0-7 days",
        systems: 365
    },
    {
        name: "8-14 days",
        systems: 38
    },
    {
        name: "15-30 days",
        systems: 200
    },
    {
        name: "31-60 days",
        systems: 5
    },
    {
        name: "60+ days",
        systems: 89
    },
  ],
  LOCATIONBASED_COMPLIANCE: [
    { label: "us-east", value: { "Compliant": 220, "Non-Compliant": 76 } },
    { label: "us-west", value: { "Compliant": 444, "Non-Compliant": 85 } },
    { label: "eu-central", value: { "Compliant": 291, "Non-Compliant": 48 } },
    { label: "ap-south", value: { "Compliant": 24, "Non-Compliant": 35 } },
    { label: "sa-east", value: { "Compliant": 99, "Non-Compliant": 12 } }
  ],
  PATCHFAILURE: [
    {
      lable: "Disk Space",
      values: 38,
    },
    {
      lable: "Dependencies",
      values: 1,
    },
    {
      lable: "Network Issues",
      values: 10,
    },
    {
      lable: "Service Conflicts",
      values: 22,
    },
    {
      lable: "Timeout",
      values: 8,
    },
  ],
  TEAM_PATCH_STATUSES:[
    { name: "Up to Date", data: [243,193,175,21,27]},
    { name: "Pending", data: [53,73,0,57,68]},
    { name: "Failed", data: [38,24,12,22,23]},
  ],
  PATCH_WINDOW_COMPLIANCE:[
    { name: "Within Maintenance Window", data: [35,10,228,317,288,81]},
    { name: "Outside Maintenance Window", data: [20,33,43,57,5,22]}
  ],
  DAYWISE_PATCH_COUNT: [
    { date: "2024-12-18", value: 3 },
    { date: "2024-12-19", value: 1 },
    { date: "2024-12-20", value: 3 },
    { date: "2024-12-21", value: 1 },
    { date: "2024-12-22", value: 2 },
    { date: "2024-12-23", value: 1 },
    { date: "2024-12-24", value: 2 },
    { date: "2024-12-25", value: 1 },
    { date: "2024-12-26", value: 3 },
    { date: "2024-12-27", value: 1 },
    { date: "2024-12-28", value: 2 },
    { date: "2024-12-29", value: 3 },
    { date: "2024-12-30", value: 1 },
    { date: "2024-12-31", value: 3 },
    { date: "2025-01-01", value: 4 },
    { date: "2025-01-02", value: 1 },
    { date: "2025-01-03", value: 3 },
    { date: "2025-01-04", value: 2 },
    { date: "2025-01-05", value: 1 },
    { date: "2025-01-06", value: 3 },
    { date: "2025-01-07", value: 2 },
    { date: "2025-01-08", value: 1 },
    { date: "2025-01-09", value: 3 },
    { date: "2025-01-10", value: 1 },
    { date: "2025-01-11", value: 2 },
    { date: "2025-01-12", value: 1 },
    { date: "2025-01-13", value: 2 },
    { date: "2025-01-14", value: 1 },
    { date: "2025-01-15", value: 2 },
    { date: "2025-01-16", value: 1 },
  ],  
});
