import { TodoSubTaskItem, TodoTaskItem } from '../types';

/**
 * Checks whether a project ID belongs to a non-project To-Do bucket
 * rather than a Proyek SAPA entry in the Project table.
 */
export function isNonProjectTodoId(projectId: string): boolean {
  return projectId === 'proj-non-proyek' || projectId.startsWith('non-proj');
}

/**
 * Normalizes sub-task completion status across all legacy and current fields
 * (`completed`, `status`, and `statusPengerjaan`).
 */
export function isSubTaskCompleted(subTask: TodoSubTaskItem): boolean {
  if (!subTask) return false;
  if (subTask.completed === true) return true;
  const normalizedStatus = (subTask.status || '').trim().toLowerCase();
  if (normalizedStatus === 'completed') return true;
  const normalizedPengerjaan = (subTask.statusPengerjaan || '').trim().toLowerCase();
  if (normalizedPengerjaan === 'selesai') return true;
  return false;
}

/**
 * Returns true if the project has at least one sub-task in its To-Do List
 * AND every sub-task across all tasks in the project is completed.
 */
export function areAllProjectSubTasksCompleted(
  tasks: TodoTaskItem[] | undefined | null
): boolean {
  if (!tasks || tasks.length === 0) return false;
  const allSubTasks = tasks.flatMap((task) =>
    Array.isArray(task.subTasks) ? task.subTasks : []
  );
  if (allSubTasks.length === 0) return false;
  return allSubTasks.every(isSubTaskCompleted);
}

/**
 * Computes sub-task completion summary for a project's To-Do List.
 */
export function getProjectSubTaskProgress(
  tasks: TodoTaskItem[] | undefined | null
): { total: number; completed: number; percentage: number } {
  if (!tasks || tasks.length === 0) {
    return { total: 0, completed: 0, percentage: 0 };
  }
  const allSubTasks = tasks.flatMap((task) =>
    Array.isArray(task.subTasks) ? task.subTasks : []
  );
  if (allSubTasks.length === 0) {
    return { total: 0, completed: 0, percentage: 0 };
  }
  const completedCount = allSubTasks.filter(isSubTaskCompleted).length;
  return {
    total: allSubTasks.length,
    completed: completedCount,
    percentage: Math.round((completedCount / allSubTasks.length) * 100),
  };
}
