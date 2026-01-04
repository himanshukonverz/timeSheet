import React, { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { useNavigate } from "react-router-dom";
import { Pencil, UserPlus, Check } from "lucide-react";
import AnalyticsCard from "../components/AnalyticsCard";
import { useAuth } from "../context/AuthContext";

/* ---------------- Dummy Data ---------------- */

const projects = [
  {
    _id: "1",
    projectName: "Project Alpha",
    startDate: "2025-10-01",
    goLiveDate: "2026-01-15",
    status: "in-progress",
    contributors: [
      {
        user: { _id: "u1", name: "John Doe" },
        projectRole: "Engagement Manager",
        hasEditAccess: true,
      },
    ],
  },
  {
    _id: "2",
    projectName: "Project Beta",
    startDate: "2025-08-01",
    goLiveDate: "2025-12-01",
    status: "completed",
    contributors: [],
  },
];

const STATUS_OPTIONS = ["upcoming", "in-progress", "completed"];

function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const gridRef = useRef(null);
  const [editingRowId, setEditingRowId] = useState(null);

  /* ---------------- Permissions ---------------- */

  const canEditProject = (project) => {
    if (user.role === "admin") return true;

    return project.contributors.some(
      (c) => c.user._id === user._id && c.hasEditAccess
    );
  };

  /* ---------------- Analytics ---------------- */

  const analytics = useMemo(() => ({
    completed: projects.filter((p) => p.status === "completed").length,
    upcoming: projects.filter((p) => p.status === "upcoming").length,
    inProgress: projects.filter((p) => p.status === "in-progress").length,
  }), []);

  /* ---------------- Columns ---------------- */

  const columnDefs = useMemo(() => [
    {
      headerName: "Project Name",
      field: "projectName",
      flex: 1.5,
    },

    {
      headerName: "Start Date",
      field: "startDate",
      flex: 1,
      editable: (params) =>
        params.context.editingRowId === params.data._id,
      cellEditor: "agDateCellEditor",
      valueFormatter: (p) =>
        p.value ? new Date(p.value).toLocaleDateString() : "-",
    },

    {
      headerName: "Go Live Date",
      field: "goLiveDate",
      flex: 1,
      editable: (params) =>
        params.context.editingRowId === params.data._id,
      cellEditor: "agDateCellEditor",
      valueFormatter: (p) =>
        p.value ? new Date(p.value).toLocaleDateString() : "-",
    },

    {
      headerName: "Status",
      field: "status",
      flex: 1,
      editable: (params) =>
        params.context.editingRowId === params.data._id,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: STATUS_OPTIONS,
      },
    },

    {
      headerName: "Actions",
      flex: 1,
      cellRenderer: (params) => {
        const editable = canEditProject(params.data);
        const isEditing = params.context.editingRowId === params.data._id;

        return (
          <div className="flex items-center mt-2 gap-3">
            {/* Edit */}
            {editable && !isEditing && (
              <button
                onClick={() => {
                  setEditingRowId(params.data._id);

                  setTimeout(() => {
                    gridRef.current.api.refreshCells({ force: true });

                    gridRef.current.api.startEditingCell({
                      rowIndex: params.node.rowIndex,
                      colKey: "startDate",
                    });
                  }, 0);
                }}
                className="text-blue-600 hover:scale-110"
              >
                <Pencil size={16} />
              </button>
            )}

            {/* Save */}
            {editable && isEditing && (
              <button
                onClick={() => {
                  gridRef.current.api.stopEditing();
                  setEditingRowId(null);
                  gridRef.current.api.refreshCells({ force: true });
                }}
                className="text-green-600 hover:scale-110"
              >
                <Check size={16} />
              </button>
            )}

            {/* Add Contributor */}
            {editable && !isEditing && (
              <button
                onClick={() =>
                  navigate(`/projects/${params.data._id}/contributors`)
                }
                className="text-gray-700 hover:scale-110"
              >
                <UserPlus size={16} />
              </button>
            )}

            {!editable && (
              <span className="text-gray-400 text-sm">No Access</span>
            )}
          </div>
        );
      },
    },
  ], [editingRowId, user]);

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>

        {user.role === "admin" && (
          <button
            onClick={() => navigate("/add-new-project")}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            + Add Project
          </button>
        )}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <AnalyticsCard title="Completed Projects" value={analytics.completed} />
        <AnalyticsCard title="In Progress Projects" value={analytics.inProgress} />
        <AnalyticsCard title="Upcoming Projects" value={analytics.upcoming} />
      </div>

      {/* Table */}
      <div className="ag-theme-quartz" style={{ height: 500 }}>
        <AgGridReact
          ref={gridRef}
          theme={themeQuartz}
          rowData={projects}
          columnDefs={columnDefs}
          context={{ editingRowId }}
          suppressClickEdit={true}
          stopEditingWhenCellsLoseFocus={false}
          singleClickEdit={true}
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