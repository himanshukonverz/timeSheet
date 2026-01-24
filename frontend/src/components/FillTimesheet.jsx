import React, { useMemo, useState, useEffect } from "react";
import TimesheetGrid from "./TimesheetGrid";
import api from "@/api/axios";
import { toast } from "sonner";

// Helper function to get last 15 days (today included - 15 days backward)
const getLast15DaysRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;
  
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 14);
  const fromYear = fromDate.getFullYear();
  const fromMonth = String(fromDate.getMonth() + 1).padStart(2, '0');
  const fromDay = String(fromDate.getDate()).padStart(2, '0');
  const fromDateString = `${fromYear}-${fromMonth}-${fromDay}`;

  return {
    from: fromDateString,
    to: todayString,
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

function FillTimesheet() {
  const dateRange = useMemo(() => getLast15DaysRange(), []);
  const [rowData, setRowData] = useState([]);

  const [dropdowns, setDropdowns] = useState({
    projects: [],
    categories: [],
    stages: [],
    statuses: [],
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      const res = await api.get("/task/metadata");
      setDropdowns(res.data);
    };

    fetchDropdowns();
  }, []);

  // Initialize with dummy data (simulating backend fetch)
  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchTimesheetData = async () => {
      try {
        const response = await api.get(
          `/task/employee?fromDate=${dateRange.from}&toDate=${dateRange.to}`
        );
        console.log("response - ", response);
        const normalized = response.data.data?.map((task) => ({
          id: task._id,
          taskDate: task.taskDate ? new Date(task.taskDate).toISOString().split("T")[0] : null,
          project: task.projectId?._id || task.projectId,
          projectCategory: task.projectCategory,
          projectStage: task.projectStage,
          taskDescription: task.taskDescription,
          plannedDuration: task.plannedDuration,
          actualDuration: task.actualDuration || 0,
          status: task.status,
        }));
        setRowData(normalized || []);
      } catch (err) {
        console.error("Error fetching timesheet data:", err);
        toast.error("Failed to load timesheet data");
      }
    };

    fetchTimesheetData();
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
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${day}-${month}-${year}`;

    const newRow = {
      id: `new-${Date.now()}`,
      taskDate: todayString,
      project: null,
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
  const handleSave = async () => {
    try {
      const existingTasks = [];
      const newTasks = [];
      const validationErrors = [];

      // Validate ans separate tasks
      rowData.forEach((row) => {
        // Skip empty new rows
        if (
          row.id?.startsWith("new-") &&
          !row.project &&
          !row.taskDescription
        ) {
          return; // Skip empty new rows
        }
        const baseTask = {
          taskDate: row.taskDate 
            ? (typeof row.taskDate === 'string' 
                ? row.taskDate.split('T')[0]  // Remove time if present
                : new Date(row.taskDate).toISOString().split('T')[0])  // Convert Date to string
            : null,
          project: row.project,
          projectCategory: row.projectCategory,
          projectStage: row.projectStage,
          plannedDuration: row.plannedDuration,
          actualDuration: row.actualDuration || 0,
          status: row.status,
          taskDescription: row.taskDescription,
        };

        // Validate required fields
        if (
          !baseTask.project ||
          !baseTask.projectCategory ||
          !baseTask.projectStage ||
          !baseTask.taskDescription ||
          baseTask.plannedDuration === undefined ||
          baseTask.plannedDuration === null ||
          !baseTask.status ||
          !baseTask.taskDate
        ) {
          validationErrors.push({
            index,
            error: "Missing required fields",
          });
          return;
        }

        if (row.id?.startsWith("new-")) {
          newTasks.push(baseTask);
        } else {
          existingTasks.push({
            taskId: row.id,
            ...baseTask,
          });
        }
      });

      if (validationErrors.length > 0) {
        toast.error(
          `Please fill all required fields. ${validationErrors.length} task(s) have errors.`
        );
        return;
      }

      if (existingTasks.length === 0 && newTasks.length === 0) {
        toast.info("No tasks to save");
        return;
      }

      // Save existing tasks
      if (existingTasks.length > 0) {
        await api.put("/task", { tasks: existingTasks });
      }

      // Save new tasks
      if (newTasks.length > 0) {
        await api.post("/task/create", { tasks: newTasks });
      }

      toast.success(
        `Timesheet saved successfully! ${existingTasks.length} updated, ${newTasks.length} created.`
      );

      // Refresh data after save
      const response = await api.get(
        `/task/employee?from=${dateRange.from}&to=${dateRange.to}`
      );
      const normalized = response.data.data?.map((task) => ({
        id: task._id,
        project: task.projectId?._id || task.projectId,
        ...task,
      }));
      setRowData(normalized);
    } catch (err) {
      console.error(err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.error ||
        "Save failed";
      toast.error(errorMsg);
    }
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
        dropdowns={dropdowns}
        onRowDataChanged={handleRowDataChanged}
        onAddRow={handleAddRow}
        onSave={handleSave}
        dateRange={dateRange}
      />
    </div>
  );
}

export default FillTimesheet;
