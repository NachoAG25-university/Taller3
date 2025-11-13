import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TaskFilters from '../components/TaskFilters';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [completed, setCompleted] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const { logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchTasks();
    fetchCategories();
    fetchTags();
  }, [isAuthenticated, navigate]);

  // Aplicar filtros cuando cambian - con debounce para la búsqueda
  useEffect(() => {
    if (!isAuthenticated || isInitialLoad.current) return;

    // Limpiar timeout anterior si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Para la búsqueda, usar debounce (esperar 500ms después de que el usuario deje de escribir)
    const isSearchChange = search !== undefined;
    searchTimeoutRef.current = setTimeout(() => {
      fetchTasks(isSearchChange);
    }, 500);

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, selectedTags.join(','), completed, isAuthenticated]);

  const fetchTasks = async (isSearch = false) => {
    try {
      // Solo mostrar loading completo en la carga inicial
      if (isInitialLoad.current) {
        setLoading(true);
      } else if (isSearch) {
        setSearching(true);
      }
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      if (completed !== null) params.append('completed', completed);
      
      const response = await api.get(`/tasks?${params.toString()}`);
      setTasks(response.data);
      setError('');
      isInitialLoad.current = false;
    } catch (err) {
      setError('Error al cargar las tareas');
      console.error(err);
      isInitialLoad.current = false;
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/tasks/categories/list');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/tasks/tags/list');
      setTags(response.data.tags || []);
    } catch (err) {
      console.error('Error al cargar etiquetas:', err);
    }
  };

  // Los filtros se aplican en el backend, solo actualizamos la lista
  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  const handleCreateTask = async (taskData) => {
    try {
      await api.post('/tasks', taskData);
      setError('');
      // Recargar tareas y actualizar categorías y tags
      fetchTasks();
      fetchCategories();
      fetchTags();
    } catch (err) {
      setError('Error al crear la tarea');
      console.error(err);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      await api.put(`/tasks/${taskId}`, {
        completed: !task.completed,
      });
      setError('');
      // Recargar tareas para mantener consistencia con filtros
      fetchTasks();
    } catch (err) {
      setError('Error al actualizar la tarea');
      console.error(err);
    }
  };

  const handleEditTask = async (taskId, taskData) => {
    try {
      await api.put(`/tasks/${taskId}`, taskData);
      setError('');
      // Recargar tareas y actualizar categorías y tags
      fetchTasks();
      fetchCategories();
      fetchTags();
    } catch (err) {
      setError('Error al editar la tarea');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }
    try {
      await api.delete(`/tasks/${taskId}`);
      setError('');
      // Recargar tareas y actualizar categorías y tags
      fetchTasks();
      fetchCategories();
      fetchTags();
    } catch (err) {
      setError('Error al eliminar la tarea');
      console.error(err);
    }
  };

  const handleExportJSON = async () => {
    try {
      const response = await api.get('/tasks/export/json', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `tareas_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al exportar tareas');
      console.error(err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/tasks/export/csv', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tareas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al exportar tareas');
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Verificar recordatorios
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.reminder_date && !task.completed) {
          const reminderDate = new Date(task.reminder_date);
          const diff = reminderDate - now;
          // Notificar si el recordatorio es en los próximos 5 minutos
          if (diff > 0 && diff <= 5 * 60 * 1000) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Recordatorio: ${task.title}`, {
                body: task.description || 'Tienes un recordatorio',
                icon: '/favicon.ico'
              });
            }
          }
        }
      });
    };

    // Solicitar permiso para notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(checkReminders, 60000); // Verificar cada minuto
    return () => clearInterval(interval);
  }, [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestor de Tareas</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                title={isDark ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <TaskFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          completed={completed}
          setCompleted={setCompleted}
          categories={categories}
          tags={tags}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
        />

        <TaskForm 
          onSubmit={handleCreateTask} 
          categories={categories}
          existingTags={tags}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            Mis Tareas {filteredTasks.length > 0 && `(${filteredTasks.length})`}
          </h2>
          <TaskList
            tasks={filteredTasks}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            categories={categories}
            existingTags={tags}
          />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
