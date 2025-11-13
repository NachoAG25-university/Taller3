// Servicio para almacenamiento offline usando localStorage
// En una implementación más completa, se usaría IndexedDB

const STORAGE_KEY = 'offline_tasks';
const SYNC_QUEUE_KEY = 'sync_queue';

export const offlineStorage = {
  // Guardar tareas offline
  saveTasks: (tasks) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('Error guardando tareas offline:', error);
      return false;
    }
  },

  // Obtener tareas offline
  getTasks: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error obteniendo tareas offline:', error);
      return [];
    }
  },

  // Agregar operación a la cola de sincronización
  addToSyncQueue: (operation) => {
    try {
      const queue = offlineStorage.getSyncQueue();
      queue.push({
        ...operation,
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random()
      });
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      return true;
    } catch (error) {
      console.error('Error agregando a cola de sincronización:', error);
      return false;
    }
  },

  // Obtener cola de sincronización
  getSyncQueue: () => {
    try {
      const data = localStorage.getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error obteniendo cola de sincronización:', error);
      return [];
    }
  },

  // Limpiar cola de sincronización
  clearSyncQueue: () => {
    try {
      localStorage.removeItem(SYNC_QUEUE_KEY);
      return true;
    } catch (error) {
      console.error('Error limpiando cola de sincronización:', error);
      return false;
    }
  },

  // Verificar si está online
  isOnline: () => {
    return navigator.onLine;
  },

  // Sincronizar cuando vuelva la conexión
  sync: async (api) => {
    if (!offlineStorage.isOnline()) {
      return { success: false, message: 'Sin conexión' };
    }

    const queue = offlineStorage.getSyncQueue();
    if (queue.length === 0) {
      return { success: true, message: 'No hay operaciones pendientes' };
    }

    const results = [];
    for (const operation of queue) {
      try {
        let result;
        switch (operation.type) {
          case 'CREATE':
            result = await api.post('/tasks', operation.data);
            results.push({ success: true, operation, result: result.data });
            break;
          case 'UPDATE':
            result = await api.put(`/tasks/${operation.taskId}`, operation.data);
            results.push({ success: true, operation, result: result.data });
            break;
          case 'DELETE':
            await api.delete(`/tasks/${operation.taskId}`);
            results.push({ success: true, operation });
            break;
          default:
            results.push({ success: false, operation, error: 'Tipo de operación desconocido' });
        }
      } catch (error) {
        results.push({ success: false, operation, error: error.message });
      }
    }

    // Limpiar cola después de sincronizar
    offlineStorage.clearSyncQueue();
    return { success: true, results };
  }
};

// Listener para detectar cuando vuelve la conexión
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Conexión restaurada');
    // La sincronización se puede llamar desde el componente
  });

  window.addEventListener('offline', () => {
    console.log('Sin conexión - Modo offline activado');
  });
}

export default offlineStorage;

