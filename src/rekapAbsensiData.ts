import { CutiKaryawanItem } from './cutiKaryawanData';
import { HariKhususItem, isHariBesarNasional } from './hariKhususData';
import { KaryawanItem } from './types';

export const REKAP_ABSENSI_CUSTOM_HOURS_KEY = 'sapa_rekap_absensi_custom_hours_v1';
export const REKAP_ABSENSI_PREV_LEAVE_KEY = 'sapa_rekap_absensi_prev_leave_v1';

export interface DailyAttendanceCell {
  text: string | number;
  isRed: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  leaveType?: string;
  isFacilityLeave?: boolean;
}

export interface EmployeeYearlyCutiSummary {
  cutiTahun: number; // 12 + sisa cuti tahun lalu
  cutiDigunakan: number; // Cuti Full (1) + Cuti Setengah Hari (0.5), non-weekend, non-holiday
  cutiTersisa: number; // cutiTahun - cutiDigunakan
  sisaTahunLalu: number;
  rekapFasilitas: {
    ijinDuka: number;
    ijinSakit: number;
    ijinMenikah: number;
    ijinMelahirkan: number;
    ijinSpiritual: number;
  };
}

/**
 * Check if a specific date (year, month 0-indexed, day 1-indexed) is a weekend (Saturday or Sunday)
 */
export function isWeekend(year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day);
  const dayOfWeek = d.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Minggu, 6 = Sabtu
}

/**
 * Format year, month (0-indexed), day to YYYY-MM-DD
 */
export function toDateStr(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns true if the date is a national holiday / libur from HariKhusus
 */
export function isDateNationalHoliday(
  dateStr: string,
  hariKhususList: HariKhususItem[]
): { isHoliday: boolean; name?: string } {
  const check = isHariBesarNasional(dateStr, hariKhususList);
  if (check.isBesar && check.item) {
    return { isHoliday: true, name: check.item.nama };
  }
  return { isHoliday: false };
}

/**
 * Calculate how many eligible working days a leave consumes in a given year.
 * Sabtu, Minggu, and Hari Besar Nasional are NOT counted!
 */
export function calculateEligibleLeaveDays(
  cuti: CutiKaryawanItem,
  hariKhususList: HariKhususItem[],
  targetYear?: number
): number {
  if (cuti.status === 'Ditolak') return 0;

  if (cuti.jenisCuti === 'Ijin Cuti Setengah Hari') {
    // Check if the single day is in targetYear and not weekend/holiday
    const d = new Date(cuti.tanggalMulai);
    if (!isNaN(d.getTime())) {
      if (targetYear && d.getFullYear() !== targetYear) return 0;
      if (d.getDay() === 0 || d.getDay() === 6) return 0; // Weekend
      if (isDateNationalHoliday(cuti.tanggalMulai, hariKhususList).isHoliday) return 0;
    }
    return 0.5;
  }

  // Range loop
  try {
    const start = new Date(cuti.tanggalMulai);
    const end = new Date(cuti.tanggalSelesai);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    let eligibleDays = 0;
    const curr = new Date(start);

    while (curr <= end) {
      const yr = curr.getFullYear();
      if (!targetYear || yr === targetYear) {
        const dayOfWeek = curr.getDay();
        const dateStr = toDateStr(curr.getFullYear(), curr.getMonth(), curr.getDate());
        const isHoli = isDateNationalHoliday(dateStr, hariKhususList).isHoliday;

        // Cuti pada sabtu, minggu, dan hari besar nasional tidak dihitung
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoli) {
          eligibleDays += 1;
        }
      }
      curr.setDate(curr.getDate() + 1);
    }

    return eligibleDays;
  } catch {
    return 0;
  }
}

/**
 * Get stored previous year remaining leave balances map: Record<employeeId, number>
 */
