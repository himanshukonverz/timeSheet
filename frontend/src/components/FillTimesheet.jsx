import React, { useMemo, useState, useEffect } from "react";
import TimesheetGrid from "./TimesheetGrid";

// Helper function to get last 15 days (today included - 15 days backward)
const getLast15DaysRange = () => {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 14); // 14 days back + today = 15 days

  return {
    from: fromDate.toISOString().split("T")[0],
    to: today.toISOString().split("T")[0],
  };
};

// Helper to check if a date is within the allowed range
const isDateInRange = (dateString, fromDate, toDate) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  return date >= from && date <= to;
};

// Helper to generate dummy data within date range
const generateDummyData = (fromDate, toDate) => {
  const dummyData = [];
  const from = new Date(fromDate);
  const to = new Date(toDate);

  // Generate some sample entries across the date range
  const projects = ["Project Alpha", "Project Beta", "Project Gamma"];
  const categories = ["implementation", "integration", "AMS"];
  const stages = ["BPU", "CRP", "TTT", "Go Live"];
  const statuses = ["in_progress", "completed", "cancelled"];

  // Add a few entries spread across the date range
  let idCounter = 1;
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();

    // Add 1-2 entries per day (skip weekends for variety)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Add 1-2 tasks per weekday
      const numTasks = Math.random() > 0.5 ? 1 : 2;

      for (let i = 0; i < numTasks; i++) {
        dummyData.push({
          id: `existing-${idCounter++}`,
          taskDate: dateStr,
          projectName: projects[Math.floor(Math.random() * projects.length)],
          projectCategory:
            categories[Math.floor(Math.random() * categories.length)],
          projectStage: stages[Math.floor(Math.random() * stages.length)],
          taskDescription: `Task description for ${dateStr}`,
          plannedDuration: Math.floor(Math.random() * 300) + 60, // 60-360 minutes
          actualDuration: Math.floor(Math.random() * 300) + 60,
          status: statuses[Math.floor(Math.random() * statuses.length)],
        });
      }
    }
  }

  return dummyData;
};

function FillTimesheet() {
  const dateRange = useMemo(() => getLast15DaysRange(), []);
  const [rowData, setRowData] = useState([]);

  // Initialize with dummy data (simulating backend fetch)
  useEffect(() => {
    // TODO: Replace with actual API call
    // const fetchTimesheetData = async () => {
    //   const response = await api.get(`/timesheet?from=${dateRange.from}&to=${dateRange.to}`);
    //   setRowData(response.data);
    // };
    // fetchTimesheetData();

    // For now, use dummy data
    const dummyData = generateDummyData(dateRange.from, dateRange.to);
    setRowData(dummyData);
  }, [dateRange.from, dateRange.to]);

  // Filter rows to only show those within the 15-day range
  const filteredRowData = useMemo(() => {
    return rowData.filter((row) => {
      if (!row.taskDate) return false;
      return isDateInRange(row.taskDate, dateRange.from, dateRange.to);
    });
  }, [rowData, dateRange.from, dateRange.to]);

  // Handle adding a new task row
  const handleAddRow = () => {
    const today = new Date().toISOString().split("T")[0];
    const newRow = {
      id: `new-${Date.now()}`,
      taskDate: today,
      projectName: null,
      projectCategory: null,
      projectStage: null,
      taskDescription: null,
      plannedDuration: null,
      actualDuration: null,
      status: null,
    };

    // Add to rowData immediately
    setRowData((prevData) => [...prevData, newRow]);
    return newRow;
  };

  // Handle row data changes
  const handleRowDataChanged = (updatedRow, params) => {
    // If date was changed, validate it's within range
    if (params?.colDef?.field === "taskDate" && updatedRow.taskDate) {
      if (!isDateInRange(updatedRow.taskDate, dateRange.from, dateRange.to)) {
        // Show warning or prevent the change
        alert(`Date must be between ${dateRange.from} and ${dateRange.to}`);
        return;
      }
    }

    setRowData((prevData) =>
      prevData.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    );
  };

  // Handle save
  const handleSave = (changedData, changedRows) => {
    console.log("Saving data:", changedData);
    // TODO: Call API to save timesheet data
    // await api.post('/timesheet', { tasks: changedData });
  };

  return (
    <div className="p-6">
      <div className="w-full flex justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Fill Timesheet
        </h1>

        <div className="mb-4 text-sm text-gray-600">
          <p>
            You can edit your timesheet for the last 15 days (including today).
          </p>
          <p>
            Date Range: {dateRange.from} to {dateRange.to}
          </p>
          
        </div>
      </div>

      <TimesheetGrid
        rowData={filteredRowData}
        isEditable={true}
        onRowDataChanged={handleRowDataChanged}
        onAddRow={handleAddRow}
        onSave={handleSave}
      />
    </div>
  );
}

export default FillTimesheet;
