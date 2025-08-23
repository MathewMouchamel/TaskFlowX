"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("active");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:3500/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeTasks = tasks.filter((task) => !task.completed);
  const closedTasks = tasks.filter((task) => task.completed);
  const currentTasks = activeTab === "active" ? activeTasks : closedTasks;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="roboto-condensed-custom text-2xl">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="roboto-condensed-custom text-4xl mb-8 text-center">
          TaskFlowX Dashboard
        </h1>

        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("active")}
            className={`roboto-condensed-custom px-6 py-3 text-lg ${
              activeTab === "active"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            My Active Tasks ({activeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`roboto-condensed-custom px-6 py-3 text-lg ml-6 ${
              activeTab === "closed"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            My Closed Tasks ({closedTasks.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="roboto-condensed-custom text-left p-3 text-gray-400">
                  Priority
                </th>
                <th className="roboto-condensed-custom text-left p-3 text-gray-400">
                  Title
                </th>
                <th className="roboto-condensed-custom text-left p-3 text-gray-400">
                  Description
                </th>
                <th className="roboto-condensed-custom text-left p-3 text-gray-400">
                  Due Date
                </th>
                <th className="roboto-condensed-custom text-left p-3 text-gray-400">
                  Completed
                </th>
                <th className="roboto-condensed-custom text-left p-3 text-gray-400">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="roboto-condensed-custom text-center p-8 text-gray-500"
                  >
                    No {activeTab} tasks found
                  </td>
                </tr>
              ) : (
                currentTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b border-gray-800 hover:bg-gray-900"
                  >
                    <td className="p-3">
                      <span
                        className={`${getPriorityColor(
                          task.priority
                        )} px-3 py-1 rounded text-black roboto-condensed-custom font-semibold capitalize`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3 roboto-condensed-custom">
                      {task.title}
                    </td>
                    <td className="p-3 roboto-condensed-custom max-w-xs truncate">
                      {task.description || "-"}
                    </td>
                    <td className="p-3 roboto-condensed-custom">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="p-3 roboto-condensed-custom">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          task.completed
                            ? "bg-green-600 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {task.completed ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3 roboto-condensed-custom">
                      {formatDate(task.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
