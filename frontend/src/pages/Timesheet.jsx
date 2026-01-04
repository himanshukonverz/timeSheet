import React, { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { useLocation } from "react-router-dom";

const rowData = [
  {
    id: "1",
    taskDate: "2026-01-02",
    projectName: "Project Alpha",
    projectCategory: "implementation",
    projectStage: "BPU",
    taskDescription: "API integration work",
    plannedDuration: 180, // minutes
    actualDuration: 200,
    status: "completed",
  },
  {
    id: "2",
    taskDate: "2026-01-02",
    projectName: "Project Beta",
    projectCategory: "AMS",
    projectStage: "Prod Support",
    taskDescription: "Bug fixes",
    plannedDuration: 120,
    actualDuration: 90,
    status: "in_progress",
  },
  {
    id: "3",
    taskDate: "2026-01-03",
    projectName: "Project Gamma",
    projectCategory: "implementation",
    projectStage: "CRP",
    taskDescription: "Feature development",
    plannedDuration: 240,
    actualDuration: 250,
    status: "completed",
  },
  {
    id: "4",
    taskDate: "2026-01-05",
    projectName: "Project Delta",
    projectCategory: "AMS",
    projectStage: "Prod Support",
    taskDescription: "System maintenance",
    plannedDuration: 180,
    actualDuration: 175,
    status: "completed",
  },
  {
    id: "5",
    taskDate: "2026-01-08",
    projectName: "Project Alpha",
    projectCategory: "implementation",
    projectStage: "Go Live",
    taskDescription: "Deployment work",
    plannedDuration: 300,
    actualDuration: 320,
    status: "in_progress",
  },
];

// Helper function to get default dates
const getDefaultDates = () => {
  const now = new Date();
  
  // toDate: current date of current month
  const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const toDateString = toDate.toISOString().split('T')[0];
  
  // fromDate: 26th of previous month
  const fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 27);
  const fromDateString = fromDate.toISOString().split('T')[0];
  
  return { fromDate: fromDateString, toDate: toDateString };
};

function Timesheet() {
  const location = useLocation();
  const defaultDates = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaultDates.fromDate);
  const [toDate, setToDate] = useState(defaultDates.toDate);
  
  // Determine if timesheet should be editable based on URL
  const isEditable = useMemo(() => {
    const path = location.pathname;
    // Editable routes: fill-timesheet, my-timesheet
    const editableRoutes = ['/fill-timesheet'];
    return editableRoutes.some(route => path.includes(route));
  }, [location.pathname]);

  // Filter rowData based on date range
  const filteredRowData = useMemo(() => {
    if (!fromDate && !toDate) {
      return rowData;
    }

    return rowData.filter((row) => {
      if (!row.taskDate) return false;
      
      const taskDate = new Date(row.taskDate);
      taskDate.setHours(0, 0, 0, 0);
      const from = fromDate ? new Date(fromDate) : null;
      if (from) {
        from.setHours(0, 0, 0, 0);
      }
      const to = toDate ? new Date(toDate) : null;
      if (to) {
        // Set to end of day to make it inclusive
        to.setHours(23, 59, 59, 999);
      }

      if (from && to) {
        return taskDate >= from && taskDate <= to;
      } else if (from) {
        return taskDate >= from;
      } else if (to) {
        return taskDate <= to;
      }
      return true;
    });
  }, [fromDate, toDate]);

  // Create column definitions dynamically based on isEditable
  const columnDefs = useMemo(() => [
    {
      headerName: "Date",
      flex: 1,
      field: "taskDate",
      editable: isEditable ? true : false,
    },
    {
      headerName: "Project",
      flex: 1,
      field: "projectName",
      editable: isEditable ? true : false,
    },
    {
      headerName: "Category",
      flex: 1,
      field: "projectCategory",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["implementation", "integration", "AMS"],
      },
      editable: isEditable ? true : false,
    },
    {
      headerName: "Stage",
      flex: 1,
      field: "projectStage",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: [
          "BPU",
          "CRP",
          "TTT",
          "Prod Config",
          "Go Live",
          "Hypercare",
          "Others",
        ],
      },
      editable: isEditable ? true : false,
    },
    {
      headerName: "Description",
      flex: 1,
      field: "taskDescription",
      editable: isEditable ? true : false,
    },
    {
      headerName: "Planned (min)",
      flex: 1,
      field: "plannedDuration",
      editable: isEditable ? true : false,
    },
    {
      headerName: "Actual (min)",
      flex: 1,
      field: "actualDuration",
      editable: isEditable ? true : false,
    },
    {
      headerName: "Status",
      flex: 1,
      field: "status",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["in_progress", "completed", "cancelled"],
      },
      editable: isEditable ? true : false,
    },
  ], [isEditable]);

  const handleReset = () => {
    const defaults = getDefaultDates();
    setFromDate(defaults.fromDate);
    setToDate(defaults.toDate);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        {isEditable ? "Fill Timesheet" : "View Timesheet"}
      </h1>

      {/* Date Range Filter - Only show on view timesheet */}
      {!isEditable && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                id="fromDate"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                id="toDate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          theme={themeQuartz}
          rowData={filteredRowData}
          columnDefs={columnDefs}
        />
      </div>
    </div>
  );
}

export default Timesheet;