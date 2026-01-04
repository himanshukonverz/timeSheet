import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import api from "../api/axios";

function EmployeeSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 400);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch matching users
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const fetchUsers = async () => {
    //   const res = await api.get(`/users/search?q=${debouncedQuery}`);
    //   setResults(res.data.data);
      setShowDropdown(true);
    };

    fetchUsers();
  }, [debouncedQuery]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search employee..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-md shadow-md mt-1">
          {results.map((user) => (
            <div
              key={user._id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(user);
                setQuery(user.name);
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