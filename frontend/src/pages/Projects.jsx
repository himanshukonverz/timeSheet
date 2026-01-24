import React, { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { useNavigate } from "react-router-dom";
import { Pencil, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ---------------- Dummy Data ---------------- */

const initialProjects = [
  {
    _id: "1",
    projectName: "Project Alpha",
  },
  {
    _id: "2",
    projectName: "Project Beta",
  },
];

function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const gridRef = useRef(null);

  const [projects, setProjects] = useState(initialProjects);
  const [editingRowId, setEditingRowId] = useState(null);

  /* ---------------- Columns ---------------- */

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Project Name",
        field: "projectName",
        flex: 2,
        editable: (params) =>
          params.context.editingRowId === params.data._id,
      },

      {
        headerName: "Edit",
        flex: 1,
        cellRenderer: (params) => {
          const isEditing =
            params.context.editingRowId === params.data._id;

          return (
            <div className="flex items-center gap-3 mt-1">
              {/* Edit */}
              {!isEditing && (
                <button
                  onClick={() => {
                    setEditingRowId(params.data._id);

                    setTimeout(() => {
                      gridRef.current.api.startEditingCell({
                        rowIndex: params.node.rowIndex,
                        colKey: "projectName",
                      });
                    }, 0);
                  }}
                  className="text-blue-600 hover:scale-110"
                >
                  <Pencil size={16} />
                </button>
              )}

              {/* Save */}
              {isEditing && (
                <button
                  onClick={() => {
                    gridRef.current.api.stopEditing();
                    setEditingRowId(null);
                  }}
                  className="text-green-600 hover:scale-110"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  /* ---------------- Grid Events ---------------- */

  const onCellValueChanged = (params) => {
    setProjects((prev) =>
      prev.map((p) =>
        p._id === params.data._id ? params.data : p
      )
    );
  };

  /* ---------------- Guard: Admin Only ---------------- */

  if (user.role !== "admin") {
    return (
      <div className="p-6 text-red-600 font-medium">
        Access Denied
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>

        <button
          onClick={() => navigate("/add-new-project")}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          + Add Project
        </button>
      </div>

      {/* Table */}
      <div className="ag-theme-quartz" style={{ height: 400 }}>
        <AgGridReact
          ref={gridRef}
          theme={themeQuartz}
          rowData={projects}
          columnDefs={columnDefs}
          context={{ editingRowId }}
          suppressClickEdit={true}
          singleClickEdit={true}
          stopEditingWhenCellsLoseFocus={false}
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
        />
      </div>
    </div>
  );
}

export default Projects;