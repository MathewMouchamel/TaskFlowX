"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "../components/Login";
import NotificationBell from "../components/NotificationBell";

export default function Home() {
  const { currentUser, logout, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
  });

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser]);

  const fetchTasks = async () => {
    if (!currentUser) return;

    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3500/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    // Fix timezone issue by parsing the date correctly
    const date = new Date(dateString);
    // Add timezone offset to prevent day-behind issue
    const timeZoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + timeZoneOffset);
    return localDate.toLocaleDateString();
  };

  const deleteTask = async (taskId) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3500/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const token = await getToken();
      const response = await fetch(`http://localhost:3500/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      priority: task.priority,
    });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditForm({});
  };

  const saveEdit = async (taskId) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3500/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  const createTask = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3500/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...createForm,
          dueDate: createForm.dueDate || null,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
        setShowCreateModal(false);
        setCreateForm({
          title: "",
          description: "",
          dueDate: "",
          priority: "medium",
        });
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  if (!currentUser) {
    return <Login />;
  }

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="roboto-condensed-custom text-4xl">TaskFlowX</h1>
          <div className="flex items-center gap-4">
            <NotificationBell currentUser={currentUser} getToken={getToken} />
            <span className="roboto-condensed-custom text-lg">
              {currentUser.displayName}
            </span>
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            <button
              onClick={logout}
              className="roboto-condensed-custom bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("active")}
            className={`roboto-condensed-custom px-6 py-3 text-lg ${
              activeTab === "active"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400 hover:text-white cursor-pointer"
            }`}
          >
            My Active Tasks ({activeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`roboto-condensed-custom px-6 py-3 text-lg ml-6 ${
              activeTab === "closed"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400 hover:text-white cursor-pointer"
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
                          } hover:bg-green-500 transition-colors cursor-pointer`}
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
                              className="text-blue-400 hover:text-blue-300 p-1 cursor-pointer"
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
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
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

        {/* New Task Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="roboto-condensed-custom bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-colors shadow-lg cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Task
          </button>
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="roboto-condensed-custom text-2xl">
                  Create New Task
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="roboto-condensed-custom text-sm text-gray-300 block mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, title: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded roboto-condensed-custom"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="roboto-condensed-custom text-sm text-gray-300 block mb-2">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded roboto-condensed-custom h-20 resize-none"
                    placeholder="Enter task description"
                  />
                </div>

                <div>
                  <label className="roboto-condensed-custom text-sm text-gray-300 block mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={createForm.dueDate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, dueDate: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded roboto-condensed-custom"
                  />
                </div>

                <div>
                  <label className="roboto-condensed-custom text-sm text-gray-300 block mb-2">
                    Priority
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, priority: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded roboto-condensed-custom"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="roboto-condensed-custom flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createTask}
                  disabled={!createForm.title.trim()}
                  className="roboto-condensed-custom flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
