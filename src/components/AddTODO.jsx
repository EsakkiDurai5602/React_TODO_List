import { useState, useEffect, useRef } from "react";
import "./AddTODO.css";

function AddTODO() {
  const [todo, setTodo] = useState(() => {
    const saved = localStorage.getItem("todos");

    if (!saved) return [];

    try {
      return JSON.parse(saved).map((t) => ({
        id: t.id || Date.now(),
        text: t.text || "",
        completed: t.completed || false,
        dueDate: t.dueDate || "",
        priority: t.priority || "Medium",
        createdAt: t.createdAt || new Date(),
        updatedAt: t.updatedAt || null
      }));
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("newest");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const inputRef = useRef();

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todo));
  }, [todo]);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;

    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const add_todo = () => {
    if (input.trim() === "") return;

    if (editIndex !== null) {
      const updated = [...todo];

      updated[editIndex] = {
        ...updated[editIndex],
        text: input,
        dueDate: date,
        priority: priority,
        updatedAt: new Date()
      };

      setTodo(updated);
      setEditIndex(null);
    } else {
      setTodo([
        {
          id: Date.now(),
          text: input,
          completed: false,
          dueDate: date,
          priority: priority,
          createdAt: new Date(),
          updatedAt: null
        },
        ...todo
      ]);
    }

    setInput("");
    setDate("");
    setPriority("Medium");

    inputRef.current.focus();
  };

  const completedtodo = (index) => {
    const updated = [...todo];
    updated[index].completed = !updated[index].completed;
    setTodo(updated);
  };

  const edit_todo = (index) => {
    setInput(todo[index].text);
    setDate(todo[index].dueDate);
    setPriority(todo[index].priority);
    setEditIndex(index);

    inputRef.current.focus();
  };

  const delete_todo = (index) => {
    if (window.confirm("Delete this task?")) {
      setTodo(todo.filter((_, i) => i !== index));
    }
  };

  const clearAll = () => {
    if (window.confirm("Clear all tasks?")) {
      setTodo([]);
    }
  };

  const completedCount = todo.filter((t) => t.completed).length;
  const remainingCount = todo.length - completedCount;

  const progress =
    todo.length === 0
      ? 0
      : Math.round((completedCount / todo.length) * 100);

  const filteredTodos = todo
    .filter((t) =>
      (t.text || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((t) => {
      if (filter === "completed") return t.completed;
      if (filter === "pending") return !t.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortType === "newest") return b.id - a.id;
      if (sortType === "oldest") return a.id - b.id;
      if (sortType === "priority") {
        const order = { High: 1, Medium: 2, Low: 3 };
        return order[a.priority] - order[b.priority];
      }
      if (sortType === "date") {
        return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
      }
      return 0;
    });

  return (
    <div className="container">
      <h1 className="title">TODO APP</h1>

      <button
        className="add-btn"
        onClick={() =>
          setTheme(theme === "dark" ? "light" : "dark")
        }
      >
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>

      <p className="counter">
        Total: {todo.length} | Completed: {completedCount} | Remaining: {remainingCount}
      </p>

      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${progress}%` }}
        >
          {progress}%
        </div>
      </div>

      <input
        type="text"
        placeholder="Search task..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="task-input"
      />

      <div className="input-section">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add_todo();
          }}
          type="text"
          placeholder="Enter your task..."
          className="task-input"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="task-input"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="task-input"
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="task-input"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priority">Priority</option>
          <option value="date">Due Date</option>
        </select>

        <button
          onClick={add_todo}
          className="add-btn"
        >
          {editIndex !== null ? "EDIT" : "ADD"}
        </button>
      </div>

      <div className="filter-section">
        <button onClick={() => setFilter("all")}>
          All
        </button>

        <button onClick={() => setFilter("completed")}>
          Completed
        </button>

        <button onClick={() => setFilter("pending")}>
          Pending
        </button>

        <button onClick={clearAll}>
          Clear All
        </button>
      </div>

      <ul className="todo-list">
        {filteredTodos.length === 0 && (
          <p className="empty">No tasks found</p>
        )}

        {filteredTodos.map((t, index) => (
          <li key={t.id} className="todo-item">
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => completedtodo(index)}
            />

            <div className="todo-text">
              <span
                className={`priority-${(t.priority || "medium").toLowerCase()} ${
                  t.completed ? "completed" : "pending"
                } ${isOverdue(t.dueDate) ? "overdue" : ""}`}
              >
                {t.text}
              </span>

              {t.dueDate && (
                <div className="meta">
                  Due: {t.dueDate}
                </div>
              )}

              {t.createdAt && (
                <div className="meta">
                  Created: {new Date(t.createdAt).toLocaleString()}
                </div>
              )}

              {t.updatedAt && (
                <div className="meta">
                  Updated: {new Date(t.updatedAt).toLocaleString()}
                </div>
              )}
            </div>

            <div className="todo-actions">
              <button
                className="delete-btn"
                onClick={() => delete_todo(index)}
              >
                Delete
              </button>

              {!t.completed && (
                <button
                  className="edit-btn"
                  onClick={() => edit_todo(index)}
                >
                  Edit
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AddTODO;
