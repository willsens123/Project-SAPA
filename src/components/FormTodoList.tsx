import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  Check,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RotateCw,
} from 'lucide-react';
import {
  ProjectItem,
  KaryawanItem,
  TodoTaskItem,
  TodoSubTaskItem,
  JenisProyekItem,
  PrerequisiteSubTaskCondition,
  JenisNonProyekItem,
} from '../types';
import { getOngoingItemSalurFromStorage } from '../ongoingItemSalurData';
import { getJenisNonProyekFromStorage, saveJenisNonProyekToStorage } from '../jenisNonProyekData';
import { AddEditJenisNonProyekModal } from './AddEditJenisNonProyekModal';
import { generateInitialRutinSequence } from '../utils/todoRutinGenerator';
import { PicAssigneeSelector } from './PicAssigneeSelector';
import { IdentitasItem } from '../identitasData';
import { OrganisasiItem } from '../types';

interface FormTodoListProps {
  project: ProjectItem | null;
  projects?: ProjectItem[];
  karyawanList: KaryawanItem[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  initialTasks: TodoTaskItem[];
  jenisProyekList?: JenisProyekItem[];
  jenisNonProyekList?: JenisNonProyekItem[];
  onSave: (projectId: string, tasks: TodoTaskItem[]) => void;
  onCancel: () => void;
  onShowToast?: (msg: string) => void;
}

export const FormTodoList: React.FC<FormTodoListProps> = ({
  project,
  projects = [],
  karyawanList,
  identitasList,
  organisasiList,
  initialTasks,
  jenisProyekList = [],
  jenisNonProyekList,
  onSave,
  onCancel,
  onShowToast,
}) => {
  // Tab: Proyek SAPA vs Non Proyek
  const [projectTab, setProjectTab] = useState<'proyek_sapa' | 'non_proyek'>(() => {
    if (
      project?.kategori === 'Non Proyek' ||
      project?.jenisProyek === 'Non Proyek' ||
      project?.id?.startsWith('non-proj') ||
      project?.id === 'proj-non-proyek'
    ) {
      return 'non_proyek';
    }
    return 'proyek_sapa';
  });

  const [localJenisNonProyekList, setLocalJenisNonProyekList] = useState<JenisNonProyekItem[]>(() => {
    if (jenisNonProyekList && jenisNonProyekList.length > 0) return jenisNonProyekList;
    return getJenisNonProyekFromStorage();
  });

  useEffect(() => {
    if (jenisNonProyekList && jenisNonProyekList.length > 0) {
      setLocalJenisNonProyekList(jenisNonProyekList);
    }
  }, [jenisNonProyekList]);

  // Selected Jenis Non Proyek Item
  const [selectedJenisNonProyek, setSelectedJenisNonProyek] = useState<JenisNonProyekItem | null>(() => {
    if (project?.id?.startsWith('non-proj-')) {
      const jnpId = project.id.replace('non-proj-', '');
      const found = localJenisNonProyekList.find((j) => j.id === jnpId || j.nama === project.namaKegiatan);
      if (found) return found;
    }
    return localJenisNonProyekList[0] || null;
  });

  const [nonProyekName, setNonProyekName] = useState<string>(() => {
    if (project?.id?.startsWith('non-proj-')) {
      const jnpId = project.id.replace('non-proj-', '');
      const found = localJenisNonProyekList.find((j) => j.id === jnpId || j.nama === project.namaKegiatan);
      if (found) return found.nama;
    }
    return localJenisNonProyekList[0]?.nama || 'Pekerjaan Harian';
  });

  const [isAddJenisModalOpen, setIsAddJenisModalOpen] = useState(false);

  // Routine / Berkala State for Non-Proyek
  const [isRutinActive, setIsRutinActive] = useState<boolean>(true);
  const [nonProyekDivisi, setNonProyekDivisi] = useState<string>('Umum');
  const [rutinMode, setRutinMode] = useState<'setiap' | 'setiap_hari' | 'setiap_tanggal'>('setiap');
  const [setiapHariValue, setSetiapHariValue] = useState<string>('1');
  const [setiapHariPilihan, setSetiapHariPilihan] = useState<string>('Senin');
  const [setiapTanggalPilihan, setSetiapTanggalPilihan] = useState<string>('1');
  const [tanggalBerakhir, setTanggalBerakhir] = useState<string>('');

  // Dropdown visibility for rutin
  const [showSetiapDropdown, setShowSetiapDropdown] = useState(false);
  const [showSetiapHariDropdown, setShowSetiapHariDropdown] = useState(false);
  const [showSetiapTanggalDropdown, setShowSetiapTanggalDropdown] = useState(false);
  const [showTanggalBerakhirPicker, setShowTanggalBerakhirPicker] = useState(false);
  const [searchSetiapHariText, setSearchSetiapHariText] = useState('');
  const [searchSetiapHariPilihanText, setSearchSetiapHariPilihanText] = useState('');
  const [searchSetiapTanggalText, setSearchSetiapTanggalText] = useState('');

  const NON_PROYEK_PRESETS = useMemo(() => {
    return localJenisNonProyekList.map((j) => j.nama);
  }, [localJenisNonProyekList]);

  // Selected project ID
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    return project?.id || (projects.length > 0 ? projects[0].id : 'proj-1');
  });

  const activeProject = project || projects.find((p) => p.id === currentProjectId) || null;

  // Previous & Next project navigation for the carousel header
  const handlePrevProject = () => {
    if (projectTab === 'non_proyek') {
      if (localJenisNonProyekList.length <= 1) return;
      const currentIdx = localJenisNonProyekList.findIndex((j) => j.id === selectedJenisNonProyek?.id);
      const prevIdx = currentIdx <= 0 ? localJenisNonProyekList.length - 1 : currentIdx - 1;
      const targetItem = localJenisNonProyekList[prevIdx];
      setSelectedJenisNonProyek(targetItem);
      setNonProyekName(targetItem.nama);
      return;
    }
    if (projects.length <= 1) return;
    const currentIdx = projects.findIndex((p) => p.id === currentProjectId);
    const prevIdx = currentIdx <= 0 ? projects.length - 1 : currentIdx - 1;
    setCurrentProjectId(projects[prevIdx].id);
  };

  const handleNextProject = () => {
    if (projectTab === 'non_proyek') {
      if (localJenisNonProyekList.length <= 1) return;
      const currentIdx = localJenisNonProyekList.findIndex((j) => j.id === selectedJenisNonProyek?.id);
      const nextIdx = currentIdx === -1 || currentIdx >= localJenisNonProyekList.length - 1 ? 0 : currentIdx + 1;
      const targetItem = localJenisNonProyekList[nextIdx];
      setSelectedJenisNonProyek(targetItem);
      setNonProyekName(targetItem.nama);
      return;
    }
    if (projects.length <= 1) return;
    const currentIdx = projects.findIndex((p) => p.id === currentProjectId);
    const nextIdx = currentIdx === -1 || currentIdx >= projects.length - 1 ? 0 : currentIdx + 1;
    setCurrentProjectId(projects[nextIdx].id);
  };

  const handleSaveNewJenisNonProyek = (newItem: JenisNonProyekItem) => {
    const updated = [newItem, ...localJenisNonProyekList.filter((j) => j.id !== newItem.id)];
    setLocalJenisNonProyekList(updated);
    saveJenisNonProyekToStorage(updated);
    setSelectedJenisNonProyek(newItem);
    setNonProyekName(newItem.nama);
    setIsAddJenisModalOpen(false);
    if (onShowToast) onShowToast(`Jenis Non-Proyek "${newItem.nama}" berhasil ditambahkan`);
  };

  // Template Rekomendasi
  const matchingJenisProyek = jenisProyekList.find(
    (jp) =>
      activeProject?.jenisProyek &&
      jp.jenisKegiatan.toLowerCase().trim() === activeProject.jenisProyek.toLowerCase().trim()
  );
  const activeTemplateTasks = matchingJenisProyek?.templateTodoList || [];
  const [isTemplateChecked, setIsTemplateChecked] = useState(false);

  const handleToggleTemplate = () => {
    const nextChecked = !isTemplateChecked;
    setIsTemplateChecked(nextChecked);

    if (nextChecked && activeTemplateTasks && activeTemplateTasks.length > 0) {
      const newTasksFromTemplate: TodoTaskItem[] = activeTemplateTasks.map((t, idx) => ({
        id: `task-tpl-${Date.now()}-${idx + 1}`,
        task: t.task,
        deskripsi: t.deskripsi || '',
        isPost: false,
        idKaryawanAssignJob: '',
        deadline: '',
        completed: false,
        subTasks: [],
      }));

      const isSingleEmpty = tasks.length === 1 && !tasks[0].task.trim();
      if (isSingleEmpty) {
        setTasks(newTasksFromTemplate);
      } else {
        setTasks([...tasks, ...newTasksFromTemplate]);
      }
      if (onShowToast) {
        onShowToast(`Template Rekomendasi (${activeTemplateTasks.length} Task) berhasil diterapkan`);
      }
    }
  };

  // Main task list state
  const [tasks, setTasks] = useState<TodoTaskItem[]>(() => {
    if (initialTasks && initialTasks.length > 0) {
      return JSON.parse(JSON.stringify(initialTasks));
    }
    return [
      {
        id: `task-${Date.now()}-1`,
        task: '',
        idKaryawanAssignJob: '',
        deadline: '',
        deskripsi: '',
        completed: false,
        subTasks: [
          {
            id: `sub-${Date.now()}-1`,
            title: '',
            idKaryawanAssignJob: '',
            deadline: '',
            deskripsi: '',
            completed: false,
          },
          {
            id: `sub-${Date.now()}-2`,
            title: '',
            idKaryawanAssignJob: '',
            deadline: '',
            deskripsi: '',
            completed: false,
            dependsOnSubTask: false,
            prerequisites: [
              {
                id: `prereq-${Date.now()}-1`,
                subTaskId: '',
                subTaskTitle: '',
                requiredStatus: 'Sedang Dikerjakan',
              },
            ],
          },
        ],
      },
    ];
  });

  // Active open dropdown key state
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  const [dropdownSearchText, setDropdownSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownKey(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Collect all already filled sub-tasks across all tasks and from Papan Trello for prerequisite selection
  const allFilledSubTasks = useMemo(() => {
    const list: {
      id: string;
      title: string;
      taskName?: string;
      source?: string;
      currentStatus?: string;
    }[] = [];
    const seenTitles = new Set<string>();

    // 1. Current form tasks sub-tasks
    tasks.forEach((t, tIdx) => {
      (t.subTasks || []).forEach((st, sIdx) => {
        if (st.title && st.title.trim().length > 0) {
          const title = st.title.trim();
          list.push({
            id: st.id || `sub-${tIdx}-${sIdx}`,
            title,
            taskName: t.task.trim() || `Task #${tIdx + 1}`,
            source: 'Form To-Do List',
          });
          seenTitles.add(title.toLowerCase());
        }
      });
    });

    // 2. Initial tasks from other tasks in project
    (initialTasks || []).forEach((t, tIdx) => {
      (t.subTasks || []).forEach((st, sIdx) => {
        if (st.title && st.title.trim().length > 0) {
          const title = st.title.trim();
          if (!seenTitles.has(title.toLowerCase())) {
            list.push({
              id: st.id || `init-sub-${tIdx}-${sIdx}`,
              title,
              taskName: t.task.trim() || `Task #${tIdx + 1}`,
              source: 'To-Do List Proyek',
            });
            seenTitles.add(title.toLowerCase());
          }
        }
      });
    });

    // 3. Pekerjaan A-AJAK & Cards from tab "Papan Trello"
    try {
      const trelloCards = getOngoingItemSalurFromStorage();
      trelloCards.forEach((card) => {
        (card.pekerjaanAjak || []).forEach((ajak) => {
          if (ajak.namaPekerjaan && ajak.namaPekerjaan.trim().length > 0) {
            const title = ajak.namaPekerjaan.trim();
            if (!seenTitles.has(title.toLowerCase())) {
              list.push({
                id: ajak.id || `ajak-${Date.now()}`,
                title,
                taskName: card.namaItem,
                source: 'Papan Trello',
                currentStatus: ajak.status,
              });
              seenTitles.add(title.toLowerCase());
            }
          }
        });
      });
    } catch (e) {
      console.error(e);
    }

    return list;
  }, [tasks, initialTasks]);

  // Employee display helper
  const getKaryawanDisplayName = (kodeOrId?: string) => {
    if (!kodeOrId) return '';
    const match = karyawanList.find(
      (k) => k.kodeKaryawan === kodeOrId || k.id === kodeOrId
    );
    if (match) {
      return `${match.kodeKaryawan} - ${match.namaLengkap}`;
    }
    return kodeOrId;
  };

  // Filtered employees
  const filteredKaryawan = karyawanList.filter((k) => {
    if (!dropdownSearchText.trim()) return true;
    const q = dropdownSearchText.toLowerCase();
    return (
      k.kodeKaryawan.toLowerCase().includes(q) ||
      k.namaLengkap.toLowerCase().includes(q) ||
      (k.divisi || '').toLowerCase().includes(q)
    );
  });

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (!dropdownSearchText.trim()) return true;
    const q = dropdownSearchText.toLowerCase();
    return (
      p.namaKegiatan.toLowerCase().includes(q) ||
      (p.jenisProyek || '').toLowerCase().includes(q) ||
      (p.divisi || '').toLowerCase().includes(q)
    );
  });

  // Task manipulation handlers
  const handleAddTask = () => {
    const newTask: TodoTaskItem = {
      id: `task-${Date.now()}-${tasks.length + 1}`,
      task: '',
      isPost: false,
      idKaryawanAssignJob: '',
      deadline: '',
      deskripsi: '',
      completed: false,
      dependsOnSubTask: false,
      prerequisites: [
        {
          id: `prereq-${Date.now()}-1`,
          subTaskId: '',
          subTaskTitle: '',
          requiredStatus: 'Sedang Dikerjakan',
        },
      ],
      subTasks: [
        {
          id: `sub-${Date.now()}-1`,
          title: '',
          idKaryawanAssignJob: '',
          deadline: '',
          deskripsi: '',
          completed: false,
        },
      ],
    };
    setTasks([...tasks, newTask]);
    if (onShowToast) onShowToast('Task baru ditambahkan');
  };

  const handleRemoveTask = (taskIndex: number) => {
    if (tasks.length === 1) {
      setTasks([
        {
          id: `task-${Date.now()}-1`,
          task: '',
          isPost: false,
          idKaryawanAssignJob: '',
          deadline: '',
          deskripsi: '',
          completed: false,
          subTasks: [],
        },
      ]);
      return;
    }
    const updated = tasks.filter((_, idx) => idx !== taskIndex);
    setTasks(updated);
    if (onShowToast) onShowToast('Task dihapus');
  };

  const handleUpdateTaskField = (
    taskIndex: number,
    field: keyof Omit<TodoTaskItem, 'subTasks' | 'id'>,
    value: any
  ) => {
    setTasks((prev) =>
      prev.map((t, idx) => (idx === taskIndex ? { ...t, [field]: value } : t))
    );
  };

  // Sub-Task manipulation handlers
  const handleAddSubTask = (taskIndex: number) => {
    const existingSubsCount = tasks[taskIndex].subTasks?.length || 0;
    const isSecondOrMore = existingSubsCount >= 1;

    const newSubTask: TodoSubTaskItem = {
      id: `sub-${Date.now()}-${existingSubsCount + 1}`,
      title: '',
      idKaryawanAssignJob: '',
      deadline: '',
      deskripsi: '',
      completed: false,
      dependsOnSubTask: false,
      prerequisites: isSecondOrMore
        ? [
            {
              id: `prereq-${Date.now()}-1`,
              subTaskId: '',
              subTaskTitle: '',
              requiredStatus: 'Sedang Dikerjakan',
            },
          ]
        : undefined,
    };

    setTasks((prev) =>
      prev.map((t, idx) => {
        if (idx === taskIndex) {
          return {
            ...t,
            subTasks: [...(t.subTasks || []), newSubTask],
          };
        }
        return t;
      })
    );
    if (onShowToast) onShowToast('Sub-task baru ditambahkan');
  };

  const handleRemoveSubTask = (taskIndex: number, subIndex: number) => {
    setTasks((prev) =>
      prev.map((t, idx) => {
        if (idx === taskIndex) {
          return {
            ...t,
            subTasks: (t.subTasks || []).filter((_, sIdx) => sIdx !== subIndex),
          };
        }
        return t;
      })
    );
    if (onShowToast) onShowToast('Sub-task dihapus');
  };

  const handleUpdateSubTaskField = (
    taskIndex: number,
    subIndex: number,
    field: keyof Omit<TodoSubTaskItem, 'id'>,
    value: any
  ) => {
    setTasks((prev) =>
      prev.map((t, idx) => {
        if (idx === taskIndex) {
          return {
            ...t,
            subTasks: (t.subTasks || []).map((st, sIdx) =>
              sIdx === subIndex ? { ...st, [field]: value } : st
            ),
          };
        }
        return t;
      })
    );
  };

  // Prerequisites Condition Helpers
  const handleAddPrerequisiteRuleToTask = (taskIndex: number) => {
    const currentPrereqs = tasks[taskIndex].prerequisites || [];
    const newPrereq: PrerequisiteSubTaskCondition = {
      id: `prereq-${Date.now()}-${currentPrereqs.length + 1}`,
      subTaskId: '',
      subTaskTitle: '',
      requiredStatus: 'Sedang Dikerjakan',
    };
    handleUpdateTaskField(taskIndex, 'prerequisites', [...currentPrereqs, newPrereq]);
  };

  const handleRemovePrerequisiteRuleFromTask = (taskIndex: number, ruleIndex: number) => {
    const currentPrereqs = tasks[taskIndex].prerequisites || [];
    if (currentPrereqs.length <= 1) {
      handleUpdateTaskField(taskIndex, 'prerequisites', [
        {
          id: `prereq-${Date.now()}`,
          subTaskId: '',
          subTaskTitle: '',
          requiredStatus: 'Sedang Dikerjakan',
        },
      ]);
      return;
    }
    handleUpdateTaskField(
      taskIndex,
      'prerequisites',
      currentPrereqs.filter((_, idx) => idx !== ruleIndex)
    );
  };

  const handleUpdatePrerequisiteRuleOnTask = (
    taskIndex: number,
    ruleIndex: number,
    updates: Partial<PrerequisiteSubTaskCondition>
  ) => {
    const currentPrereqs = tasks[taskIndex].prerequisites || [];
    const updated = currentPrereqs.map((p, idx) => (idx === ruleIndex ? { ...p, ...updates } : p));
    handleUpdateTaskField(taskIndex, 'prerequisites', updated);
  };

  const handleAddPrerequisiteRuleToSubTask = (taskIndex: number, subIndex: number) => {
    const currentPrereqs = tasks[taskIndex].subTasks?.[subIndex]?.prerequisites || [];
    const newPrereq: PrerequisiteSubTaskCondition = {
      id: `prereq-${Date.now()}-${currentPrereqs.length + 1}`,
      subTaskId: '',
      subTaskTitle: '',
      requiredStatus: 'Sedang Dikerjakan',
    };
    handleUpdateSubTaskField(taskIndex, subIndex, 'prerequisites', [...currentPrereqs, newPrereq]);
  };

  const handleRemovePrerequisiteRuleFromSubTask = (
    taskIndex: number,
    subIndex: number,
    ruleIndex: number
  ) => {
    const currentPrereqs = tasks[taskIndex].subTasks?.[subIndex]?.prerequisites || [];
    if (currentPrereqs.length <= 1) {
      handleUpdateSubTaskField(taskIndex, subIndex, 'prerequisites', [
        {
          id: `prereq-${Date.now()}`,
          subTaskId: '',
          subTaskTitle: '',
          requiredStatus: 'Sedang Dikerjakan',
        },
      ]);
      return;
    }
    handleUpdateSubTaskField(
      taskIndex,
      subIndex,
      'prerequisites',
      currentPrereqs.filter((_, idx) => idx !== ruleIndex)
    );
  };

  const handleUpdatePrerequisiteRuleOnSubTask = (
    taskIndex: number,
    subIndex: number,
    ruleIndex: number,
    updates: Partial<PrerequisiteSubTaskCondition>
  ) => {
    const currentPrereqs = tasks[taskIndex].subTasks?.[subIndex]?.prerequisites || [];
    const updated = currentPrereqs.map((p, idx) => (idx === ruleIndex ? { ...p, ...updates } : p));
    handleUpdateSubTaskField(taskIndex, subIndex, 'prerequisites', updated);
  };

  const handleSaveClick = () => {
    let targetProjectId = activeProject?.id || currentProjectId || 'proj-1';
    let tasksToSave = tasks;

    if (projectTab === 'non_proyek') {
      const activeJenis = selectedJenisNonProyek || localJenisNonProyekList[0];
      const targetId = activeJenis?.id || 'jnp-1';
      targetProjectId = `non-proj-${targetId}`;

      const decoratedTasks: TodoTaskItem[] = tasks.map((t) => ({
        ...t,
        jenisNonProyekId: targetId,
        jenisNonProyekNama: activeJenis?.nama || 'Pekerjaan Harian',
        warnaKartu: activeJenis?.warnaKartu || '#9fa8da',
        divisi: nonProyekDivisi || t.divisi || 'Umum',
        isRutin: isRutinActive,
        rutinConfig: isRutinActive
          ? {
              isRutin: true,
              berkalaMode: rutinMode,
              setiapHariValue,
              setiapHariPilihan,
              setiapTanggalPilihan,
              tanggalBerakhir,
              siklusKe: 1,
            }
          : undefined,
        subTasks: (t.subTasks || []).map((st) => ({
          ...st,
          jenisNonProyekId: targetId,
          jenisNonProyekNama: activeJenis?.nama || 'Pekerjaan Harian',
          warnaKartu: activeJenis?.warnaKartu || '#9fa8da',
          divisi: nonProyekDivisi || st.divisi || t.divisi || 'Umum',
          isRutin: isRutinActive,
          rutinConfig: isRutinActive
            ? {
                isRutin: true,
                berkalaMode: rutinMode,
                setiapHariValue,
                setiapHariPilihan,
                setiapTanggalPilihan,
                tanggalBerakhir,
                siklusKe: 1,
              }
            : undefined,
        })),
      }));

      if (isRutinActive) {
        tasksToSave = generateInitialRutinSequence(decoratedTasks);
      } else {
        tasksToSave = decoratedTasks;
      }
    } else {
      const projDivisi = activeProject?.divisi || 'Umum';
      tasksToSave = tasks.map((t) => ({
        ...t,
        divisi: t.divisi || projDivisi,
        subTasks: (t.subTasks || []).map((st) => ({
          ...st,
          divisi: st.divisi || t.divisi || projDivisi,
        })),
      }));
    }

    onSave(targetProjectId, tasksToSave);
    if (onShowToast) {
      if (projectTab === 'non_proyek' && isRutinActive) {
        onShowToast('To-Do List Rutin Non-Proyek berhasil disimpan dan digenerate');
      } else {
        onShowToast('To-Do List berhasil disimpan');
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-6 px-4 sm:px-8 bg-white min-h-screen">
      {/* 1. Header Bar: Title, Carousel Navigation, Clock & 3-Dots */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        {/* Left: Heading & Carousel Navigation */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Form To-Do List
          </h1>

          {/* Carousel navigation pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevProject}
              className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Proyek / Jenis Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Boy avatar icon */}
            <div className="w-8 h-8 rounded-full bg-[#fbc02d] border-2 border-white shadow-xs flex items-center justify-center overflow-hidden shrink-0 select-none">
              <span className="text-base select-none">👦</span>
            </div>

            {/* Teal speech bubble / capsule bar */}
            <div className="relative bg-[#008d91] text-white text-xs font-semibold px-4 py-1.5 rounded-2xl flex items-center min-w-[200px] sm:min-w-[280px] h-8 shadow-xs select-none">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] border-r-[#008d91] absolute -left-[6px] top-1/2 -translate-y-1/2"></div>
              <span className="truncate">
                {projectTab === 'non_proyek'
                  ? (selectedJenisNonProyek?.nama || nonProyekName || 'Atur To-Do List Non Proyek')
                  : (activeProject?.namaKegiatan || 'Atur To-Do List Proyek SAPA')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextProject}
              className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Proyek / Jenis Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Digital clock & 3-dots */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="text-right select-none">
            <div className="text-2xl font-medium text-[#008d91] tracking-tight leading-none">
              09:59
            </div>
            <div className="text-[11px] font-medium text-[#008d91] mt-0.5">
              Senin, 15 November 2021
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Opsi Menu"
          >
            <MoreHorizontal className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* 2. Project Type Toggle Tabs: Proyek SAPA vs Non Proyek */}
      <div className="flex items-center gap-3 pt-2 pb-6">
        <button
          type="button"
          onClick={() => setProjectTab('proyek_sapa')}
          className={`px-7 py-2 rounded-full font-bold text-sm transition-all shadow-xs cursor-pointer ${
            projectTab === 'proyek_sapa'
              ? 'bg-[#008d91] text-white'
              : 'bg-[#9ca3af] text-white hover:bg-[#858b94]'
          }`}
        >
          Proyek SAPA
        </button>
        <button
          type="button"
          onClick={() => setProjectTab('non_proyek')}
          className={`px-7 py-2 rounded-full font-bold text-sm transition-all shadow-xs cursor-pointer ${
            projectTab === 'non_proyek'
              ? 'bg-[#008d91] text-white'
              : 'bg-[#9ca3af] text-white hover:bg-[#858b94]'
          }`}
        >
          Non Proyek
        </button>
      </div>

      {/* 3. Form Content */}
      <div className="space-y-6">
        {projectTab === 'non_proyek' ? (
          <>
            {/* Row: Jenis Non-Proyek (Terkoneksi dengan Jenis Non-Proyek To-Do List) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="w-full sm:w-72 lg:w-80 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                Jenis Non-Proyek
              </label>
              <div className="w-full max-w-xl relative">
                <div
                  onClick={() => {
                    setOpenDropdownKey(openDropdownKey === 'jenis-non-proyek-select' ? null : 'jenis-non-proyek-select');
                    setDropdownSearchText('');
                  }}
                  className="w-full h-11 sm:h-12 bg-white border border-slate-200 rounded-xl px-4 flex items-center justify-between text-sm shadow-xs cursor-pointer select-none hover:border-slate-300"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      style={{ backgroundColor: selectedJenisNonProyek?.warnaKartu || '#9fa8da' }}
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                    />
                    <span className="text-slate-800 font-medium truncate">
                      {selectedJenisNonProyek?.nama || 'Pilih Jenis Non-Proyek...'}
                    </span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2">
                    <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>

                {/* Popover Dropdown for Jenis Non-Proyek */}
                {openDropdownKey === 'jenis-non-proyek-select' && (
                  <div
                    ref={dropdownRef}
                    className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={dropdownSearchText}
                        onChange={(e) => setDropdownSearchText(e.target.value)}
                        placeholder="Cari jenis non-proyek..."
                        autoFocus
                        className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                      />
                      {dropdownSearchText && (
                        <button
                          type="button"
                          onClick={() => setDropdownSearchText('')}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {/* Add New Jenis Non-Proyek Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownKey(null);
                          setIsAddJenisModalOpen(true);
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg bg-teal-50 hover:bg-teal-100 text-[#008d91] font-semibold flex items-center justify-between mb-1 cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          Tambah Jenis Non-Proyek Baru
                        </span>
                      </button>

                      {localJenisNonProyekList
                        .filter((item) => {
                          if (!dropdownSearchText.trim()) return true;
                          const q = dropdownSearchText.toLowerCase();
                          return (
                            item.nama.toLowerCase().includes(q) ||
                            (item.keterangan && item.keterangan.toLowerCase().includes(q))
                          );
                        })
                        .map((item) => {
                          const isSelected = selectedJenisNonProyek?.id === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSelectedJenisNonProyek(item);
                                setNonProyekName(item.nama);
                                setOpenDropdownKey(null);
                              }}
                              className={`w-full px-3 py-2 text-left rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#e6f4f5] text-[#008d91] font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <div
                                  style={{ backgroundColor: item.warnaKartu }}
                                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                                />
                                <div className="truncate text-left">
                                  <span className="font-medium text-slate-800 block truncate">{item.nama}</span>
                                  {item.keterangan && (
                                    <span className="text-[10px] text-slate-400 block truncate">
                                      {item.keterangan}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#008d91] shrink-0" />}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row: Pilihan Rutin atau Tidak Rutin */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="w-full sm:w-72 lg:w-80 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                Pilihan Rutinitas
              </label>
              <div className="flex items-center gap-6">
                <label
                  onClick={() => setIsRutinActive(true)}
                  className="flex items-center gap-2.5 cursor-pointer select-none"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isRutinActive
                        ? 'border-[#008d91] bg-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {isRutinActive && <div className="w-2 h-2 rounded-full bg-[#008d91]" />}
                  </div>
                  <span className={`text-sm ${isRutinActive ? 'font-semibold text-slate-800' : 'font-normal text-slate-600'}`}>
                    Rutin
                  </span>
                </label>

                <label
                  onClick={() => setIsRutinActive(false)}
                  className="flex items-center gap-2.5 cursor-pointer select-none"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      !isRutinActive
                        ? 'border-[#008d91] bg-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {!isRutinActive && <div className="w-2 h-2 rounded-full bg-[#008d91]" />}
                  </div>
                  <span className={`text-sm ${!isRutinActive ? 'font-semibold text-slate-800' : 'font-normal text-slate-600'}`}>
                    Tidak Rutin
                  </span>
                </label>
              </div>
            </div>

            {/* Row: Divisi (Non-Proyek) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="w-full sm:w-72 lg:w-80 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                Divisi
              </label>
              <div className="w-full max-w-xl relative">
                <div
                  onClick={() => {
                    setOpenDropdownKey(openDropdownKey === 'non-proyek-divisi-select' ? null : 'non-proyek-divisi-select');
                    setDropdownSearchText('');
                  }}
                  className="w-full h-11 sm:h-12 bg-white border border-slate-200 rounded-xl px-4 flex items-center justify-between text-sm shadow-xs cursor-pointer select-none hover:border-slate-300"
                >
                  <span className="text-slate-800 font-medium truncate">
                    {nonProyekDivisi || 'Pilih Divisi...'}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2">
                    <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>

                {openDropdownKey === 'non-proyek-divisi-select' && (
                  <div
                    ref={dropdownRef}
                    className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {['MAD', 'EVE', 'FUN', 'HRD', 'IT', 'FIN', 'OPS', 'MKT', 'Umum'].map((div) => (
                        <button
                          key={div}
                          type="button"
                          onClick={() => {
                            setNonProyekDivisi(div);
                            setOpenDropdownKey(null);
                          }}
                          className={`w-full px-3 py-2 text-left rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                            nonProyekDivisi === div
                              ? 'bg-[#e6f4f5] text-[#008d91] font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{div}</span>
                          {nonProyekDivisi === div && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: To-Do List Rutin */}
            <div className="space-y-4 pt-1">
              {isRutinActive ? (
                <div
                  onClick={() => setIsRutinActive(false)}
                  className="flex items-center gap-2 cursor-pointer select-none"
                  title="Klik untuk ubah menjadi Tidak Rutin"
                >
                  <span className="text-[#008d91] text-xs">▼</span>
                  <span className="text-[#008d91] font-semibold text-base">To-Do List Rutin</span>
                  <span className="text-[11px] font-medium text-slate-400 ml-1">
                    (Otomatis digenerate berkala & masuk ke Tab "Non Proyek Rutin" serta Tab "Upcoming")
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl max-w-4xl text-xs text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#008d91]"></span>
                  <span>Non-Proyek Tidak Rutin: Tugas akan langsung dimasukkan ke tab <strong>Upcoming</strong> di To-Do List.</span>
                </div>
              )}

              {isRutinActive && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 max-w-4xl animate-in fade-in zoom-in-95 duration-100">
                  {/* Left Card: Radio buttons & Tanggal Berakhir label */}
                  <div className="md:col-span-5 bg-[#f0f4f8] rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-2xs">
                    {/* Setiap */}
                    <label
                      onClick={() => setRutinMode('setiap')}
                      className="flex items-center gap-3.5 cursor-pointer select-none text-slate-700 text-base"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          rutinMode === 'setiap'
                            ? 'border-[#008d91] bg-white'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {rutinMode === 'setiap' && (
                          <div className="w-2 h-2 rounded-full bg-[#008d91]" />
                        )}
                      </div>
                      <span>Setiap</span>
                    </label>

                    {/* Setiap Hari */}
                    <label
                      onClick={() => setRutinMode('setiap_hari')}
                      className="flex items-center gap-3.5 cursor-pointer select-none text-slate-700 text-base"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          rutinMode === 'setiap_hari'
                            ? 'border-[#008d91] bg-white'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {rutinMode === 'setiap_hari' && (
                          <div className="w-2 h-2 rounded-full bg-[#008d91]" />
                        )}
                      </div>
                      <span>Setiap Hari</span>
                    </label>

                    {/* Setiap Tanggal */}
                    <label
                      onClick={() => setRutinMode('setiap_tanggal')}
                      className="flex items-center gap-3.5 cursor-pointer select-none text-slate-700 text-base"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          rutinMode === 'setiap_tanggal'
                            ? 'border-[#008d91] bg-white'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {rutinMode === 'setiap_tanggal' && (
                          <div className="w-2 h-2 rounded-full bg-[#008d91]" />
                        )}
                      </div>
                      <span>Setiap Tanggal</span>
                    </label>

                    {/* Tanggal Berakhir Label */}
                    <div className="text-slate-700 text-base font-normal select-none pt-1">
                      Tanggal Berakhir
                    </div>
                  </div>

                  {/* Right Card: Inputs corresponding to Left options */}
                  <div className="md:col-span-7 bg-[#f0f4f8] rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-2xs">
                    {/* Row 1: Setiap [X] Hari */}
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 max-w-[240px]">
                        <div
                          onClick={() => {
                            setRutinMode('setiap');
                            setShowSetiapDropdown(!showSetiapDropdown);
                            setShowSetiapHariDropdown(false);
                            setShowSetiapTanggalDropdown(false);
                            setShowTanggalBerakhirPicker(false);
                          }}
                          className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#008d91] transition-all"
                        >
                          <span
                            className={
                              setiapHariValue ? 'text-slate-700 font-medium' : 'text-slate-400'
                            }
                          >
                            {setiapHariValue ? `${setiapHariValue} Hari` : 'Search...'}
                          </span>
                          <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2">
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        </div>

                        {showSetiapDropdown && (
                          <div className="absolute left-0 mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-2">
                              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <input
                                type="text"
                                value={searchSetiapHariText}
                                onChange={(e) => setSearchSetiapHariText(e.target.value)}
                                placeholder="Cari atau ketik hari..."
                                autoFocus
                                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                              />
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                              Pilih Durasi Hari
                            </div>
                            <div className="max-h-44 overflow-y-auto space-y-0.5">
                              {searchSetiapHariText.trim() &&
                                !['1', '2', '3', '4', '5', '6', '7', '10', '14', '21', '30'].includes(
                                  searchSetiapHariText.trim()
                                ) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const val = searchSetiapHariText.replace(/\D/g, '') || '1';
                                      setSetiapHariValue(val);
                                      setRutinMode('setiap');
                                      setShowSetiapDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#008d91] bg-teal-50 hover:bg-teal-100 cursor-pointer flex items-center justify-between mb-1"
                                  >
                                    <span>Gunakan: {searchSetiapHariText.replace(/\D/g, '') || '1'} Hari</span>
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              {['1', '2', '3', '4', '5', '6', '7', '10', '14', '21', '30']
                                .filter((d) =>
                                  searchSetiapHariText.trim() ? d.includes(searchSetiapHariText.trim()) : true
                                )
                                .map((d) => (
                                  <button
                                    key={d}
                                    type="button"
                                    onClick={() => {
                                      setSetiapHariValue(d);
                                      setRutinMode('setiap');
                                      setShowSetiapDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                                  >
                                    <span>{d} Hari</span>
                                    {setiapHariValue === d && (
                                      <Check className="w-3.5 h-3.5 text-[#008d91]" />
                                    )}
                                  </button>
                                ))}
                            </div>
                            <div className="pt-2 border-t border-slate-100 mt-1 px-2">
                              <input
                                type="number"
                                min="1"
                                placeholder="Kustom (berapa hari)..."
                                value={setiapHariValue}
                                onChange={(e) => {
                                  setSetiapHariValue(e.target.value);
                                  setRutinMode('setiap');
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#008d91]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-slate-700 text-base font-normal shrink-0">Hari</span>
                    </div>

                    {/* Row 2: Setiap Hari [Pilihan Hari] */}
                    <div className="relative flex-1 max-w-[240px]">
                      <div
                        onClick={() => {
                          setRutinMode('setiap_hari');
                          setShowSetiapHariDropdown(!showSetiapHariDropdown);
                          setShowSetiapDropdown(false);
                          setShowSetiapTanggalDropdown(false);
                          setShowTanggalBerakhirPicker(false);
                        }}
                        className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#008d91] transition-all"
                      >
                        <span
                          className={
                            setiapHariPilihan ? 'text-slate-700 font-medium' : 'text-slate-400'
                          }
                        >
                          {setiapHariPilihan || 'Search...'}
                        </span>
                        <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2">
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>

                      {showSetiapHariDropdown && (
                        <div className="absolute left-0 mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={searchSetiapHariPilihanText}
                              onChange={(e) => setSearchSetiapHariPilihanText(e.target.value)}
                              placeholder="Cari hari..."
                              autoFocus
                              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                            />
                          </div>
                          <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                            Pilih Hari Mingguan
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-0.5">
                            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
                              .filter((day) =>
                                searchSetiapHariPilihanText.trim()
                                  ? day.toLowerCase().includes(searchSetiapHariPilihanText.toLowerCase())
                                  : true
                              )
                              .map((day) => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    setSetiapHariPilihan(day);
                                    setRutinMode('setiap_hari');
                                    setShowSetiapHariDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                                >
                                  <span>{day}</span>
                                  {setiapHariPilihan === day && (
                                    <Check className="w-3.5 h-3.5 text-[#008d91]" />
                                  )}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Row 3: Setiap Tanggal [Pilihan Tanggal] */}
                    <div className="relative flex-1 max-w-[240px]">
                      <div
                        onClick={() => {
                          setRutinMode('setiap_tanggal');
                          setShowSetiapTanggalDropdown(!showSetiapTanggalDropdown);
                          setShowSetiapDropdown(false);
                          setShowSetiapHariDropdown(false);
                          setShowTanggalBerakhirPicker(false);
                        }}
                        className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#008d91] transition-all"
                      >
                        <span
                          className={
                            setiapTanggalPilihan ? 'text-slate-700 font-medium' : 'text-slate-400'
                          }
                        >
                          {setiapTanggalPilihan
                            ? setiapTanggalPilihan.startsWith('Tanggal')
                              ? setiapTanggalPilihan
                              : `Tanggal ${setiapTanggalPilihan}`
                            : 'Search...'}
                        </span>
                        <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2">
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>

                      {showSetiapTanggalDropdown && (
                        <div className="absolute left-0 mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
                          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={searchSetiapTanggalText}
                              onChange={(e) => setSearchSetiapTanggalText(e.target.value)}
                              placeholder="Cari tanggal (1 - 31)..."
                              autoFocus
                              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                            />
                          </div>
                          <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                            Pilih Tanggal Bulanan (1 - 31)
                          </div>
                          <div className="space-y-0.5">
                            {Array.from({ length: 31 }, (_, i) => String(i + 1))
                              .filter((tgl) =>
                                searchSetiapTanggalText.trim()
                                  ? tgl.includes(searchSetiapTanggalText.trim()) ||
                                    `tanggal ${tgl}`.includes(searchSetiapTanggalText.toLowerCase().trim())
                                  : true
                              )
                              .map((tgl) => (
                                <button
                                  key={tgl}
                                  type="button"
                                  onClick={() => {
                                    setSetiapTanggalPilihan(tgl);
                                    setRutinMode('setiap_tanggal');
                                    setShowSetiapTanggalDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                                >
                                  <span>Tanggal {tgl}</span>
                                  {(setiapTanggalPilihan === tgl ||
                                    setiapTanggalPilihan === `Tanggal ${tgl}`) && (
                                    <Check className="w-3.5 h-3.5 text-[#008d91]" />
                                  )}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Row 4: Tanggal Berakhir */}
                    <div className="relative w-full max-w-md">
                      <div
                        onClick={() => setShowTanggalBerakhirPicker(!showTanggalBerakhirPicker)}
                        className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#008d91] transition-all"
                      >
                        <span
                          className={
                            tanggalBerakhir ? 'text-slate-700 font-medium' : 'text-slate-400'
                          }
                        >
                          {tanggalBerakhir || 'Input Date...'}
                        </span>
                        <div className="shrink-0 ml-2 text-[#008d91]">
                          <Calendar className="w-5 h-5" />
                        </div>
                      </div>

                      {showTanggalBerakhirPicker && (
                        <div className="absolute left-0 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-30 animate-in fade-in zoom-in-95 duration-100">
                          <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Tentukan Tanggal Berakhir
                          </div>
                          <input
                            type="date"
                            value={tanggalBerakhir}
                            onChange={(e) => {
                              setTanggalBerakhir(e.target.value);
                              setShowTanggalBerakhirPicker(false);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs mb-2 focus:outline-none focus:border-[#008d91]"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date();
                                d.setMonth(d.getMonth() + 1);
                                setTanggalBerakhir(d.toISOString().slice(0, 10));
                                setShowTanggalBerakhirPicker(false);
                              }}
                              className="px-2 py-1.5 text-[11px] bg-slate-50 hover:bg-teal-50 hover:text-[#008d91] rounded-lg text-slate-600 font-medium text-center cursor-pointer"
                            >
                              +1 Bulan
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date();
                                d.setMonth(d.getMonth() + 3);
                                setTanggalBerakhir(d.toISOString().slice(0, 10));
                                setShowTanggalBerakhirPicker(false);
                              }}
                              className="px-2 py-1.5 text-[11px] bg-slate-50 hover:bg-teal-50 hover:text-[#008d91] rounded-lg text-slate-600 font-medium text-center cursor-pointer"
                            >
                              +3 Bulan
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date();
                                d.setMonth(d.getMonth() + 6);
                                setTanggalBerakhir(d.toISOString().slice(0, 10));
                                setShowTanggalBerakhirPicker(false);
                              }}
                              className="px-2 py-1.5 text-[11px] bg-slate-50 hover:bg-teal-50 hover:text-[#008d91] rounded-lg text-slate-600 font-medium text-center cursor-pointer"
                            >
                              +6 Bulan
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTanggalBerakhir('');
                                setShowTanggalBerakhirPicker(false);
                              }}
                              className="px-2 py-1.5 text-[11px] bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-600 font-medium text-center cursor-pointer"
                            >
                              Tanpa Batas
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Row: Proyek SAPA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="w-full sm:w-72 lg:w-80 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                Proyek SAPA
              </label>
              <div className="w-full max-w-xl relative">
                <div
                  onClick={() => {
                    setOpenDropdownKey(openDropdownKey === 'project-select' ? null : 'project-select');
                    setDropdownSearchText('');
                  }}
                  className="w-full h-11 sm:h-12 bg-white border border-slate-200 rounded-xl px-4 flex items-center justify-between text-sm shadow-xs cursor-pointer select-none hover:border-slate-300"
                >
                  <span className={activeProject ? 'text-slate-800 font-medium truncate' : 'text-slate-400'}>
                    {activeProject?.namaKegiatan || 'Search...'}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                    <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>

                {/* Popover Dropdown for Proyek SAPA */}
                {openDropdownKey === 'project-select' && (
                  <div
                    ref={dropdownRef}
                    className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={dropdownSearchText}
                        onChange={(e) => setDropdownSearchText(e.target.value)}
                        placeholder="Cari Proyek SAPA..."
                        autoFocus
                        className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                      />
                      {dropdownSearchText && (
                        <button
                          type="button"
                          onClick={() => setDropdownSearchText('')}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {filteredProjects.length === 0 ? (
                        <div className="p-3 text-center text-slate-400">Proyek tidak ditemukan</div>
                      ) : (
                        filteredProjects.map((p) => {
                          const isSelected = p.id === currentProjectId;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setCurrentProjectId(p.id);
                                setOpenDropdownKey(null);
                              }}
                              className={`w-full px-3 py-2 text-left rounded-lg flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-[#e6f4f5] text-[#008d91] font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div>
                                <span className="font-medium text-slate-800 block">{p.namaKegiatan}</span>
                                <span className="text-[10px] text-slate-400">
                                  {p.jenisProyek} • Divisi {p.divisi}
                                </span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row: Gunakan Template Rekomendasi To-Do List */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="w-full sm:w-72 lg:w-80 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                Gunakan Template Rekomendasi To-Do List
              </label>
              <div className="w-full max-w-xl flex items-center">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isTemplateChecked}
                  onClick={handleToggleTemplate}
                  className="w-6 h-6 rounded-md border-2 border-[#008d91] bg-white flex items-center justify-center cursor-pointer select-none transition-all hover:bg-teal-50"
                >
                  {isTemplateChecked && <Check className="w-4 h-4 text-[#008d91] stroke-[3]" />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Tasks Mapping */}
        {tasks.map((taskItem, taskIndex) => {
          const isSecondOrSubsequentTask = taskIndex >= 1;
          const taskAssigneeDropdownKey = `task-${taskIndex}-assignee`;
          const isTaskAssigneeOpen = openDropdownKey === taskAssigneeDropdownKey;

          return (
            <div key={taskItem.id || taskIndex} className="space-y-4 pt-2">
              {/* Header above Task 2 and subsequent */}
              {isSecondOrSubsequentTask && (
                <div className="flex items-center gap-2 pt-2">
                  <div
                    onClick={() => handleRemoveTask(taskIndex)}
                    className="w-4 h-4 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white flex items-center justify-center text-xs cursor-pointer shrink-0 transition-transform active:scale-90"
                    title="Hapus Task ini"
                  >
                    <X className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-[#008d91] font-semibold text-sm">Add Task</span>
                </div>
              )}

              {/* Row: Task Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="w-full sm:w-72 lg:w-80 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                  Task
                </label>
                <div className="w-full max-w-xl">
                  <input
                    type="text"
                    value={taskItem.task}
                    onChange={(e) => handleUpdateTaskField(taskIndex, 'task', e.target.value)}
                    placeholder="Input Text..."
                    className="w-full h-11 sm:h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#008d91] focus:border-[#008d91] placeholder:text-slate-300 shadow-xs"
                  />
                </div>
              </div>

              {/* For Task kedua dan selanjutnya: Dimulai Setelah Sub-Task Lain? */}
              {isSecondOrSubsequentTask && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="w-full sm:w-72 lg:w-80 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                      Dimulai Setelah Sub-Task Lain?
                    </label>
                    <div className="w-full max-w-xl flex items-center">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={!!taskItem.dependsOnSubTask}
                        onClick={() => {
                          const nextVal = !taskItem.dependsOnSubTask;
                          handleUpdateTaskField(taskIndex, 'dependsOnSubTask', nextVal);
                          if (nextVal && (!taskItem.prerequisites || taskItem.prerequisites.length === 0)) {
                            handleUpdateTaskField(taskIndex, 'prerequisites', [
                              {
                                id: `prereq-${Date.now()}`,
                                subTaskId: '',
                                subTaskTitle: '',
                                requiredStatus: 'Sedang Dikerjakan',
                              },
                            ]);
                          }
                        }}
                        className="w-6 h-6 rounded-md border-2 border-[#008d91] bg-white flex items-center justify-center cursor-pointer select-none transition-all hover:bg-teal-50"
                      >
                        {taskItem.dependsOnSubTask && (
                          <Check className="w-4 h-4 text-[#008d91] stroke-[3]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Row: Sub-Task Sebelumnya (Appears when Dimulai Setelah Sub-Task Lain is checked) */}
                  {taskItem.dependsOnSubTask && (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                      <label className="w-full sm:w-72 lg:w-80 text-slate-700 font-normal text-sm sm:text-base shrink-0 pt-2">
                        Sub-Task Sebelumnya
                      </label>
                      <div className="w-full max-w-xl space-y-2">
                        {(taskItem.prerequisites && taskItem.prerequisites.length > 0
                          ? taskItem.prerequisites
                          : [
                              {
                                id: 'init-prereq',
                                subTaskId: '',
                                subTaskTitle: '',
                                requiredStatus: 'Sedang Dikerjakan' as const,
                              },
                            ]
                        ).map((rule, ruleIdx) => {
                          const subTaskDropdownKey = `task-${taskIndex}-prereq-${ruleIdx}-subtask`;
                          const statusDropdownKey = `task-${taskIndex}-prereq-${ruleIdx}-status`;
                          const isSubTaskOpen = openDropdownKey === subTaskDropdownKey;
                          const isStatusOpen = openDropdownKey === statusDropdownKey;

                          return (
                            <div key={rule.id || ruleIdx} className="flex items-center gap-2 flex-wrap">
                              {/* Dropdown 1: Search Sub-Task Sebelumnya */}
                              <div className="relative flex-1 min-w-[170px]">
                                <div
                                  onClick={() => {
                                    setOpenDropdownKey(isSubTaskOpen ? null : subTaskDropdownKey);
                                    setDropdownSearchText('');
                                  }}
                                  className="w-full h-10 sm:h-11 bg-white border border-slate-200 rounded-xl px-3 flex items-center justify-between text-xs sm:text-sm shadow-xs cursor-pointer select-none hover:border-slate-300"
                                >
                                  <span className={rule.subTaskTitle ? 'text-slate-800 font-medium truncate' : 'text-slate-400'}>
                                    {rule.subTaskTitle || 'Search...'}
                                  </span>
                                  <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                                    <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                                  </div>
                                </div>

                                {isSubTaskOpen && (
                                  <div
                                    ref={dropdownRef}
                                    className="absolute left-0 top-full mt-1.5 w-full sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-100"
                                  >
                                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-2">
                                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <input
                                        type="text"
                                        value={dropdownSearchText}
                                        onChange={(e) => setDropdownSearchText(e.target.value)}
                                        placeholder="Cari sub-task yang sudah diisi..."
                                        autoFocus
                                        className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                                      />
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                                      {allFilledSubTasks.length === 0 ? (
                                        <div className="p-3 text-center text-slate-400">
                                          Belum ada sub-task lain yang terisi
                                        </div>
                                      ) : (
                                        allFilledSubTasks
                                          .filter((st) =>
                                            dropdownSearchText.trim()
                                              ? st.title.toLowerCase().includes(dropdownSearchText.toLowerCase())
                                              : true
                                          )
                                          .map((st) => (
                                            <button
                                              key={st.id}
                                              type="button"
                                              onClick={() => {
                                                handleUpdatePrerequisiteRuleOnTask(taskIndex, ruleIdx, {
                                                  subTaskId: st.id,
                                                  subTaskTitle: st.title,
                                                });
                                                setOpenDropdownKey(null);
                                              }}
                                              className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs"
                                            >
                                              <div>
                                                <span className="font-semibold text-slate-800 block">{st.title}</span>
                                                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                                    {st.taskName && (
                                                      <span className="text-[10px] text-slate-400">
                                                        dari {st.taskName} {st.source ? `• ${st.source}` : ''}
                                                      </span>
                                                    )}
                                                    {st.currentStatus && (
                                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-50 text-[#008d91] font-medium border border-teal-100">
                                                        {st.currentStatus}
                                                      </span>
                                                    )}
                                                  </div>
                                              </div>
                                              {rule.subTaskId === st.id && (
                                                <Check className="w-3.5 h-3.5 text-[#008d91]" />
                                              )}
                                            </button>
                                          ))
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Dropdown 2: Search Status (Sedang Dikerjakan / Selesai) */}
                              <div className="relative flex-1 min-w-[150px]">
                                <div
                                  onClick={() => {
                                    setOpenDropdownKey(isStatusOpen ? null : statusDropdownKey);
                                  }}
                                  className="w-full h-10 sm:h-11 bg-white border border-slate-200 rounded-xl px-3 flex items-center justify-between text-xs sm:text-sm shadow-xs cursor-pointer select-none hover:border-slate-300"
                                >
                                  <span className={rule.requiredStatus ? 'text-slate-800 font-medium truncate' : 'text-slate-400'}>
                                    {rule.requiredStatus || 'Search...'}
                                  </span>
                                  <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                                    <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                                  </div>
                                </div>

                                {isStatusOpen && (
                                  <div
                                    ref={dropdownRef}
                                    className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100 min-w-[180px]"
                                  >
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg mb-1.5">
                                      <Search className="w-3 h-3 text-slate-400 shrink-0" />
                                      <input
                                        type="text"
                                        value={dropdownSearchText}
                                        onChange={(e) => setDropdownSearchText(e.target.value)}
                                        placeholder="Cari status..."
                                        autoFocus
                                        className="w-full bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                                      />
                                    </div>
                                    {(['Sedang Dikerjakan', 'Selesai'] as const)
                                      .filter((opt) =>
                                        dropdownSearchText.trim()
                                          ? opt.toLowerCase().includes(dropdownSearchText.toLowerCase())
                                          : true
                                      )
                                      .map((stOpt) => (
                                        <button
                                          key={stOpt}
                                          type="button"
                                          onClick={() => {
                                            handleUpdatePrerequisiteRuleOnTask(taskIndex, ruleIdx, {
                                              requiredStatus: stOpt,
                                            });
                                            setOpenDropdownKey(null);
                                          }}
                                          className={`w-full px-3 py-2 text-left rounded-lg flex items-center justify-between text-xs cursor-pointer ${
                                            rule.requiredStatus === stOpt
                                              ? 'bg-[#e6f4f5] text-[#008d91] font-semibold'
                                              : 'hover:bg-slate-50 text-slate-700'
                                          }`}
                                        >
                                          <span>{stOpt}</span>
                                          {rule.requiredStatus === stOpt && (
                                            <Check className="w-3.5 h-3.5 text-[#008d91]" />
                                          )}
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>

                              {/* Remove Rule X Button */}
                              <button
                                type="button"
                                onClick={() => handleRemovePrerequisiteRuleFromTask(taskIndex, ruleIdx)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Hapus syarat prasyarat"
                              >
                                <X className="w-4 h-4" />
                              </button>

                              {/* Add More Rule + Button */}
                              <button
                                type="button"
                                onClick={() => handleAddPrerequisiteRuleToTask(taskIndex)}
                                className="w-6 h-6 rounded-full bg-[#008d91] hover:bg-[#007a7e] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                                title="Tambah syarat sub-task lainnya"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Row: PIC */}
              <PicAssigneeSelector
                value={taskItem.idKaryawanAssignJob}
                onChange={(code) => handleUpdateTaskField(taskIndex, 'idKaryawanAssignJob', code)}
                karyawanList={karyawanList}
                identitasList={identitasList}
                organisasiList={organisasiList}
                label="PIC"
                onShowToast={onShowToast}
              />

              {/* Row: Deadline */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="w-full sm:w-72 lg:w-80 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                  Deadline
                </label>
                <div className="w-full max-w-xl relative">
                  <input
                    id={`task-deadline-${taskIndex}`}
                    type="date"
                    value={taskItem.deadline || ''}
                    onChange={(e) => handleUpdateTaskField(taskIndex, 'deadline', e.target.value)}
                    placeholder="Input Date..."
                    className="w-full h-11 sm:h-12 bg-white border border-slate-200 rounded-xl px-4 pr-11 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#008d91] focus:border-[#008d91] placeholder:text-slate-300 shadow-xs cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`task-deadline-${taskIndex}`) as HTMLInputElement;
                      try { el?.showPicker?.(); } catch (_) { el?.focus(); }
                    }}
                    title="Pilih Tanggal"
                    className="text-[#008d91] hover:text-[#007b7e] absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  >
                    <Calendar className="w-5 h-5 text-[#008d91]" />
                  </button>
                </div>
              </div>

              {/* Row: Deskripsi */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="w-full sm:w-72 lg:w-80 text-slate-700 font-normal text-sm sm:text-base shrink-0 pt-2">
                  Deskripsi
                </label>
                <div className="w-full max-w-xl">
                  <textarea
                    value={taskItem.deskripsi || ''}
                    onChange={(e) => handleUpdateTaskField(taskIndex, 'deskripsi', e.target.value)}
                    placeholder="Input Text..."
                    rows={4}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#008d91] focus:border-[#008d91] placeholder:text-slate-300 shadow-xs resize-y"
                  />
                </div>
              </div>

              {/* Sub-Tasks Blocks inside this Task */}
              {(taskItem.subTasks || []).map((subItem, subIndex) => {
                const isSecondOrSubsequentSub = subIndex >= 1;
                const subAssigneeDropdownKey = `subtask-${taskIndex}-${subIndex}-assignee`;
                const isSubAssigneeOpen = openDropdownKey === subAssigneeDropdownKey;

                return (
                  <div key={subItem.id || subIndex} className="pt-2">
                    {/* Header above Sub-Task Box */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        onClick={() => handleRemoveSubTask(taskIndex, subIndex)}
                        className="w-4 h-4 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white flex items-center justify-center text-xs cursor-pointer shrink-0 transition-transform active:scale-90"
                        title="Hapus Sub-Task ini"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-[#008d91] font-semibold text-sm">Tambahkan Sub-Task</span>
                    </div>

                    {/* Sub-Task Container Box: light grey/blue container as in screenshot */}
                    <div className="bg-[#f0f4f8] rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xs">
                      {/* Row: Sub-Task Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="w-full sm:w-64 lg:w-72 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                          Sub-Task
                        </label>
                        <div className="w-full max-w-xl">
                          <input
                            type="text"
                            value={subItem.title}
                            onChange={(e) =>
                              handleUpdateSubTaskField(taskIndex, subIndex, 'title', e.target.value)
                            }
                            placeholder="Input Text..."
                            className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#008d91] focus:border-[#008d91] placeholder:text-slate-300 shadow-xs"
                          />
                        </div>
                      </div>

                      {/* For Sub-Task kedua dan selanjutnya: Dimulai Setelah Sub-Task Lain? */}
                      {isSecondOrSubsequentSub && (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                            <label className="w-full sm:w-64 lg:w-72 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                              Dimulai Setelah Sub-Task Lain?
                            </label>
                            <div className="w-full max-w-xl flex items-center">
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={!!subItem.dependsOnSubTask}
                                onClick={() => {
                                  const nextVal = !subItem.dependsOnSubTask;
                                  handleUpdateSubTaskField(taskIndex, subIndex, 'dependsOnSubTask', nextVal);
                                  if (nextVal && (!subItem.prerequisites || subItem.prerequisites.length === 0)) {
                                    handleUpdateSubTaskField(taskIndex, subIndex, 'prerequisites', [
                                      {
                                        id: `prereq-${Date.now()}`,
                                        subTaskId: '',
                                        subTaskTitle: '',
                                        requiredStatus: 'Sedang Dikerjakan',
                                      },
                                    ]);
                                  }
                                }}
                                className="w-6 h-6 rounded-md border-2 border-[#008d91] bg-white flex items-center justify-center cursor-pointer select-none transition-all hover:bg-teal-50"
                              >
                                {subItem.dependsOnSubTask && (
                                  <Check className="w-4 h-4 text-[#008d91] stroke-[3]" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Row: Sub-Task Sebelumnya (Appears when Dimulai Setelah Sub-Task Lain is checked) */}
                          {subItem.dependsOnSubTask && (
                            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                              <label className="w-full sm:w-64 lg:w-72 text-slate-700 font-normal text-sm sm:text-base shrink-0 pt-2">
                                Sub-Task Sebelumnya
                              </label>
                              <div className="w-full max-w-xl space-y-2">
                                {(subItem.prerequisites && subItem.prerequisites.length > 0
                                  ? subItem.prerequisites
                                  : [
                                      {
                                        id: 'init-sub-prereq',
                                        subTaskId: '',
                                        subTaskTitle: '',
                                        requiredStatus: 'Sedang Dikerjakan' as const,
                                      },
                                    ]
                                ).map((rule, ruleIdx) => {
                                  const subTaskDropdownKey = `subtask-${taskIndex}-${subIndex}-prereq-${ruleIdx}-subtask`;
                                  const statusDropdownKey = `subtask-${taskIndex}-${subIndex}-prereq-${ruleIdx}-status`;
                                  const isSubTaskOpen = openDropdownKey === subTaskDropdownKey;
                                  const isStatusOpen = openDropdownKey === statusDropdownKey;

                                  return (
                                    <div key={rule.id || ruleIdx} className="flex items-center gap-2 flex-wrap">
                                      {/* Dropdown 1: Search Sub-Task Sebelumnya */}
                                      <div className="relative flex-1 min-w-[170px]">
                                        <div
                                          onClick={() => {
                                            setOpenDropdownKey(isSubTaskOpen ? null : subTaskDropdownKey);
                                            setDropdownSearchText('');
                                          }}
                                          className="w-full h-10 sm:h-11 bg-white border border-slate-200 rounded-xl px-3 flex items-center justify-between text-xs sm:text-sm shadow-xs cursor-pointer select-none hover:border-slate-300"
                                        >
                                          <span className={rule.subTaskTitle ? 'text-slate-800 font-medium truncate' : 'text-slate-400'}>
                                            {rule.subTaskTitle || 'Search...'}
                                          </span>
                                          <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                                            <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                                          </div>
                                        </div>

                                        {isSubTaskOpen && (
                                          <div
                                            ref={dropdownRef}
                                            className="absolute left-0 top-full mt-1.5 w-full sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-100"
                                          >
                                            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-2">
                                              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                              <input
                                                type="text"
                                                value={dropdownSearchText}
                                                onChange={(e) => setDropdownSearchText(e.target.value)}
                                                placeholder="Cari sub-task yang sudah diisi..."
                                                autoFocus
                                                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                                              />
                                            </div>
                                            <div className="max-h-40 overflow-y-auto space-y-0.5">
                                              {allFilledSubTasks.filter((st) => st.id !== subItem.id).length === 0 ? (
                                                <div className="p-3 text-center text-slate-400">
                                                  Belum ada sub-task lain yang terisi
                                                </div>
                                              ) : (
                                                allFilledSubTasks
                                                  .filter(
                                                    (st) =>
                                                      st.id !== subItem.id &&
                                                      (dropdownSearchText.trim()
                                                        ? st.title.toLowerCase().includes(dropdownSearchText.toLowerCase())
                                                        : true)
                                                  )
                                                  .map((st) => (
                                                    <button
                                                      key={st.id}
                                                      type="button"
                                                      onClick={() => {
                                                        handleUpdatePrerequisiteRuleOnSubTask(taskIndex, subIndex, ruleIdx, {
                                                          subTaskId: st.id,
                                                          subTaskTitle: st.title,
                                                        });
                                                        setOpenDropdownKey(null);
                                                      }}
                                                      className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs"
                                                    >
                                                      <div>
                                                        <span className="font-semibold text-slate-800 block">{st.title}</span>
                                                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                                            {st.taskName && (
                                                              <span className="text-[10px] text-slate-400">
                                                                dari {st.taskName} {st.source ? `• ${st.source}` : ''}
                                                              </span>
                                                            )}
                                                            {st.currentStatus && (
                                                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-50 text-[#008d91] font-medium border border-teal-100">
                                                                {st.currentStatus}
                                                              </span>
                                                            )}
                                                          </div>
                                                      </div>
                                                      {rule.subTaskId === st.id && (
                                                        <Check className="w-3.5 h-3.5 text-[#008d91]" />
                                                      )}
                                                    </button>
                                                  ))
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Dropdown 2: Search Status (Sedang Dikerjakan / Selesai) */}
                                      <div className="relative flex-1 min-w-[150px]">
                                        <div
                                          onClick={() => {
                                            setOpenDropdownKey(isStatusOpen ? null : statusDropdownKey);
                                          }}
                                          className="w-full h-10 sm:h-11 bg-white border border-slate-200 rounded-xl px-3 flex items-center justify-between text-xs sm:text-sm shadow-xs cursor-pointer select-none hover:border-slate-300"
                                        >
                                          <span className={rule.requiredStatus ? 'text-slate-800 font-medium truncate' : 'text-slate-400'}>
                                            {rule.requiredStatus || 'Search...'}
                                          </span>
                                          <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                                            <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                                          </div>
                                        </div>

                                        {isStatusOpen && (
                                          <div
                                            ref={dropdownRef}
                                            className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100 min-w-[180px]"
                                          >
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg mb-1.5">
                                              <Search className="w-3 h-3 text-slate-400 shrink-0" />
                                              <input
                                                type="text"
                                                value={dropdownSearchText}
                                                onChange={(e) => setDropdownSearchText(e.target.value)}
                                                placeholder="Cari status..."
                                                autoFocus
                                                className="w-full bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                                              />
                                            </div>
                                            {(['Sedang Dikerjakan', 'Selesai'] as const)
                                              .filter((opt) =>
                                                dropdownSearchText.trim()
                                                  ? opt.toLowerCase().includes(dropdownSearchText.toLowerCase())
                                                  : true
                                              )
                                              .map((stOpt) => (
                                                <button
                                                  key={stOpt}
                                                  type="button"
                                                  onClick={() => {
                                                    handleUpdatePrerequisiteRuleOnSubTask(taskIndex, subIndex, ruleIdx, {
                                                      requiredStatus: stOpt,
                                                    });
                                                    setOpenDropdownKey(null);
                                                  }}
                                                  className={`w-full px-3 py-2 text-left rounded-lg flex items-center justify-between text-xs cursor-pointer ${
                                                    rule.requiredStatus === stOpt
                                                      ? 'bg-[#e6f4f5] text-[#008d91] font-semibold'
                                                      : 'hover:bg-slate-50 text-slate-700'
                                                  }`}
                                                >
                                                  <span>{stOpt}</span>
                                                  {rule.requiredStatus === stOpt && (
                                                    <Check className="w-3.5 h-3.5 text-[#008d91]" />
                                                  )}
                                                </button>
                                              ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Remove Rule X Button */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemovePrerequisiteRuleFromSubTask(taskIndex, subIndex, ruleIdx)
                                        }
                                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                        title="Hapus syarat prasyarat"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>

                                      {/* Add More Rule + Button */}
                                      <button
                                        type="button"
                                        onClick={() => handleAddPrerequisiteRuleToSubTask(taskIndex, subIndex)}
                                        className="w-6 h-6 rounded-full bg-[#008d91] hover:bg-[#007a7e] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                                        title="Tambah syarat sub-task lainnya"
                                      >
                                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Row: PIC */}
                      <PicAssigneeSelector
                        value={subItem.idKaryawanAssignJob}
                        onChange={(code) => handleUpdateSubTaskField(taskIndex, subIndex, 'idKaryawanAssignJob', code)}
                        karyawanList={karyawanList}
                        identitasList={identitasList}
                        organisasiList={organisasiList}
                        label="PIC"
                        onShowToast={onShowToast}
                      />

                      {/* Row: Deadline */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="w-full sm:w-64 lg:w-72 text-slate-700 font-normal text-sm sm:text-base shrink-0">
                          Deadline
                        </label>
                        <div className="w-full max-w-xl relative">
                          <input
                            id={`subtask-deadline-${taskIndex}-${subIndex}`}
                            type="date"
                            value={subItem.deadline || ''}
                            onChange={(e) =>
                              handleUpdateSubTaskField(taskIndex, subIndex, 'deadline', e.target.value)
                            }
                            placeholder="Input Date..."
                            className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 pr-11 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#008d91] focus:border-[#008d91] placeholder:text-slate-300 shadow-xs cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById(`subtask-deadline-${taskIndex}-${subIndex}`) as HTMLInputElement;
                              try { el?.showPicker?.(); } catch (_) { el?.focus(); }
                            }}
                            title="Pilih Tanggal"
                            className="text-[#008d91] hover:text-[#007b7e] absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                          >
                            <Calendar className="w-5 h-5 text-[#008d91]" />
                          </button>
                        </div>
                      </div>

                      {/* Row: Deskripsi */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="w-full sm:w-64 lg:w-72 text-slate-700 font-normal text-sm sm:text-base shrink-0 pt-2">
                          Deskripsi
                        </label>
                        <div className="w-full max-w-xl">
                          <textarea
                            value={subItem.deskripsi || ''}
                            onChange={(e) =>
                              handleUpdateSubTaskField(taskIndex, subIndex, 'deskripsi', e.target.value)
                            }
                            placeholder="Input Text..."
                            rows={3}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#008d91] focus:border-[#008d91] placeholder:text-slate-300 shadow-xs resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* + Add Sub-Task button below subtasks */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleAddSubTask(taskIndex)}
                  className="flex items-center gap-2 text-[#008d91] font-semibold text-sm hover:underline cursor-pointer group select-none"
                >
                  <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Add Sub-Task</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* + Task button below all tasks */}
        <div className="pt-3">
          <button
            type="button"
            onClick={handleAddTask}
            className="flex items-center gap-2 text-[#008d91] font-semibold text-sm hover:underline cursor-pointer group select-none"
          >
            <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>Task</span>
          </button>
        </div>

        {/* Bottom Actions: Cancel & Save */}
        <div className="flex items-center justify-end gap-4 pt-10 pb-16">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-2.5 rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="px-10 py-2.5 rounded-full bg-[#008d91] hover:bg-[#007a7e] text-white font-medium text-sm transition-colors cursor-pointer shadow-xs"
          >
            Save
          </button>
        </div>
      </div>

      {/* Modal Add Jenis Non Proyek */}
      <AddEditJenisNonProyekModal
        isOpen={isAddJenisModalOpen}
        onClose={() => setIsAddJenisModalOpen(false)}
        onSave={handleSaveNewJenisNonProyek}
      />
    </div>
  );
};
