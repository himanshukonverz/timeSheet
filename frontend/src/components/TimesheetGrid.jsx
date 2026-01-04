import React, { useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

function TimesheetGrid({
  rowData = [],
  isEditable = false,
  onRowDataChanged = null,
  onAddRow = null,
  onSave = null,
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
      },
      {
        headerName: "Project",
        flex: 1,
        field: "projectName",
        editable: isEditable,
      },
      {
        headerName: "Category",
        flex: 1,
        field: "projectCategory",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["implementation", "integration", "AMS"],
        },
        editable: isEditable,
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
        editable: isEditable,
      },
      {
        headerName: "Description",
        flex: 1,
        field: "taskDescription",
        editable: isEditable,
      },
      {
        headerName: "Planned (min)",
        flex: 1,
        field: "plannedDuration",
        editable: isEditable,
      },
      {
        headerName: "Actual (min)",
        flex: 1,
        field: "actualDuration",
        editable: isEditable,
      },
      {
        headerName: "Status",
        flex: 1,
        field: "status",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["in_progress", "completed", "cancelled"],
        },
        editable: isEditable,
      },
    ],
    [isEditable]
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
  const handleSave = () => {
    if (onSave && changedRows.size > 0) {
      const changedData = rowData.filter((row) => changedRows.has(row.id));
      onSave(changedData, changedRows);
      setChangedRows(new Set());
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
            {changedRows.size > 0 && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Save Changes ({changedRows.size})
              </button>
            )}
          </div>

          <p className="text-red-600 font-medium mt-1 ">
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
