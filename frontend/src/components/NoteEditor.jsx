import React, { useState } from 'react';

// Props: note (string), highlight (object), saveNote (async fn), onClose (fn)
const NoteEditor = ({ note, highlight, saveNote, onClose }) => {
  const [value, setValue] = useState(note || '');
  const [editing, setEditing] = useState(!note); // If no note, start in editing mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setValue(note || '');
    setError('');
    if (onClose) onClose();
  };
  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveNote(highlight, value);
      setEditing(false);
      if (onClose) onClose();
    } catch (err) {
      setError('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <div className="note-viewer flex flex-col gap-4 items-stretch" >
        <div className="note-text px-3 py-2 bg-gray-50 rounded border border-gray-200 text-gray-700 min-h-[48px]" style={{zIndex: 1200}}>
          {note ? note : <em className="text-gray-400">No note</em>}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="note-edit-btn px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={handleEdit}
          >Edit Note</button>
          <button
            className="note-cancel-btn px-4 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
            onClick={onClose}
          >Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor flex flex-col gap-4">
      <label className="font-semibold text-gray-700">Note</label>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        rows={4}
        className="note-textarea w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-50 resize-none shadow-sm"
        placeholder="Write your note here..."
        disabled={loading}
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="note-actions flex gap-2 justify-end">
        <button
          className="note-save-btn px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          className="note-cancel-btn px-4 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
          onClick={handleCancel}
          disabled={loading}
        >Cancel</button>
      </div>
    </div>
  );
};

export default NoteEditor;
