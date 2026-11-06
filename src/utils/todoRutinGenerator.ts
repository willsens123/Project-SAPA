import { TodoTaskItem, TodoSubTaskItem, TodoRutinConfig } from '../types';

// Map Indonesian day names to standard JS day numbers (0 = Minggu, 1 = Senin, ...)
const HARI_MAP: Record<string, number> = {
  minggu: 0,
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  "jum'at": 5,
  sabtu: 6,
};

// Helper: Format Date to YYYY-MM-DD
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Parse YYYY-MM-DD safely
export function parseDateISO(str?: string): Date {
  if (!str) return new Date();
  const parts = str.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

// Helper: Add days to date
export function addDays(date: Date, numDays: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + numDays);
  return result;
}

// Helper: Get next specific day of week strictly after a given date
export function getNextDayOfWeekAfter(fromDate: Date, dayName: string): Date {
  const targetDay = HARI_MAP[dayName.toLowerCase().trim()];
  if (targetDay === undefined) {
    return addDays(fromDate, 7);
  }
  const result = new Date(fromDate);
  // Start from next day
  result.setDate(result.getDate() + 1);
  while (result.getDay() !== targetDay) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

// Helper: Get next specific monthly date strictly after a given date
export function getNextDateOfMonthAfter(fromDate: Date, targetDayOfMonth: number): Date {
  const clampedDay = Math.min(31, Math.max(1, targetDayOfMonth));
  let year = fromDate.getFullYear();
  let month = fromDate.getMonth();

  // If fromDate's day is already past targetDayOfMonth, move to next month
  if (fromDate.getDate() >= clampedDay) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  // Handle month length (e.g. Feb 28/29, Apr 30)
  const maxDayInMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.min(clampedDay, maxDayInMonth);
  return new Date(year, month, day);
}

/**
 * Calculates the next deadline and start date for a routine to-do item.
 * "To-Do List baru akan digenerate setelah tanggal To-Do List sebelumnya berakhir."
 */
export function calculateNextRutinDates(
  config: TodoRutinConfig,
  prevDeadlineStr?: string
): { startDate: string; endDate: string } | null {
  const prevDate = prevDeadlineStr ? parseDateISO(prevDeadlineStr) : new Date();

  let nextStart: Date;
  let nextEnd: Date;

  if (config.berkalaMode === 'setiap') {
    const durasiHari = Math.max(1, parseInt(config.setiapHariValue || '1', 10) || 1);
    // Next starts the day after previous ends
    nextStart = addDays(prevDate, 1);
    nextEnd = addDays(nextStart, durasiHari - 1);
  } else if (config.berkalaMode === 'setiap_hari') {
    const dayName = config.setiapHariPilihan || 'Senin';
    nextStart = getNextDayOfWeekAfter(prevDate, dayName);
    nextEnd = new Date(nextStart); // Single day task unless specified
  } else if (config.berkalaMode === 'setiap_tanggal') {
    const dayNum = parseInt((config.setiapTanggalPilihan || '1').replace(/\D/g, ''), 10) || 1;
    nextStart = getNextDateOfMonthAfter(prevDate, dayNum);
    nextEnd = new Date(nextStart);
  } else {
    nextStart = addDays(prevDate, 1);
    nextEnd = new Date(nextStart);
  }

  // Check if exceeds tanggalBerakhir
  if (config.tanggalBerakhir) {
    const maxDate = parseDateISO(config.tanggalBerakhir);
    maxDate.setHours(23, 59, 59, 999);
    if (nextStart.getTime() > maxDate.getTime()) {
      return null;
    }
    if (nextEnd.getTime() > maxDate.getTime()) {
      nextEnd = new Date(maxDate);
    }
  }

  return {
    startDate: formatDateISO(nextStart),
    endDate: formatDateISO(nextEnd),
  };
}

/**
 * Generates the single next instance of a recurring task
 */
export function generateNextRutinTask(
  originalTask: TodoTaskItem,
  prevDeadlineStr?: string
): TodoTaskItem | null {
  if (!originalTask.isRutin || !originalTask.rutinConfig) return null;

  const config = originalTask.rutinConfig;
  const nextDates = calculateNextRutinDates(config, prevDeadlineStr || originalTask.deadline);
  if (!nextDates) return null;

  const currentSiklus = config.siklusKe || 1;
  const nextSiklus = currentSiklus + 1;
  const parentId = config.parentRutinTaskId || originalTask.id;
  const newTaskId = `task-rutin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Clone subtasks with new deadlines
  const clonedSubTasks: TodoSubTaskItem[] = (originalTask.subTasks || []).map((sub, idx) => ({
    ...sub,
    id: `sub-rutin-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 5)}`,
    deadline: nextDates.endDate,
    scheduledDate: nextDates.startDate,
    completed: false,
    isRutin: true,
    rutinConfig: {
      ...config,
      siklusKe: nextSiklus,
      parentRutinTaskId: parentId,
      tanggalMulai: nextDates.startDate,
    },
  }));

  return {
    ...originalTask,
    id: newTaskId,
    task: originalTask.task,
    deadline: nextDates.endDate,
    scheduledDate: nextDates.startDate,
    completed: false,
    subTasks: clonedSubTasks,
    isRutin: true,
    rutinConfig: {
      ...config,
      siklusKe: nextSiklus,
      parentRutinTaskId: parentId,
      tanggalMulai: nextDates.startDate,
    },
  };
}

/**
 * Generates an initial sequence of routine tasks when first saved.
 * Creates the primary task plus upcoming generated instances up to tanggalBerakhir (or limit of cycles).
 */
export function generateInitialRutinSequence(
  primaryTasks: TodoTaskItem[],
  maxUpcomingCycles = 5
): TodoTaskItem[] {
  const result: TodoTaskItem[] = [];

  for (const baseTask of primaryTasks) {
    if (!baseTask.isRutin || !baseTask.rutinConfig) {
      result.push(baseTask);
      continue;
    }

    const config = baseTask.rutinConfig;
    const parentId = baseTask.id;

    // Ensure the base task has siklusKe = 1 and parentRutinTaskId set
    const initialTask: TodoTaskItem = {
      ...baseTask,
      rutinConfig: {
        ...config,
        siklusKe: 1,
        parentRutinTaskId: parentId,
      },
    };
    result.push(initialTask);

    // Generate upcoming instances sequentially: each starts after the previous ends
    let lastDeadline = initialTask.deadline || formatDateISO(new Date());
    let currentTask = initialTask;

    for (let c = 2; c <= maxUpcomingCycles; c++) {
      const nextTask = generateNextRutinTask(currentTask, lastDeadline);
      if (!nextTask) break; // Reached tanggalBerakhir
      result.push(nextTask);
      lastDeadline = nextTask.deadline || lastDeadline;
      currentTask = nextTask;
    }
  }

  return result;
}

/**
 * Checks existing tasks and generates subsequent routine to-do list tasks
 * when previous tasks are completed or reach their end date.
 * "To-Do List baru akan digenerate setelah tanggal To-Do List sebelumnya berakhir."
 */
export function checkAndGenerateNextRutinTasks(
  tasks: TodoTaskItem[]
): { updatedTasks: TodoTaskItem[]; hasNewGenerated: boolean } {
  let hasNewGenerated = false;
  const updatedTasks = [...tasks];
  const todayISO = formatDateISO(new Date());

  // Group routine tasks by their parent root ID
  const routineRoots = new Map<string, TodoTaskItem[]>();

  for (const task of tasks) {
    if (task.isRutin && task.rutinConfig) {
      const rootId = task.rutinConfig.parentRutinTaskId || task.id;
      if (!routineRoots.has(rootId)) {
        routineRoots.set(rootId, []);
      }
      routineRoots.get(rootId)!.push(task);
    }
  }

  for (const [rootId, group] of routineRoots.entries()) {
    // Sort group by cycle number (siklusKe)
    group.sort((a, b) => (a.rutinConfig?.siklusKe || 1) - (b.rutinConfig?.siklusKe || 1));
    const latestTask = group[group.length - 1];

    if (!latestTask || !latestTask.rutinConfig) continue;

    // Check if the latest task has finished: either marked complete, or its deadline is in past/today
    const isCompleted = !!latestTask.completed;
    const deadlinePastOrToday = latestTask.deadline ? latestTask.deadline <= todayISO : false;

    if (isCompleted || deadlinePastOrToday) {
      // Check if the next cycle has already been generated
      const currentSiklus = latestTask.rutinConfig.siklusKe || 1;
      const alreadyHasNext = group.some(
        (t) => (t.rutinConfig?.siklusKe || 1) > currentSiklus
      );

      if (!alreadyHasNext) {
        const nextTask = generateNextRutinTask(latestTask, latestTask.deadline);
        if (nextTask) {
          updatedTasks.push(nextTask);
          hasNewGenerated = true;
        }
      }
    }
  }

  return { updatedTasks, hasNewGenerated };
}
