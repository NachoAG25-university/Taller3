import React, { useState } from 'react';

const TaskItem = ({ task, onToggleComplete, onDelete, onEdit, categories = [], existingTags = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editCategory, setEditCategory] = useState(task.category || '');
  const [editTags, setEditTags] = useState(Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || ''));
  const [editDueDate, setEditDueDate] = useState(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '');
  const [editReminderDate, setEditReminderDate] = useState(task.reminder_date ? new Date(task.reminder_date).toISOString().slice(0, 16) : '');

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date() && !task.completed;
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit(task.id, {
        title: editTitle,
        description: editDescription,
        category: editCategory.trim() || null,
        tags: editTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        due_date: editDueDate || null,
        reminder_date: editReminderDate || null,
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditCategory(task.category || '');
    setEditTags(Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || ''));
    setEditDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '');
    setEditReminderDate(task.reminder_date ? new Date(task.reminder_date).toISOString().slice(0, 16) : '');
    setIsEditing(false);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 ${
      isOverdue(task.due_date) ? 'border-red-500' : 
      task.completed ? 'border-green-500' : 'border-blue-500'
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Título"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Descripción"
            rows="3"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Categoría</label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                list="edit-categories"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <datalist id="edit-categories">
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Etiquetas</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                list="edit-tags"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <datalist id="edit-tags">
                {existingTags.map((tag, idx) => (
                  <option key={idx} value={tag} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Fecha Vencimiento</label>
              <input
                type="datetime-local"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Fecha Recordatorio</label>
              <input
                type="datetime-local"
                value={editReminderDate}
                onChange={(e) => setEditReminderDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Guardar
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleComplete(task.id)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold ${
                      task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h3>
                  {(task.category || (Array.isArray(task.tags) && task.tags.length > 0) || task.due_date) && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-8">
                      {task.category && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          {task.category}
                        </span>
                      )}
                      {Array.isArray(task.tags) && task.tags.length > 0 && task.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {task.due_date && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isOverdue(task.due_date) 
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' 
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          Vence: {formatDate(task.due_date)}
                        </span>
                      )}
                      {task.reminder_date && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                          Recordatorio: {formatDate(task.reminder_date)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {task.description && (
                <p
                  className={`mt-2 text-gray-600 dark:text-gray-400 ml-8 ${
                    task.completed ? 'line-through' : ''
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskItem;
