import React, { useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { toast } from "sonner";
import api from "@/api/axios";

function TimesheetGrid({
  rowData = [],
  isEditable = false,
  dropdowns,
  onRowDataChanged = null,
  onAddRow = null,
  onSave = null,
  dateRange,
}) {
  const gridRef = useRef(null);
  const [changedRows, setChangedRows] = useState(new Set());

  // Column definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Date",
        flex: 1,
        field: "taskDate",
        editable: isEditable,
        cellEditor: "agDataCellEditor",
        cellEditorParams: {
          min: dateRange?.from,
          max: dateRange?.to,
        },
      },

      {
        headerName: "Project",
        flex: 1,
        field: "project",
        editable: isEditable,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: dropdowns?.projects?.map((p) => p._id) || [],
        },
        valueFormatter: (params) =>
          dropdowns?.projects?.find((p) => p._id === params.value)
            ?.projectName || "",
      },

      {
        headerName: "Category",
        flex: 1,
        field: "projectCategory",
        editable: isEditable,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: dropdowns?.categories || [],
        },
      },

      {
        headerName: "Stage",
        flex: 1,
        field: "projectStage",
        editable: isEditable,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: dropdowns?.stages || [],
        },
      },

      {
        headerName: "Description",
        flex: 2,
        field: "taskDescription",
        editable: isEditable,
      },

      {
        headerName: "Planned (min)",
        flex: 1,
        field: "plannedDuration",
        editable: isEditable,
        valueParser: (params) => Number(params.newValue) || 0,
      },

      {
        headerName: "Actual (min)",
        flex: 1,
        field: "actualDuration",
        editable: isEditable,
        valueParser: (params) => Number(params.newValue) || 0,
      },

      {
        headerName: "Status",
        flex: 1,
        field: "status",
        editable: isEditable,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: dropdowns?.statuses || [],
        },
      },
    ],
    [isEditable, dropdowns]
  );

  // Handle cell value changes
  const onCellValueChanged = (params) => {
    if (isEditable && params.data) {
      const newChangedRows = new Set(changedRows);
      newChangedRows.add(params.data.id || params.node.id);
      setChangedRows(newChangedRows);

      if (onRowDataChanged) {
        onRowDataChanged(params.data, params);
      }
    }
  };

  // Handle adding a new row
  const handleAddRow = () => {
    if (onAddRow) {
      const newRow = onAddRow();
      if (newRow && gridRef.current?.api) {
        gridRef.current.api.applyTransaction({ add: [newRow] });
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (!gridRef.current?.api) return;

      const allRows = [];
      gridRef.current.api.forEachNode((node) => {
        allRows.push(node.data);
      });

      console.log("All rows:", allRows);

      const payload = {
        tasks: allRows.map((row) => ({
          // taskId: row.id?.startsWith("existing-")
          //   ? row.id.replace("existing-", "")
          //   : null,
          taskDate: row.taskDate,
          project: row.project,
          projectCategory: row.projectCategory,
          projectStage: row.projectStage,
          plannedDuration: row.plannedDuration,
          actualDuration: row.actualDuration,
          status: row.status,
          taskDescription: row.taskDescription,
        })),
      };

      console.log("Payload:", payload);

      const res = await api.put("/task", payload);
      console.log("API response:", res);

      toast.success("Timesheet saved successfully");
      setChangedRows(new Set());
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Save failed");
    }
  };

  return (
    <div>
      {/* Action buttons - only show if editable */}
      {isEditable && (
        <div className="mb-4 flex justify-between gap-3 items-center">
          <div className="flex gap-2">
            <button
              onClick={handleAddRow}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Add Task
            </button>
            {(changedRows.size > 0 ||
              rowData.some((r) => r.id?.startsWith("new-"))) && (
              <button
                onClick={onSave || handleSave} // Use onSave prop if provided, otherwise use local handleSave
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Save Changes (
                {changedRows.size +
                  rowData.filter((r) => r.id?.startsWith("new-")).length}
                )
              </button>
            )}
          </div>

          <p className="text-red-600 font-medium mt-1">
            Note: Only tasks with dates within this range will be displayed.
          </p>
        </div>
      )}

      {/* AG Grid */}
      <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          theme={themeQuartz}
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
          }}
        />
      </div>
    </div>
  );
}

export default TimesheetGrid;
