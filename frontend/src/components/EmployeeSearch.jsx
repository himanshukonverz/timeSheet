import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import api from "../api/axios";

function EmployeeSearch({ onSelect, selectedEmployee }) {
  const [query, setQuery] = useState("");
  // Sync query with selectedEmployee when it changes (e.g., reset)
  useEffect(() => {
     if (!selectedEmployee) {
         setQuery("");
     } else {
         setQuery(selectedEmployee.name);
     }
  }, [selectedEmployee]);

  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch matching users
  useEffect(() => {
    // Prevent searching if query matches selected employee (avoids re-search on selection)
    if (!debouncedQuery || (selectedEmployee && debouncedQuery === selectedEmployee.name)) {
      setResults([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get(`/user/search?q=${debouncedQuery}`);
        setResults(res.data.data);
        setShowDropdown(true);
      } catch (error) {
        console.log("search failed - ", error);
      }
    };

    fetchUsers();
  }, [debouncedQuery, selectedEmployee]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search employee..."
        value={query}
        onChange={(e) => {
            setQuery(e.target.value);
            // If user clears input manually, notify parent
            if (e.target.value === "") {
                onSelect(null);
            }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-md overflow-hidden shadow-md mt-1">
          {results.map((user) => (
            <div
              key={user._id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(user);
                setQuery(user.name); // Handled by useEffect now
                setShowDropdown(false);
              }}
            >
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-500">{user.empId}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeSearch;