import React, { useMemo, useState, useEffect } from "react";
import TimesheetGrid from "./TimesheetGrid";
import api from "@/api/axios";
import { toast } from "sonner";
import { formatDateLocal } from "@/utils/date";

// Helper function to get last 15 days (today included - 15 days backward)
const getLast15DaysRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayString = `${year}-${month}-${day}`;

  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 14);
  const fromYear = fromDate.getFullYear();
  const fromMonth = String(fromDate.getMonth() + 1).padStart(2, "0");
  const fromDay = String(fromDate.getDate()).padStart(2, "0");
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
          taskDate: task.taskDate
          ? formatDateLocal(task.taskDate)
          : null,
          project: task.projectId?._id,
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
    const day = String(today.getDate()).padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;

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
    // user edited date
    if (params?.colDef?.field === "taskDate" && updatedRow.taskDate) {
  
      const isValid = isDateInRange(
        updatedRow.taskDate,
        dateRange.from,
        dateRange.to
      );
  
      if (!isValid) {
        alert(`Date must be between ${dateRange.from} and ${dateRange.to}`);
  
        // ⭐ CRITICAL FIX → revert the invalid value inside grid
        params.node.setDataValue("taskDate", params.oldValue);
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
          taskDate: row.taskDate || null,
          project: row.project,
          projectCategory: row.projectCategory,
          projectStage: row.projectStage,
          plannedDuration: row.plannedDuration,
          actualDuration: row.actualDuration || 0,
          status: row.status,
          taskDescription: row.taskDescription,
        };

        console.log("base task - ", baseTask)

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
          `Please fill all required fields`
        );
        return;
      }

      if (existingTasks.length === 0 && newTasks.length === 0) {
        toast.info("No tasks to save");
        return;
      }

      let createRes = null;
      let updateRes = null;

      if (existingTasks.length > 0) {
        updateRes = await api.put("/task", { tasks: existingTasks });
      }

      if (newTasks.length > 0) {
        createRes = await api.post("/task/create", { tasks: newTasks });
      }

      const failedCount =
        (updateRes?.data?.failedCount || 0) +
        (createRes?.data?.failedCount || 0);
      const createdCount = createRes?.data?.createdCount || 0;
      const updatedCount = updateRes?.data?.updatedCount || 0;

      if (failedCount > 0) {
        toast.warning(
          `Saved ${
            createdCount + updatedCount
          } tasks, but ${failedCount} failed. Please check inputs.`
        );
        // DO NOT refetch here so user can fix the errors
      } else {
        toast.success(
          `Timesheet saved successfully`
        );

        // ONLY refresh data if everything was perfect
        const response = await api.get(
          `/task/employee?fromDate=${dateRange.from}&toDate=${dateRange.to}`
        );
        // ... existing normalization logic ...
        const normalized = response.data.data?.map((task) => ({
          // ... existing mapping ...
          id: task._id,
          taskDate: task.taskDate
            ? formatDateLocal(task.taskDate)
            : null,
          project: task.projectId?._id,
          projectCategory: task.projectCategory,
          projectStage: task.projectStage,
          taskDescription: task.taskDescription,
          plannedDuration: task.plannedDuration,
          actualDuration: task.actualDuration || 0,
          status: task.status,
        }));
        console.log("normalized - ", normalized)
        setRowData(normalized || []);
      }
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
