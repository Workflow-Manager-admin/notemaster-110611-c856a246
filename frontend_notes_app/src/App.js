import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  // --- THEME SETUP ---
  // Try to load theme from localStorage or use 'light' by default
  const getInitialTheme = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved && (saved === "light" || saved === "dark")) return saved;
    }
    return "light";
  };
  const [theme, setTheme] = useState(getInitialTheme);

  // Set document data-theme attribute on theme change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Colors (for inline styles if needed)
  const COLORS = {
    primary: "#1976d2",
    secondary: "#424242",
    accent: "#ff4081",
  };

  // Categories: Simple flat list, customizable here
  const DEFAULT_CATEGORIES = ["All notes", "Work", "Personal", "Ideas"];

  // Note = { id, title, content, category, created, updated }
  // --- STATE ---
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // null for create
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load notes from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("notes");
    if (raw) setNotes(JSON.parse(raw));
  }, []);

  // Persist notes anytime they change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // --- NOTE FILTERING ---
  const filteredNotes = notes
    .filter((n) =>
      category === "All notes" ? true : n.category === category
    )
    .filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.updated - a.updated);

  // --- HANDLERS ---
  // PUBLIC_INTERFACE
  const openModalForNew = () => {
    setEditingNote(null);
    setModalOpen(true);
  };
  // PUBLIC_INTERFACE
  const openModalToEdit = (note) => {
    setEditingNote(note);
    setModalOpen(true);
  };
  // PUBLIC_INTERFACE
  const closeModal = () => {
    setModalOpen(false);
    setEditingNote(null);
  };
  // PUBLIC_INTERFACE
  const saveNote = (noteData) => {
    if (noteData.id) {
      // Edit
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteData.id ? { ...noteData, updated: Date.now() } : n
        )
      );
    } else {
      // Create
      setNotes((prev) => [
        ...prev,
        {
          ...noteData,
          id: Date.now().toString(),
          created: Date.now(),
          updated: Date.now(),
        },
      ]);
    }
    closeModal();
  };
  // PUBLIC_INTERFACE
  const deleteNote = (noteId) => {
    if (
      window.confirm(
        "Delete this note permanently? This action cannot be undone."
      )
    ) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      closeModal();
    }
  };
  // PUBLIC_INTERFACE
  const selectCategory = (cat) => setCategory(cat);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // --- RENDER ---
  return (
    <div className="notes-app-root">
      <Sidebar
        categories={DEFAULT_CATEGORIES}
        currentCategory={category}
        onSelect={selectCategory}
        accent={COLORS.accent}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main className="notes-main">
        <NotesHeader
          search={search}
          setSearch={setSearch}
          onNewNote={openModalForNew}
          accent={COLORS.accent}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <NotesList notes={filteredNotes} onSelect={openModalToEdit} />
      </main>
      {modalOpen && (
        <NoteModal
          note={editingNote}
          onSave={saveNote}
          onDelete={deleteNote}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// --- SIDEBAR COMPONENT ---
function Sidebar({
  categories,
  currentCategory,
  onSelect,
  accent,
  sidebarOpen,
  setSidebarOpen,
}) {
  // Responsive: Hide on small screens
  return (
    <nav
      className={`sidebar${sidebarOpen ? "" : " sidebar-closed"}`}
      aria-label="Note Categories"
      tabIndex={-1}
    >
      <div className="sidebar-header">
        <span className="sidebar-title">Categories</span>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          style={{ color: accent }}
        >
          {sidebarOpen ? "←" : "☰"}
        </button>
      </div>
      <ul className="sidebar-list">
        {categories.map((cat) => (
          <li key={cat}>
            <button
              className={
                cat === currentCategory
                  ? "sidebar-cat active"
                  : "sidebar-cat"
              }
              style={
                cat === currentCategory
                  ? { color: accent }
                  : {}
              }
              onClick={() => onSelect(cat)}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// --- HEADER COMPONENT ---
// Add theme toggle button to right of search
function NotesHeader({ search, setSearch, onNewNote, accent, sidebarOpen, setSidebarOpen, theme = "light", onToggleTheme }) {
  return (
    <div className="main-header">
      <div className="main-header-left">
        {!sidebarOpen && (
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={"Open sidebar"}
            style={{ color: accent, fontSize: "1.3em" }}
          >
            ☰
          </button>
        )}
        <h1 className="main-title">Notes</h1>
      </div>
      <div className="main-header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.7em' }}>
        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          aria-label="Search notes"
        />
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle dark/light theme"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "1.29em",
            color: "var(--primary)",
            marginRight: 2,
            outline: "none",
            borderRadius: "6px",
            transition: "background 0.15s"
          }}
        >
          {/* Use icons for moon/sun depending on theme */}
          {theme === "light" ? (
            <span role="img" aria-label="Dark mode" style={{filter: "grayscale(.30)"}}>🌑</span>
          ) : (
            <span role="img" aria-label="Light mode">🌕</span>
          )}
        </button>
        <button
          className="new-note-btn"
          style={{ background: accent }}
          onClick={onNewNote}
        >
          + New Note
        </button>
      </div>
    </div>
  );
}

// --- NOTES LIST COMPONENT ---
function NotesList({ notes, onSelect }) {
  if (notes.length === 0) {
    return (
      <div className="notes-list-empty">
        <em>No notes found.</em>
      </div>
    );
  }
  return (
    <ul className="notes-list">
      {notes.map((n) => (
        <li
          className="note-item"
          key={n.id}
          onClick={() => onSelect(n)}
          tabIndex={0}
        >
          <div className="note-title">{n.title || <em>(Untitled)</em>}</div>
          <div className="note-snippet">
            {(n.content.length > 60
              ? n.content.slice(0, 60) + "…"
              : n.content) || <span className="light-text">(No content)</span>}
          </div>
          <div className="note-meta">
            <span>
              {n.category ? n.category : "Uncategorized"}
            </span>
            <span>
              {new Date(n.updated).toLocaleDateString()}{" "}
              {new Date(n.updated).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// --- MODAL COMPONENT ---
function NoteModal({ note, onSave, onDelete, onClose }) {
  // Local state for form fields
  const isEdit = !!note;
  const [title, setTitle] = useState(note ? note.title : "");
  const [content, setContent] = useState(note ? note.content : "");
  const [category, setCategory] = useState(note ? note.category : "All notes");

  // Focus dialog for accessibility
  const modalRef = useCallback((node) => {
    if (node) node.focus();
  }, []);

  // Escape key closes
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // PUBLIC_INTERFACE
  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    onSave({
      ...(note || {}),
      title: title.trim(),
      content: content.trim(),
      category: category,
    });
  };

  // PUBLIC_INTERFACE
  const handleDelete = () => {
    if (isEdit && note && note.id) onDelete(note.id);
  };

  return (
    <div className="modal-overlay" tabIndex={-1}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit Note" : "Create Note"}
        ref={modalRef}
        tabIndex={0}
      >
        <form className="modal-form" onSubmit={handleSave}>
          <h2 style={{ marginBottom: 12 }}>
            {isEdit ? "Edit Note" : "New Note"}
          </h2>
          <input
            className="title-input"
            autoFocus
            value={title}
            placeholder="Title"
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Note Title"
            style={{ fontWeight: 500 }}
          />
          <textarea
            className="content-input"
            rows={8}
            value={content}
            placeholder="Your note..."
            onChange={(e) => setContent(e.target.value)}
            aria-label="Note Content"
          />
          <select
            className="category-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Note Category"
          >
            {["All notes", "Work", "Personal", "Ideas"].map((c) => (
              <option value={c} key={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="modal-actions">
            <button
              type="submit"
              className="modal-save-btn"
              style={{ background: "#1976d2" }}
            >
              {isEdit ? "Save" : "Create"}
            </button>
            {isEdit && (
              <button
                type="button"
                className="modal-delete-btn"
                style={{ background: "#ff4081" }}
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              className="modal-cancel-btn"
              style={{ background: "#424242" }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
