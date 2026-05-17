import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const emptyForm = {
  title: '',
  content: '',
  categoryNames: [],
}

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error('The action could not be completed. Please check the API and try again.')
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function App() {
  const [activeNotes, setActiveNotes] = useState([])
  const [archivedNotes, setArchivedNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [view, setView] = useState('active')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [form, setForm] = useState(emptyForm)
  const [categoryInput, setCategoryInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const notesForView = view === 'active' ? activeNotes : archivedNotes
  const visibleNotes =
    selectedCategory === 'all'
      ? notesForView
      : notesForView.filter((note) =>
          note.categories.some((category) => category.name === selectedCategory),
        )
  const editingNote = useMemo(
    () => [...activeNotes, ...archivedNotes].find((note) => note.id === editingId),
    [activeNotes, archivedNotes, editingId],
  )

  const loadNotes = useCallback(async () => {
    setError('')
    setIsLoading(true)

    try {
      const [active, archived, loadedCategories] = await Promise.all([
        request('/notes'),
        request('/notes/archived'),
        request('/notes/categories'),
      ])

      setActiveNotes(active)
      setArchivedNotes(archived)
      setCategories(loadedCategories)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadNotes()
    }, 0)

    return () => window.clearTimeout(loadTimer)
  }, [loadNotes])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function startEditing(note) {
    setEditingId(note.id)
    setForm({
      title: note.title,
      content: note.content,
      categoryNames: note.categories.map((category) => category.name),
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setCategoryInput('')
  }

  function addCategory(event) {
    event.preventDefault()

    const categoryName = categoryInput.trim().toLowerCase()

    if (!categoryName || form.categoryNames.includes(categoryName)) {
      setCategoryInput('')
      return
    }

    setForm((current) => ({
      ...current,
      categoryNames: [...current.categoryNames, categoryName],
    }))
    setCategoryInput('')
  }

  function removeCategory(categoryName) {
    setForm((current) => ({
      ...current,
      categoryNames: current.categoryNames.filter((name) => name !== categoryName),
    }))
  }

  async function saveNote(event) {
    event.preventDefault()

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      categoryNames: form.categoryNames,
    }

    if (!payload.title || !payload.content) {
      setError('Please complete the title and content before saving.')
      return
    }

    setError('')
    setIsSaving(true)

    try {
      if (editingId) {
        await request(`/notes/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await request('/notes', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }

      resetForm()
      await loadNotes()
      setView(editingNote?.archived ? 'archived' : 'active')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function archiveNote(note) {
    setError('')

    try {
      await request(`/notes/${note.id}/archive`, { method: 'PATCH' })
      await loadNotes()
      if (editingId === note.id) {
        resetForm()
      }
    } catch (archiveError) {
      setError(archiveError.message)
    }
  }

  async function unarchiveNote(note) {
    setError('')

    try {
      await request(`/notes/${note.id}/unarchive`, { method: 'PATCH' })
      await loadNotes()
      setView('active')
    } catch (unarchiveError) {
      setError(unarchiveError.message)
    }
  }

  async function deleteNote(note) {
    setError('')

    if (!window.confirm(`Delete "${note.title}"?`)) {
      return
    }

    try {
      await request(`/notes/${note.id}`, { method: 'DELETE' })
      await loadNotes()
      if (editingId === note.id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="Summary">
        <div>
          <p className="eyebrow">Notes desk</p>
          <h1>Notes</h1>
        </div>

        <div className="metric-grid">
          <div>
            <span>{activeNotes.length}</span>
            <p>Active</p>
          </div>
          <div>
            <span>{archivedNotes.length}</span>
            <p>Archived</p>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Views">
          <button
            className={view === 'active' ? 'selected' : ''}
            type="button"
            onClick={() => setView('active')}
          >
            Active
          </button>
          <button
            className={view === 'archived' ? 'selected' : ''}
            type="button"
            onClick={() => setView('archived')}
          >
            Archive
          </button>
        </nav>

        <div className="category-filter">
          <p className="eyebrow">Category filter</p>
          <button
            className={selectedCategory === 'all' ? 'selected' : ''}
            type="button"
            onClick={() => setSelectedCategory('all')}
          >
            All categories
          </button>
          {categories.map((category) => (
            <button
              className={selectedCategory === category.name ? 'selected' : ''}
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </aside>

      <section className="workspace">
        <div className="topbar">
          <div>
            <p className="eyebrow">{view === 'active' ? 'Current work' : 'History'}</p>
            <h2>{view === 'active' ? 'Active notes' : 'Archived notes'}</h2>
          </div>
        </div>

        {error && <p className="notice">{error}</p>}

        <div className="content-grid">
          <form className="editor" onSubmit={saveNote}>
            <div className="editor-head">
              <div>
                <p className="eyebrow">{editingId ? 'Editing' : 'New note'}</p>
                <h3>{editingId ? form.title || 'Untitled' : 'Write an idea'}</h3>
              </div>
              {editingId && (
                <button className="text-button" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>

            <label>
              Title
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="Example: Sprint tasks"
              />
            </label>

            <label>
              Content
              <textarea
                name="content"
                value={form.content}
                onChange={updateField}
                placeholder="Write a clear and useful note..."
                rows="9"
              />
            </label>

            <div className="category-editor">
              <label htmlFor="categoryName">Categories</label>
              <div className="category-input-row">
                <input
                  id="categoryName"
                  value={categoryInput}
                  onChange={(event) => setCategoryInput(event.target.value)}
                  placeholder="Example: work"
                />
                <button type="button" onClick={addCategory}>
                  Add
                </button>
              </div>
              {form.categoryNames.length > 0 && (
                <div className="chip-list" aria-label="Selected categories">
                  {form.categoryNames.map((categoryName) => (
                    <button
                      className="chip removable"
                      key={categoryName}
                      type="button"
                      onClick={() => removeCategory(categoryName)}
                    >
                      {categoryName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="primary-button" disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Create note'}
            </button>
          </form>

          <section className="note-list" aria-live="polite">
            {isLoading ? (
              <p className="empty-state">Loading notes...</p>
            ) : visibleNotes.length === 0 ? (
              <p className="empty-state">
                {selectedCategory === 'all'
                  ? view === 'active'
                    ? 'There are no active notes yet.'
                    : 'There are no archived notes.'
                  : 'There are no notes in this category.'}
              </p>
            ) : (
              visibleNotes.map((note) => (
                <article className="note-card" key={note.id}>
                  <header>
                    <div>
                      <h3>{note.title}</h3>
                      <time dateTime={note.updatedAt}>
                        {new Intl.DateTimeFormat('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(note.updatedAt))}
                      </time>
                    </div>
                  </header>

                  <p>{note.content}</p>

                  {note.categories.length > 0 && (
                    <div className="chip-list" aria-label="Note categories">
                      {note.categories.map((category) => (
                        <span className="chip" key={category.id}>
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <footer>
                    <button type="button" onClick={() => startEditing(note)}>
                      Edit
                    </button>
                    {note.archived ? (
                      <button type="button" onClick={() => unarchiveNote(note)}>
                        Restore
                      </button>
                    ) : (
                      <button type="button" onClick={() => archiveNote(note)}>
                        Archive
                      </button>
                    )}
                    <button className="danger" type="button" onClick={() => deleteNote(note)}>
                      Delete
                    </button>
                  </footer>
                </article>
              ))
            )}
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