export function loadPreviousLeaveBalances(): Record<string, number> {
  try {
    const raw = localStorage.getItem(REKAP_ABSENSI_PREV_LEAVE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading previous leave balances', e);
  }
  return {};
}

export function savePreviousLeaveBalances(data: Record<string, number>): void {
  try {
    localStorage.setItem(REKAP_ABSENSI_PREV_LEAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving previous leave balances', e);
  }
}

/**
 * Get stored custom daily work hours: Record<`${employeeId}_${YYYY-MM-DD}`, number>
 */
export function loadCustomHoursMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(REKAP_ABSENSI_CUSTOM_HOURS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading custom hours map', e);
  }
  // Default sample hours matching screenshot for Agustino Ong on Nov 2021
  return {
    'karyawan-1_2021-11-03': 4,
    'karyawan-1_2021-11-04': 4,
    'karyawan-1_2021-11-05': 8,
  };
}

export function saveCustomHoursMap(data: Record<string, number>): void {
  try {
    localStorage.setItem(REKAP_ABSENSI_CUSTOM_HOURS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving custom hours map', e);
  }
}

/**
 * Calculate full summary for an employee for a specific year
 */
export function calculateEmployeeYearlySummary(
  employee: KaryawanItem,
  year: number,
  cutiList: CutiKaryawanItem[],
  hariKhususList: HariKhususItem[]
): EmployeeYearlyCutiSummary {
  const prevLeaveMap = loadPreviousLeaveBalances();
  // Sisa cuti tahun lalu (default 0 jika tidak ada)
  const sisaTahunLalu = prevLeaveMap[employee.id] ?? 0;
  // Cuti tahun ini: Setiap awal tahun akan ditambahkan sisa cuti tahun sebelumnya + 12
  const cutiTahun = 12 + sisaTahunLalu;

  // Filter leaves for this employee
  const employeeLeaves = cutiList.filter(
    (c) =>
      (c.karyawanId === employee.id || c.kodeKaryawan === employee.kodeKaryawan) &&
      c.status !== 'Ditolak'
  );

  let cutiDigunakan = 0;
  const rekapFasilitas = {
    ijinDuka: 0,
    ijinSakit: 0,
    ijinMenikah: 0,
    ijinMelahirkan: 0,
    ijinSpiritual: 0,
  };

  employeeLeaves.forEach((c) => {
    const days = calculateEligibleLeaveDays(c, hariKhususList, year);

    if (c.jenisCuti === 'Ijin Cuti Full') {
      cutiDigunakan += days;
    } else if (c.jenisCuti === 'Ijin Cuti Setengah Hari') {
      cutiDigunakan += days; // Already 0.5 per eligible day
    } else if (c.jenisCuti === 'Ijin Duka') {
      rekapFasilitas.ijinDuka += days;
    } else if (c.jenisCuti === 'Ijin Sakit') {
      rekapFasilitas.ijinSakit += days;
    } else if (c.jenisCuti === 'Ijin Menikah') {
      rekapFasilitas.ijinMenikah += days;
    } else if (c.jenisCuti === 'Ijin Melahirkan') {
      rekapFasilitas.ijinMelahirkan += days;
    } else if (c.jenisCuti === 'Ijin Spiritual') {
      rekapFasilitas.ijinSpiritual += days;
    }
  });

  const cutiTersisa = Math.max(0, cutiTahun - cutiDigunakan);

  return {
    cutiTahun,
    cutiDigunakan,
    cutiTersisa,
    sisaTahunLalu,
    rekapFasilitas,
  };
}

/**
 * Get daily cell data for an employee on a specific date
 */
export function getDailyAttendanceCell(
  employee: KaryawanItem,
  year: number,
  month: number, // 0-indexed
  day: number, // 1-indexed
  cutiList: CutiKaryawanItem[],
  hariKhususList: HariKhususItem[],
  customHoursMap: Record<string, number>
): DailyAttendanceCell {
  const dateStr = toDateStr(year, month, day);
  const weekend = isWeekend(year, month, day);
  const holidayCheck = isDateNationalHoliday(dateStr, hariKhususList);

  // If weekend (Sabtu / Minggu), hours is 0
  if (weekend) {
    return {
      text: 0,
      isRed: false,
      isWeekend: true,
      isHoliday: holidayCheck.isHoliday,
      holidayName: holidayCheck.name,
    };
  }

  // If National Holiday (Hari Besar Nasional), hours is 0 and stays black
  if (holidayCheck.isHoliday) {
    return {
      text: 0,
      isRed: false,
      isWeekend: false,
      isHoliday: true,
      holidayName: holidayCheck.name,
    };
  }

  // Check if employee has leave on this date
  const employeeLeave = cutiList.find((c) => {
    if (c.karyawanId !== employee.id && c.kodeKaryawan !== employee.kodeKaryawan) {
      return false;
    }
    if (c.status === 'Ditolak') return false;
    return dateStr >= c.tanggalMulai && dateStr <= c.tanggalSelesai;
  });

  if (employeeLeave) {
    if (employeeLeave.jenisCuti === 'Ijin Cuti Full') {
      // "Jika mengambil cuti full akan berisi 0 dan berwarna merah"
      return {
        text: 0,
        isRed: true,
        isWeekend: false,
        isHoliday: false,
        leaveType: 'Ijin Cuti Full',
      };
    }
    if (employeeLeave.jenisCuti === 'Ijin Cuti Setengah Hari') {
      // "Jika mengambil cuti setengah hari akan berisi 4 dan berwarna merah"
      return {
        text: 4,
        isRed: true,
        isWeekend: false,
        isHoliday: false,
        leaveType: 'Ijin Cuti Setengah Hari',
      };
    }

    // Special facility leave (Ijin Duka, Ijin Sakit, Ijin Menikah, Ijin Melahirkan, Ijin Spiritual)
    // As seen in screenshot on Day 1: it renders "Ijin Duka"
    return {
      text: employeeLeave.jenisCuti,
      isRed: false,
      isWeekend: false,
      isHoliday: false,
      leaveType: employeeLeave.jenisCuti,
      isFacilityLeave: true,
    };
  }

  // Check custom work hours if logged
  const customKey = `${employee.id}_${dateStr}`;
  if (customHoursMap[customKey] !== undefined) {
    return {
      text: customHoursMap[customKey],
      isRed: false,
      isWeekend: false,
      isHoliday: false,
    };
  }

  // Default normal work hours (8 hours)
  return {
    text: 8,
    isRed: false,
    isWeekend: false,
    isHoliday: false,
  };
}
