"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("active");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

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

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:3500/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks(tasks.filter((task) => task._id !== taskId));
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const toggleTaskCompletion = async (task) => {
    try {
      const response = await fetch(`http://localhost:3500/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...task,
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map((t) => (t._id === task._id ? updatedTask : t)));
      }
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task._id);
    setEditForm({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      priority: task.priority,
    });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditForm({});
  };

  const saveEdit = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:3500/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editForm,
          dueDate: editForm.dueDate || null,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
        setEditingTask(null);
        setEditForm({});
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="roboto-condensed-custom text-2xl">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="roboto-condensed-custom text-4xl mb-8 text-center">
          TaskFlowX
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
                <th className="roboto-condensed-custom text-left p-3 text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
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
                      {editingTask === task._id ? (
                        <select
                          value={editForm.priority}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              priority: e.target.value,
                            })
                          }
                          className="bg-gray-700 text-white px-2 py-1 rounded roboto-condensed-custom"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <span
                          className={`${getPriorityColor(
                            task.priority
                          )} px-3 py-1 rounded text-black roboto-condensed-custom font-semibold capitalize`}
                        >
                          {task.priority}
                        </span>
                      )}
                    </td>
                    <td className="p-3 roboto-condensed-custom">
                      {editingTask === task._id ? (
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className="bg-gray-700 text-white px-2 py-1 rounded w-full roboto-condensed-custom"
                        />
                      ) : (
                        task.title
                      )}
                    </td>
                    <td className="p-3 roboto-condensed-custom max-w-xs">
                      {editingTask === task._id ? (
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          className="bg-gray-700 text-white px-2 py-1 rounded w-full roboto-condensed-custom"
                          placeholder="Description"
                        />
                      ) : (
                        <span className="truncate block">
                          {task.description || "-"}
                        </span>
                      )}
                    </td>
                    <td className="p-3 roboto-condensed-custom">
                      {editingTask === task._id ? (
                        <input
                          type="date"
                          value={editForm.dueDate}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              dueDate: e.target.value,
                            })
                          }
                          className="bg-gray-700 text-white px-2 py-1 rounded roboto-condensed-custom"
                        />
                      ) : (
                        formatDate(task.dueDate)
                      )}
                    </td>
                    <td className="p-3 roboto-condensed-custom">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            task.completed
                              ? "bg-green-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {task.completed ? "Yes" : "No"}
                        </span>
                        <button
                          onClick={() => toggleTaskCompletion(task)}
                          className={`w-6 h-6 rounded-full border-2 border-white ${
                            task.completed ? "bg-green-500" : "bg-transparent"
                          } hover:bg-green-500 transition-colors`}
                        >
                          {task.completed && (
                            <svg
                              className="w-3 h-3 text-white mx-auto"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-3 roboto-condensed-custom">
                      {formatDate(task.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {editingTask === task._id ? (
                          <>
                            <button
                              onClick={() => saveEdit(task._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm roboto-condensed-custom"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm roboto-condensed-custom"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(task)}
                              className="text-blue-400 hover:text-blue-300 p-1"
                              title="Edit task"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteTask(task._id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete task"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
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
