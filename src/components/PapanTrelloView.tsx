import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Plus,
  MoreVertical,
  AlertCircle,
  X,
  Check,
  Edit2,
  Trash2,
  ArrowRight,
  Clock,
  ChevronDown,
} from 'lucide-react';
import {
  PapanTrelloCard,
  getPapanTrelloCardsFromStorage,
  savePapanTrelloCardsToStorage,
  formatCardDeadline,
} from '../papanTrelloData';
import { ProjectItem, TodoTaskItem, KaryawanItem } from '../types';
import { saveTodosForProject, getTodosForProject } from '../todoListData';

const getFormattedTodayDate = (): string => {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

const getTodayIsoDate = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

interface PapanTrelloViewProps {
  projectsList?: ProjectItem[];
  projectTodos?: Record<string, TodoTaskItem[]>;
  selectedDivisi?: string;
  onSelectDivisi?: (divisi: string) => void;
  divisiOptions?: string[];
  onOpenFormTodoList?: (project?: ProjectItem) => void;
  onShowToast?: (_msg: string) => void;
  onUpdateTasks?: (projectId: string, tasks: TodoTaskItem[]) => void;
  karyawanList?: KaryawanItem[];
}

export const PapanTrelloView: React.FC<PapanTrelloViewProps> = ({
  projectsList = [],
  projectTodos = {},
  selectedDivisi = 'PNB',
  onSelectDivisi,
  divisiOptions = ['PNB', 'MAD', 'EVE', 'FUN', 'ALL'],
  onOpenFormTodoList,
  onShowToast = (_msg: string) => {},
  onUpdateTasks,
  karyawanList = [],
}) => {
  const [cards, setCards] = useState<PapanTrelloCard[]>(() => {
    return getPapanTrelloCardsFromStorage();
  });

  // Drag and drop states
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<PapanTrelloCard['stage'] | null>(null);

  const [currentDivisi, setCurrentDivisi] = useState<string>(selectedDivisi || 'PNB');
  const [currentDateDisplay, setCurrentDateDisplay] = useState<string>(() => getFormattedTodayDate());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDivisiPickerOpen, setIsDivisiPickerOpen] = useState(false);

  // Active menu dropdown for a card
  const [activeMenuCardId, setActiveMenuCardId] = useState<string | null>(null);

  // Modal for editing/viewing card
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<PapanTrelloCard | null>(null);

  // Modal for creating card
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStage, setCreateStage] = useState<PapanTrelloCard['stage']>('not_started_non_proyek');

  // Form states for create/edit
  const [formTaskName, setFormTaskName] = useState('');
  const [formSubTaskName, setFormSubTaskName] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formIdKaryawan, setFormIdKaryawan] = useState('00015');
  const [formDivisi, setFormDivisi] = useState('PNB');
  const [formProyekSapaOrJenis, setFormProyekSapaOrJenis] = useState('Jenis Proyek');
  const [formIsNonProyek, setFormIsNonProyek] = useState(true);
  const [formTanggalMulai, setFormTanggalMulai] = useState('');
  const [formTanggalSelesai, setFormTanggalSelesai] = useState('');
  const [formRiwayatTanggal, setFormRiwayatTanggal] = useState('');
  const [formHasKendala, setFormHasKendala] = useState(false);
  const [formKendalaKeterangan, setFormKendalaKeterangan] = useState('');
  const [formStatusPengerjaan, setFormStatusPengerjaan] = useState<'belum_mulai' | 'ongoing' | 'selesai' | 'pending'>('belum_mulai');

  const menuRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const divisiPickerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef(0);

  useEffect(() => {
    if (selectedDivisi) {
      setCurrentDivisi(selectedDivisi);
    }
  }, [selectedDivisi]);

  useEffect(() => {
    savePapanTrelloCardsToStorage(cards);
  }, [cards]);

  // Synchronize all sub-tasks from To-Do List (projectTodos) into Papan Trello
  useEffect(() => {
    if (!projectTodos || Object.keys(projectTodos).length === 0) return;

    setCards((prevCards) => {
      let updated = [...prevCards];
      let hasChanges = false;

      Object.entries(projectTodos).forEach(([pId, rawTasks]) => {
        if (!Array.isArray(rawTasks)) return;
        const tasks = rawTasks as TodoTaskItem[];
        const proj = projectsList.find((p) => p.id === pId);
        const isNonProyek =
          pId.startsWith('non-proj') ||
          pId === 'proj-non-proyek' ||
          proj?.jenisProyek === 'Non Proyek';

        tasks.forEach((t) => {
          if (t.subTasks && t.subTasks.length > 0) {
            t.subTasks.forEach((st) => {
              const idx = updated.findIndex(
                (c) =>
                  (c.projectId === pId && c.taskId === t.id && c.subTaskId === st.id) ||
                  (c.taskId === t.id && c.subTaskId === st.id) ||
                  (c.subTaskName === (st.title || (st as any).subTask) && c.taskName === t.task)
              );

              if (idx >= 0) {
                const ex = updated[idx];
                let stageChanged = false;
                let newStage = ex.stage;
                let newStatus = ex.statusPengerjaan;

                const subStatus: 'not_started' | 'ongoing' | 'completed' =
                  st.status ||
                  (st.completed ? 'completed' : (st.statusPengerjaan === 'ongoing' ? 'ongoing' : 'not_started'));

                if (subStatus === 'completed' && ex.stage !== 'selesai_pending') {
                  newStage = 'selesai_pending';
                  newStatus = 'selesai';
                  stageChanged = true;
                } else if (subStatus === 'ongoing' && ex.stage !== 'ongoing') {
                  newStage = 'ongoing';
                  newStatus = 'ongoing';
                  stageChanged = true;
                } else if (subStatus === 'not_started' && (ex.stage === 'selesai_pending' || ex.stage === 'ongoing')) {
                  newStage = isNonProyek ? 'not_started_non_proyek' : 'not_started_proyek_sapa';
                  newStatus = 'belum_mulai';
                  stageChanged = true;
                } else if (!st.completed && ex.stage === 'selesai_pending' && !st.status) {
                  newStage = ex.tanggalMulai
                    ? 'ongoing'
                    : isNonProyek
                    ? 'not_started_non_proyek'
                    : 'not_started_proyek_sapa';
                  newStatus = ex.tanggalMulai ? 'ongoing' : 'belum_mulai';
                  stageChanged = true;
                }

                if (
                  stageChanged ||
                  ex.projectId !== pId ||
                  ex.taskId !== t.id ||
                  ex.subTaskId !== st.id
                ) {
                  hasChanges = true;
                  updated[idx] = {
                    ...ex,
                    projectId: pId,
                    taskId: t.id,
                    subTaskId: st.id,
                    taskName: t.task,
                    subTaskName: st.title || (st as any).subTask || t.task,
                    deadline: formatCardDeadline(st.deadline || t.deadline || ex.deadline),
                    idKaryawan: st.idKaryawanAssignJob || t.idKaryawanAssignJob || ex.idKaryawan,
                    isNonProyek: isNonProyek || !!t.isNonProyek || !!st.isNonProyek,
                    proyekSapaOrJenisName: isNonProyek
                      ? t.jenisNonProyekNama || ex.proyekSapaOrJenisName || 'Jenis Non Rutin'
                      : proj?.namaKegiatan || 'Proyek SAPA',
                    divisi: st.divisi || t.divisi || proj?.divisi || ex.divisi || 'PNB',
                    stage: newStage,
                    statusPengerjaan: newStatus,
                  };
                }
              } else {
                hasChanges = true;
                const subStatus: 'not_started' | 'ongoing' | 'completed' =
                  st.status ||
                  (st.completed ? 'completed' : (st.statusPengerjaan === 'ongoing' ? 'ongoing' : 'not_started'));

                const newStage: PapanTrelloCard['stage'] =
                  subStatus === 'completed'
                    ? 'selesai_pending'
                    : subStatus === 'ongoing'
                    ? 'ongoing'
                    : isNonProyek
                    ? 'not_started_non_proyek'
                    : 'not_started_proyek_sapa';

                const newStatus: PapanTrelloCard['statusPengerjaan'] =
                  subStatus === 'completed'
                    ? 'selesai'
                    : subStatus === 'ongoing'
                    ? 'ongoing'
                    : 'belum_mulai';

                updated.push({
                  id: `pt-todo-${pId}-${t.id}-${st.id}`,
                  projectId: pId,
                  taskId: t.id,
                  subTaskId: st.id,
                  stage: newStage,
                  deadline: formatCardDeadline(st.deadline || t.deadline || '15/10'),
                  taskName: t.task || 'Task',
                  subTaskName: st.title || (st as any).subTask || t.task || 'Sub-Task',
                  idKaryawan: st.idKaryawanAssignJob || t.idKaryawanAssignJob || '00015',
                  karyawanInitial: 'S',
                  isNonProyek,
                  proyekSapaOrJenisName: isNonProyek
                    ? t.jenisNonProyekNama || 'Jenis Non Rutin'
                    : proj?.namaKegiatan || 'Proyek SAPA',
                  divisi: st.divisi || t.divisi || proj?.divisi || 'PNB',
                  statusPengerjaan: newStatus,
                  hasKendala: false,
                });
              }
            });
          } else {
            // Standalone task
            const idx = updated.findIndex(
              (c) =>
                (c.projectId === pId && c.taskId === t.id) ||
                c.taskId === t.id ||
                (c.taskName === t.task && c.subTaskName === t.task)
            );

            if (idx >= 0) {
              const ex = updated[idx];
              let stageChanged = false;
              let newStage = ex.stage;
              let newStatus = ex.statusPengerjaan;

              const taskStatus: 'not_started' | 'ongoing' | 'completed' =
                t.status ||
                (t.completed ? 'completed' : (t.statusPengerjaan === 'ongoing' ? 'ongoing' : 'not_started'));

              if (taskStatus === 'completed' && ex.stage !== 'selesai_pending') {
                newStage = 'selesai_pending';
                newStatus = 'selesai';
                stageChanged = true;
              } else if (taskStatus === 'ongoing' && ex.stage !== 'ongoing') {
                newStage = 'ongoing';
                newStatus = 'ongoing';
                stageChanged = true;
              } else if (taskStatus === 'not_started' && (ex.stage === 'selesai_pending' || ex.stage === 'ongoing')) {
                newStage = isNonProyek ? 'not_started_non_proyek' : 'not_started_proyek_sapa';
                newStatus = 'belum_mulai';
                stageChanged = true;
              } else if (!t.completed && ex.stage === 'selesai_pending' && !t.status) {
                newStage = ex.tanggalMulai
                  ? 'ongoing'
                  : isNonProyek
                  ? 'not_started_non_proyek'
                  : 'not_started_proyek_sapa';
                newStatus = ex.tanggalMulai ? 'ongoing' : 'belum_mulai';
                stageChanged = true;
              }

              if (stageChanged || ex.projectId !== pId || ex.taskId !== t.id) {
                hasChanges = true;
                updated[idx] = {
                  ...ex,
                  projectId: pId,
                  taskId: t.id,
                  taskName: t.task,
                  subTaskName: t.task,
                  deadline: formatCardDeadline(t.deadline || ex.deadline),
                  idKaryawan: t.idKaryawanAssignJob || ex.idKaryawan,
                  isNonProyek: isNonProyek || !!t.isNonProyek,
                  proyekSapaOrJenisName: isNonProyek
                    ? t.jenisNonProyekNama || ex.proyekSapaOrJenisName || 'Jenis Non Rutin'
                    : proj?.namaKegiatan || 'Proyek SAPA',
                  divisi: t.divisi || proj?.divisi || ex.divisi || 'PNB',
                  stage: newStage,
                  statusPengerjaan: newStatus,
                };
              }
            } else {
              hasChanges = true;
              updated.push({
                id: `pt-todo-${pId}-${t.id}-main`,
                projectId: pId,
                taskId: t.id,
                stage: t.completed
                  ? 'selesai_pending'
                  : isNonProyek
                  ? 'not_started_non_proyek'
                  : 'not_started_proyek_sapa',
                deadline: formatCardDeadline(t.deadline || '15/10'),
                taskName: t.task || 'Task',
                subTaskName: t.task || 'Task',
                idKaryawan: t.idKaryawanAssignJob || '00015',
                karyawanInitial: 'S',
                isNonProyek,
                proyekSapaOrJenisName: isNonProyek
                  ? t.jenisNonProyekNama || 'Jenis Non Rutin'
                  : proj?.namaKegiatan || 'Proyek SAPA',
                divisi: t.divisi || proj?.divisi || 'PNB',
                statusPengerjaan: t.completed ? 'selesai' : 'belum_mulai',
                hasKendala: false,
              });
            }
          }
        });
      });

      return hasChanges ? updated : prevCards;
    });
  }, [projectTodos, projectsList]);

  // Click outside listener for menu & pickers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuCardId(null);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (divisiPickerRef.current && !divisiPickerRef.current.contains(e.target as Node)) {
        setIsDivisiPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDivisiSelect = (div: string) => {
    setCurrentDivisi(div);
    if (onSelectDivisi) onSelectDivisi(div);
    setIsDivisiPickerOpen(false);
  };

  // Sync a single card's updated stage/completion to projectTodos in To-Do List
  const syncCardToTodoList = (
    card: PapanTrelloCard,
    targetStage: PapanTrelloCard['stage'],
    statusPengerjaan?: PapanTrelloCard['statusPengerjaan']
  ) => {
    const targetStatus: 'not_started' | 'ongoing' | 'completed' =
      targetStage === 'selesai_pending'
        ? 'completed'
        : targetStage === 'ongoing'
        ? 'ongoing'
        : 'not_started';
    const isCompleted = targetStatus === 'completed';
    const targetStatusPengerjaan: 'belum_mulai' | 'ongoing' | 'selesai' | 'pending' =
      targetStage === 'selesai_pending'
        ? (statusPengerjaan || 'selesai')
        : targetStage === 'ongoing'
        ? 'ongoing'
        : 'belum_mulai';

    let pId = card.projectId;
    let tId = card.taskId;
    let stId = card.subTaskId;

    // Search across all projectTodos if missing pId
    if (!pId) {
      for (const [projId, tasks] of Object.entries(projectTodos)) {
        if (!Array.isArray(tasks)) continue;
        for (const t of tasks) {
          if (t.id === tId || t.task === card.taskName) {
            pId = projId;
            tId = t.id;
            break;
          }
          if (t.subTasks) {
            const foundSub = t.subTasks.find(
              (s) =>
                s.id === stId ||
                s.title === card.subTaskName ||
                (s as any).subTask === card.subTaskName
            );
            if (foundSub) {
              pId = projId;
              tId = t.id;
              stId = foundSub.id;
              break;
            }
          }
        }
        if (pId) break;
      }
    }

    if (!pId) {
      pId = card.isNonProyek ? 'non-proj-jnp-1' : (projectsList[0]?.id || 'proj-1');
    }
    if (!tId) {
      tId = `task-${card.id}`;
      card.taskId = tId;
      card.projectId = pId;
    }

    const currentTasks = projectTodos[pId] || getTodosForProject(pId) || [];
    let taskFound = false;

    const updatedTasks = currentTasks.map((t) => {
      if (t.id !== tId && t.task !== card.taskName) return t;
      taskFound = true;

      if (stId && t.subTasks && t.subTasks.length > 0) {
        let subFound = false;
        const updatedSubs = t.subTasks.map((st) => {
          if (
            st.id === stId ||
            st.title === card.subTaskName ||
            (st as any).subTask === card.subTaskName
          ) {
            subFound = true;
            return {
              ...st,
              status: targetStatus,
              statusPengerjaan: targetStatusPengerjaan,
              completed: isCompleted,
              divisi: card.divisi || st.divisi,
            };
          }
          return st;
        });

        if (!subFound) {
          updatedSubs.push({
            id: stId,
            title: card.subTaskName,
            deadline: card.deadline,
            idKaryawanAssignJob: card.idKaryawan,
            status: targetStatus,
            statusPengerjaan: targetStatusPengerjaan,
            completed: isCompleted,
            divisi: card.divisi,
            isNonProyek: card.isNonProyek,
          });
        }

        const allDone = updatedSubs.length > 0 && updatedSubs.every((s) => s.completed);
        return {
          ...t,
          subTasks: updatedSubs,
          completed: allDone,
          status: allDone ? 'completed' : updatedSubs.some((s) => s.status === 'ongoing') ? 'ongoing' : 'not_started',
        };
      } else {
        return {
          ...t,
          status: targetStatus,
          statusPengerjaan: targetStatusPengerjaan,
          completed: isCompleted,
        };
      }
    });

    if (!taskFound) {
      updatedTasks.push({
        id: tId,
        task: card.taskName,
        deadline: card.deadline,
        idKaryawanAssignJob: card.idKaryawan,
        status: targetStatus,
        statusPengerjaan: targetStatusPengerjaan,
        completed: isCompleted,
        isNonProyek: card.isNonProyek,
        jenisNonProyekNama: card.proyekSapaOrJenisName,
        divisi: card.divisi,
        subTasks: [
          {
            id: stId || `sub-${card.id}`,
            title: card.subTaskName,
            deadline: card.deadline,
            idKaryawanAssignJob: card.idKaryawan,
            status: targetStatus,
            statusPengerjaan: targetStatusPengerjaan,
            completed: isCompleted,
            divisi: card.divisi,
            isNonProyek: card.isNonProyek,
          },
        ],
      });
    }

    saveTodosForProject(pId, updatedTasks);
    if (onUpdateTasks) {
      onUpdateTasks(pId, updatedTasks);
    }
  };

  const handleMoveStage = (
    cardId: string,
    targetStage: PapanTrelloCard['stage'],
    targetCardId?: string
  ) => {
    let cardToSync: PapanTrelloCard | undefined;
    let finalStatus: PapanTrelloCard['statusPengerjaan'];

    setCards((prev) => {
      const sourceIndex = prev.findIndex((c) => c.id === cardId);
      if (sourceIndex === -1) return prev;
      const sourceCard = prev[sourceIndex];

      let newStatus: PapanTrelloCard['statusPengerjaan'] = sourceCard.statusPengerjaan;
      let tMulai = sourceCard.tanggalMulai;
      let tSelesai = sourceCard.tanggalSelesai;
      let riwayat = sourceCard.riwayatTanggalPengerjaan;

      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;

      if (targetStage === 'ongoing') {
        newStatus = 'ongoing';
        if (!tMulai) tMulai = dateStr;
      } else if (targetStage === 'selesai_pending') {
        if (!newStatus || newStatus === 'ongoing' || newStatus === 'belum_mulai') {
          newStatus = 'selesai';
        }
        if (!tMulai) tMulai = '20/10';
        if (!tSelesai) tSelesai = dateStr;
      } else {
        newStatus = 'belum_mulai';
      }

      finalStatus = newStatus;
      const isNonProyek =
        targetStage === 'not_started_non_proyek'
          ? true
          : targetStage === 'not_started_proyek_sapa'
          ? false
          : sourceCard.isNonProyek;

      const modCard: PapanTrelloCard = {
        ...sourceCard,
        stage: targetStage,
        statusPengerjaan: newStatus,
        isNonProyek,
        tanggalMulai: tMulai,
        tanggalSelesai: tSelesai,
        riwayatTanggalPengerjaan: riwayat,
      };
      cardToSync = modCard;

      const withoutSource = prev.filter((c) => c.id !== cardId);
      if (targetCardId && targetCardId !== cardId) {
        const targetIdx = withoutSource.findIndex((c) => c.id === targetCardId);
        if (targetIdx !== -1) {
          const nextList = [...withoutSource];
          nextList.splice(targetIdx, 0, modCard);
          return nextList;
        }
      }

      return [...withoutSource, modCard];
    });

    if (cardToSync) {
      syncCardToTodoList(cardToSync, targetStage, finalStatus);
    }

    setActiveMenuCardId(null);
    const colTitle =
      targetStage === 'not_started_non_proyek'
        ? 'Not Started Non Proyek'
        : targetStage === 'not_started_proyek_sapa'
        ? 'Not Started Proyek SAPA'
        : targetStage === 'ongoing'
        ? 'Ongoing'
        : 'Selesai / Status Pending';

    onShowToast(`Kartu dipindahkan ke "${colTitle}" & disinkronkan ke To-Do List`);
  };

  // Drag and drop handlers
  const handleCardDragStart = (e: React.DragEvent, cardId: string) => {
    isDraggingRef.current = true;
    dragStartTimeRef.current = Date.now();
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCardId(cardId);
  };

  const handleCardDragEnd = () => {
    setDraggedCardId(null);
    setDragOverColumnId(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
  };

  const handleColumnDragOver = (e: React.DragEvent, colId: PapanTrelloCard['stage']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleColumnDragEnter = (e: React.DragEvent, colId: PapanTrelloCard['stage']) => {
    e.preventDefault();
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumnId(null);
    }
  };

  const handleColumnDrop = (
    e: React.DragEvent,
    colId: PapanTrelloCard['stage'],
    targetCardId?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (cardId) {
      handleMoveStage(cardId, colId, targetCardId);
    }
    setDraggedCardId(null);
    setDragOverColumnId(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
  };

  const handleCardClick = (e: React.MouseEvent, card: PapanTrelloCard) => {
    if (isDraggingRef.current || Date.now() - dragStartTimeRef.current < 250) {
      return;
    }
    openEditModal(card);
  };

  const handleToggleKendala = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const nextKendala = !c.hasKendala;
        return {
          ...c,
          hasKendala: nextKendala,
          kendalaKeterangan: nextKendala ? c.kendalaKeterangan || 'Kendala operasional' : '',
        };
      })
    );
    setActiveMenuCardId(null);
    onShowToast('Status kendala diperbarui');
  };

  const handleDeleteCard = (cardId: string) => {
    const cardToDelete = cards.find((c) => c.id === cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setActiveMenuCardId(null);
    if (selectedCardForEdit?.id === cardId) setSelectedCardForEdit(null);

    // Sync deletion with To-Do List
    if (cardToDelete?.projectId && cardToDelete?.taskId) {
      const pId = cardToDelete.projectId;
      const currentTasks = projectTodos[pId] || getTodosForProject(pId) || [];
      let updatedTasks: TodoTaskItem[] = [];

      if (cardToDelete.subTaskId) {
        updatedTasks = currentTasks.map((t) => {
          if (t.id !== cardToDelete.taskId) return t;
          return {
            ...t,
            subTasks: (t.subTasks || []).filter((st) => st.id !== cardToDelete.subTaskId),
          };
        });
      } else {
        updatedTasks = currentTasks.filter((t) => t.id !== cardToDelete.taskId);
      }

      saveTodosForProject(pId, updatedTasks);
      if (onUpdateTasks) {
        onUpdateTasks(pId, updatedTasks);
      }
    }

    onShowToast('Kartu berhasil dihapus dari Papan Trello & To-Do List');
  };

  const openCreateModal = (stage: PapanTrelloCard['stage']) => {
    setCreateStage(stage);
    const isNonProj = stage === 'not_started_non_proyek';
    setFormTaskName('');
    setFormSubTaskName('');
    setFormDeadline('15/10');
    setFormIdKaryawan('00015');
    setFormDivisi(currentDivisi === 'ALL' ? 'PNB' : currentDivisi);
    setFormIsNonProyek(isNonProj);
    setFormProyekSapaOrJenis(isNonProj ? 'Jenis Non Rutin' : 'Proyek SAPA');
    setFormTanggalMulai(stage === 'ongoing' ? '22/10' : '');
    setFormTanggalSelesai(stage === 'selesai_pending' ? '24/10' : '');
    setFormRiwayatTanggal('');
    setFormHasKendala(false);
    setFormKendalaKeterangan('');
    setFormStatusPengerjaan(stage === 'ongoing' ? 'ongoing' : stage === 'selesai_pending' ? 'selesai' : 'belum_mulai');
    setIsCreateModalOpen(true);
  };

  const handleSaveNewCard = () => {
    if (!formSubTaskName.trim() && !formTaskName.trim()) {
      onShowToast('Mohon isi nama Task atau Sub-Task');
      return;
    }

    const targetProjId = formIsNonProyek ? 'non-proj-jnp-1' : (projectsList[0]?.id || 'proj-1');
    const newTaskId = `task-${Date.now()}`;
    const newSubTaskId = `sub-${Date.now()}`;
    const isCompleted = createStage === 'selesai_pending' && formStatusPengerjaan === 'selesai';

    const newCard: PapanTrelloCard = {
      id: `pt-card-${Date.now()}`,
      stage: createStage,
      deadline: formDeadline || '15/10',
      taskName: formTaskName.trim() || 'Task',
      subTaskName: formSubTaskName.trim() || formTaskName.trim(),
      idKaryawan: formIdKaryawan || '00015',
      karyawanInitial: formIdKaryawan === '00015' ? 'S' : 'D',
      isNonProyek: formIsNonProyek,
      proyekSapaOrJenisName: formProyekSapaOrJenis || (formIsNonProyek ? 'Jenis Non Rutin' : 'Proyek SAPA'),
      divisi: formDivisi || 'PNB',
      statusPengerjaan: formStatusPengerjaan,
      tanggalMulai: formTanggalMulai,
      tanggalSelesai: formTanggalSelesai,
      riwayatTanggalPengerjaan: formRiwayatTanggal,
      hasKendala: formHasKendala,
      kendalaKeterangan: formKendalaKeterangan,
      projectId: targetProjId,
      taskId: newTaskId,
      subTaskId: newSubTaskId,
    };

    setCards((prev) => [newCard, ...prev]);

    // Add to projectTodos in To-Do List
    const currentTasks = projectTodos[targetProjId] || getTodosForProject(targetProjId) || [];
    const updatedTasks: TodoTaskItem[] = [
      ...currentTasks,
      {
        id: newTaskId,
        task: newCard.taskName,
        deadline: newCard.deadline,
        idKaryawanAssignJob: newCard.idKaryawan,
        completed: isCompleted,
        isNonProyek: formIsNonProyek,
        jenisNonProyekNama: newCard.proyekSapaOrJenisName,
        divisi: newCard.divisi,
        subTasks: [
          {
            id: newSubTaskId,
            title: newCard.subTaskName,
            deadline: newCard.deadline,
            idKaryawanAssignJob: newCard.idKaryawan,
            completed: isCompleted,
            divisi: newCard.divisi,
            isNonProyek: formIsNonProyek,
          },
        ],
      },
    ];

    saveTodosForProject(targetProjId, updatedTasks);
    if (onUpdateTasks) {
      onUpdateTasks(targetProjId, updatedTasks);
    }

    setIsCreateModalOpen(false);
    onShowToast('Kartu baru berhasil ditambahkan & terintegrasi dengan To-Do List');
  };

  const openEditModal = (card: PapanTrelloCard) => {
    setSelectedCardForEdit(card);
    setFormTaskName(card.taskName);
    setFormSubTaskName(card.subTaskName);
    setFormDeadline(card.deadline);
    setFormIdKaryawan(card.idKaryawan);
    setFormDivisi(card.divisi);
    setFormIsNonProyek(card.isNonProyek);
    setFormProyekSapaOrJenis(card.proyekSapaOrJenisName);
    setFormTanggalMulai(card.tanggalMulai || '');
    setFormTanggalSelesai(card.tanggalSelesai || '');
    setFormRiwayatTanggal(card.riwayatTanggalPengerjaan || '');
    setFormHasKendala(card.hasKendala);
    setFormKendalaKeterangan(card.kendalaKeterangan || '');
    setFormStatusPengerjaan(card.statusPengerjaan || 'belum_mulai');
  };

  const handleSaveEditCard = () => {
    if (!selectedCardForEdit) return;

    const isCompleted =
      selectedCardForEdit.stage === 'selesai_pending' &&
      (formStatusPengerjaan === 'selesai' || formStatusPengerjaan === undefined);

    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCardForEdit.id) return c;
        return {
          ...c,
          taskName: formTaskName.trim() || c.taskName,
          subTaskName: formSubTaskName.trim() || c.subTaskName,
          deadline: formDeadline || c.deadline,
          idKaryawan: formIdKaryawan || c.idKaryawan,
          karyawanInitial: formIdKaryawan === '00015' ? 'S' : 'D',
          isNonProyek: formIsNonProyek,
          proyekSapaOrJenisName: formProyekSapaOrJenis || c.proyekSapaOrJenisName,
          divisi: formDivisi || c.divisi,
          statusPengerjaan: formStatusPengerjaan,
          tanggalMulai: formTanggalMulai,
          tanggalSelesai: formTanggalSelesai,
          riwayatTanggalPengerjaan: formRiwayatTanggal,
          hasKendala: formHasKendala,
          kendalaKeterangan: formKendalaKeterangan,
        };
      })
    );

    // Sync edited card with To-Do List projectTodos
    if (selectedCardForEdit.projectId && selectedCardForEdit.taskId) {
      const pId = selectedCardForEdit.projectId;
      const currentTasks = projectTodos[pId] || getTodosForProject(pId) || [];
      const updatedTasks = currentTasks.map((t) => {
        if (t.id !== selectedCardForEdit.taskId) return t;
        const updatedSubs = (t.subTasks || []).map((st) => {
          if (st.id === selectedCardForEdit.subTaskId) {
            const currentSubStatus: 'not_started' | 'ongoing' | 'completed' =
              selectedCardForEdit.stage === 'selesai_pending' || isCompleted
                ? 'completed'
                : selectedCardForEdit.stage === 'ongoing' || formStatusPengerjaan === 'ongoing'
                ? 'ongoing'
                : 'not_started';
            return {
              ...st,
              title: formSubTaskName.trim() || st.title,
              deadline: formDeadline || st.deadline,
              idKaryawanAssignJob: formIdKaryawan || st.idKaryawanAssignJob,
              divisi: formDivisi || st.divisi,
              completed: isCompleted,
              status: currentSubStatus,
              statusPengerjaan: formStatusPengerjaan,
            };
          }
          return st;
        });
        const currentTaskStatus: 'not_started' | 'ongoing' | 'completed' =
          updatedSubs.length > 0
            ? (updatedSubs.every((s) => s.completed) ? 'completed' : updatedSubs.some((s) => s.status === 'ongoing') ? 'ongoing' : 'not_started')
            : (selectedCardForEdit.stage === 'selesai_pending' || isCompleted ? 'completed' : selectedCardForEdit.stage === 'ongoing' || formStatusPengerjaan === 'ongoing' ? 'ongoing' : 'not_started');
        return {
          ...t,
          task: formTaskName.trim() || t.task,
          deadline: formDeadline || t.deadline,
          idKaryawanAssignJob: formIdKaryawan || t.idKaryawanAssignJob,
          divisi: formDivisi || t.divisi,
          subTasks: updatedSubs,
          completed: updatedSubs.length > 0 ? updatedSubs.every((s) => s.completed) : isCompleted,
          status: currentTaskStatus,
          statusPengerjaan: formStatusPengerjaan,
        };
      });
      saveTodosForProject(pId, updatedTasks);
      if (onUpdateTasks) {
        onUpdateTasks(pId, updatedTasks);
      }
    }

    setSelectedCardForEdit(null);
    onShowToast('Perubahan kartu berhasil disimpan & disinkronkan ke To-Do List');
  };

  // Columns definition matching user's uploaded image
  const COLUMNS: Array<{
    id: PapanTrelloCard['stage'];
    title: string;
    hasAddButton: boolean;
  }> = [
    {
      id: 'not_started_non_proyek',
      title: 'Not Started Non Proyek',
      hasAddButton: true,
    },
    {
      id: 'not_started_proyek_sapa',
      title: 'Not Started Proyek SAPA',
      hasAddButton: true,
    },
    {
      id: 'ongoing',
      title: 'Ongoing',
      hasAddButton: false,
    },
    {
      id: 'selesai_pending',
      title: 'Selesai / Status Pending',
      hasAddButton: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar with Two Teal Cards: Tanggal (Kiri) & Divisi (Kanan) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        {/* Left Teal Card: Tanggal / Tanggal Hari Ini + Calendar Button */}
        <div className="relative self-start sm:self-auto" ref={datePickerRef}>
          <div className="bg-[#008d91] text-white rounded-2xl px-5 py-3.5 flex items-center justify-between gap-6 shadow-sm min-w-[220px] sm:min-w-[260px]">
            <div>
              <span className="text-[11px] text-white/80 font-normal block leading-tight">
                Tanggal
              </span>
              <span className="text-lg font-bold text-white tracking-wide block leading-snug">
                {currentDateDisplay}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              title="Pilih Tanggal Acuan"
              className="w-10 h-10 bg-white text-[#008d91] rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Calendar className="w-5 h-5 text-[#008d91]" />
            </button>
          </div>

          {/* Date Picker Popover */}
          {isDatePickerOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Pilih Tanggal Acuan
              </span>
              <input
                type="date"
                defaultValue={getTodayIsoDate()}
                onChange={(e) => {
                  if (e.target.value) {
                    const d = new Date(e.target.value);
                    const months = [
                      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
                    ];
                    setCurrentDateDisplay(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
                    setIsDatePickerOpen(false);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl mb-2 focus:outline-none focus:border-[#008d91]"
              />
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentDateDisplay(getFormattedTodayDate());
                    setIsDatePickerOpen(false);
                  }}
                  className="px-2 py-1.5 bg-[#008d91] text-white font-bold rounded-lg hover:bg-[#007b7f] transition-colors text-center cursor-pointer shadow-xs"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentDateDisplay('1 Jan 2021');
                    setIsDatePickerOpen(false);
                  }}
                  className="px-2 py-1.5 bg-slate-50 hover:bg-teal-50 rounded-lg text-slate-700 hover:text-[#008d91] transition-colors text-center cursor-pointer"
                >
                  1 Jan 2021
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Teal Card: Divisi + Selector Button */}
        <div className="relative self-end sm:self-auto" ref={divisiPickerRef}>
          <div className="bg-[#008d91] text-white rounded-2xl px-5 py-3.5 flex items-center justify-between gap-6 shadow-sm min-w-[220px] sm:min-w-[260px]">
            <div>
              <span className="text-[11px] text-white/80 font-normal block leading-tight">
                Divisi
              </span>
              <span className="text-lg font-bold text-white tracking-wide block leading-snug">
                {currentDivisi === 'ALL' ? 'Semua Divisi (ALL)' : `Divisi ${currentDivisi}`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDivisiPickerOpen(!isDivisiPickerOpen)}
              title="Pilih Divisi"
              className="w-10 h-10 bg-white text-[#008d91] rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Calendar className="w-5 h-5 text-[#008d91]" />
            </button>
          </div>

          {/* Divisi Popover */}
          {isDivisiPickerOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 py-1 mb-1">
                Pilih Divisi
              </span>
              {(divisiOptions && divisiOptions.length > 0 ? (divisiOptions.includes('ALL') ? divisiOptions : [...divisiOptions, 'ALL']) : ['PNB', 'MAD', 'EVE', 'FUN', 'HRD', 'IT', 'ALL']).map((div) => (
                <button
                  key={div}
                  type="button"
                  onClick={() => handleDivisiSelect(div)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer font-semibold transition-colors ${
                    currentDivisi === div
                      ? 'bg-teal-50 text-[#008d91]'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{div === 'ALL' ? 'Semua Divisi (ALL)' : `Divisi ${div}`}</span>
                  {currentDivisi === div && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4 Kanban Columns matching the exact layout in uploaded image */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 min-w-[1000px] items-start">
          {COLUMNS.map((column) => {
            const columnCards = cards.filter((c) => c.stage === column.id);

            return (
              <div
                key={column.id}
                onDragOver={(e) => handleColumnDragOver(e, column.id)}
                onDragEnter={(e) => handleColumnDragEnter(e, column.id)}
                onDragLeave={handleColumnDragLeave}
                onDrop={(e) => handleColumnDrop(e, column.id)}
                className={`bg-[#e5e7eb] rounded-3xl p-4 sm:p-5 flex flex-col min-h-[460px] shadow-2xs transition-all ${
                  dragOverColumnId === column.id ? 'ring-2 ring-[#008d91] ring-offset-2 bg-slate-200/90' : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2">
                  <h2 className="font-bold text-slate-700 text-sm sm:text-[15px] leading-tight">
                    {column.title}
                  </h2>

                  {column.hasAddButton && (
                    <button
                      type="button"
                      onClick={() => {
                        if (column.id === 'not_started_non_proyek' && onOpenFormTodoList) {
                          // Provide shortcut or open modal
                          openCreateModal(column.id);
                        } else if (column.id === 'not_started_proyek_sapa' && onOpenFormTodoList) {
                          openCreateModal(column.id);
                        } else {
                          openCreateModal(column.id);
                        }
                      }}
                      title={`Tambah item ke ${column.title}`}
                      className="w-6 h-6 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white flex items-center justify-center cursor-pointer transition-transform active:scale-90 shadow-2xs shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  )}
                </div>

                {/* Card List */}
                <div
                  onDragOver={(e) => handleColumnDragOver(e, column.id)}
                  onDrop={(e) => handleColumnDrop(e, column.id)}
                  className="space-y-3 flex-1 overflow-y-auto pr-0.5"
                >
                  {columnCards.length === 0 ? (
                    <div
                      onDragOver={(e) => handleColumnDragOver(e, column.id)}
                      onDrop={(e) => {
                        e.stopPropagation();
                        handleColumnDrop(e, column.id);
                      }}
                      className={`h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-colors ${
                        dragOverColumnId === column.id
                          ? 'border-[#008d91] bg-teal-50/50'
                          : 'border-slate-300'
                      }`}
                    >
                      <span className="text-xs text-slate-400 font-medium">Belum ada kartu</span>
                      {column.hasAddButton && (
                        <button
                          type="button"
                          onClick={() => openCreateModal(column.id)}
                          className="mt-1.5 text-[11px] font-semibold text-[#008d91] hover:underline cursor-pointer"
                        >
                          + Tambah Kartu
                        </button>
                      )}
                    </div>
                  ) : (
                    columnCards.map((card) => {
                      const isMenuOpen = activeMenuCardId === card.id;
                      const emp = karyawanList.find(
                        (k) => k.kodeKaryawan === card.idKaryawan || k.id === card.idKaryawan
                      );
                      const initial =
                        emp?.avatarInitial ||
                        emp?.namaLengkap?.charAt(0)?.toUpperCase() ||
                        card.karyawanInitial ||
                        'S';

                      return (
                        <div
                          key={card.id}
                          draggable={true}
                          onDragStart={(e) => handleCardDragStart(e, card.id)}
                          onDragEnd={handleCardDragEnd}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.dropEffect = 'move';
                            if (dragOverColumnId !== column.id) {
                              setDragOverColumnId(column.id);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleColumnDrop(e, column.id, card.id);
                          }}
                          onClick={(e) => handleCardClick(e, card)}
                          className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing relative group flex flex-col justify-between min-h-[110px] ${
                            draggedCardId === card.id ? 'opacity-40 ring-2 ring-[#008d91] scale-[0.98]' : ''
                          }`}
                        >
                          {/* Row 1: Tanggal Deadline - Task & Three Dots Menu */}
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className="text-xs sm:text-[13px] text-slate-500 font-normal truncate flex-1 min-w-0 tracking-tight"
                                title={`${formatCardDeadline(card.deadline)} - ${card.taskName}`}
                              >
                                {formatCardDeadline(card.deadline)} - {card.taskName}
                              </span>

                              {/* Three Dots Button */}
                              <div
                                className="relative shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveMenuCardId(isMenuOpen ? null : card.id)
                                  }
                                  title="Opsi Kartu"
                                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                  <div
                                    ref={menuRef}
                                    className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 space-y-1"
                                  >
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2.5 py-1">
                                      Pindahkan Kolom
                                    </span>
                                    {COLUMNS.filter((col) => col.id !== card.stage).map((col) => (
                                      <button
                                        key={col.id}
                                        type="button"
                                        onClick={() => handleMoveStage(card.id, col.id)}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                                      >
                                        <span className="truncate">{col.title}</span>
                                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                                      </button>
                                    ))}

                                    <div className="border-t border-slate-100 my-1 pt-1" />

                                    <button
                                      type="button"
                                      onClick={() => handleToggleKendala(card.id)}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                                    >
                                      <span>{card.hasKendala ? 'Hapus Kendala' : 'Tandai Ada Kendala'}</span>
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuCardId(null);
                                        openEditModal(card);
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                                    >
                                      <span>Edit Detail Kartu</span>
                                      <Edit2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCard(card.id)}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-between cursor-pointer font-medium"
                                    >
                                      <span>Hapus Kartu</span>
                                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Row 2: Sub-Task Name */}
                            <h3 className="font-bold text-slate-800 text-sm sm:text-[15px] pt-1 pb-2 leading-snug line-clamp-2">
                              {card.subTaskName}
                            </h3>
                          </div>

                          {/* Row 3: Bottom Meta (Avatar & ID, Tanggal Pengerjaan, Badges, Kendala) */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/70">
                            {/* Left: ID yang mengerjakan */}
                            <div
                              title={`ID Karyawan: ${card.idKaryawan || '00015'} ${card.karyawanNama ? `(${card.karyawanNama})` : ''}`}
                              className="flex items-center gap-1.5 shrink-0 select-none"
                            >
                              <div
                                className="w-6 h-6 rounded-full bg-[#64748b] text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                              >
                                {initial}
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 tracking-tight">
                                {card.idKaryawan || '00015'}
                              </span>
                            </div>

                            {/* Right: Tanggal Pengerjaan, Proyek/Jenis Pill, Divisi Pill, Kendala Icon */}
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              {/* Tanggal Pengerjaan:
                                - jika sudah dimulai, munculkan tanggal mulai (contoh: 22/10)
                                - jika sudah selesai munculkan tanggal mulai dan selesai (contoh: 20/10-24/10)
                                - jika pending tulis semua tanggal pengerjaan (contoh: 22/10-23/10, 25/10-27/10)
                              */}
                              {card.statusPengerjaan === 'pending' || (card.stage === 'selesai_pending' && card.riwayatTanggalPengerjaan) ? (
                                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap" title="Riwayat tanggal pengerjaan pending">
                                  {card.riwayatTanggalPengerjaan || '22/10-23/10, 25/10-27/10'}
                                </span>
                              ) : (card.statusPengerjaan === 'selesai' || card.stage === 'selesai_pending') ? (
                                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap" title="Tanggal pengerjaan (mulai dan selesai)">
                                  {card.tanggalMulai && card.tanggalSelesai
                                    ? `${card.tanggalMulai}-${card.tanggalSelesai}`
                                    : '20/10-24/10'}
                                </span>
                              ) : (card.statusPengerjaan === 'ongoing' || card.stage === 'ongoing' || card.tanggalMulai) ? (
                                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap" title="Tanggal pengerjaan (mulai)">
                                  {card.tanggalMulai || '22/10'}
                                </span>
                              ) : null}

                              {/* Pill Badge: Nama Proyek SAPA / Jenis Non Rutin */}
                              {card.isNonProyek ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#b4b7f7] text-[#312e81] shadow-2xs whitespace-nowrap">
                                  {card.proyekSapaOrJenisName || 'Jenis Non Rutin'}
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#008d91] text-white shadow-2xs whitespace-nowrap">
                                  {card.proyekSapaOrJenisName || 'Proyek SAPA'}
                                </span>
                              )}

                              {/* Pill Badge: Divisi */}
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fde047] text-[#854d0e] shadow-2xs whitespace-nowrap">
                                {card.divisi || 'PNB'}
                              </span>

                              {/* Kendala Badge (jika ada kendala munculkan lingkaran merah dan tanda seru putih, jika tidak ada kendala tidak perlu ada lingkaran merah dan tanda seru putih) */}
                              {card.hasKendala && (
                                <div
                                  title={card.kendalaKeterangan || 'Ada Kendala'}
                                  className="w-4 h-4 rounded-full bg-[#ef4444] text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs select-none"
                                >
                                  !
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Detail / Edit Kartu */}
      {selectedCardForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Detail Kartu Papan Trello</h3>
              <button
                type="button"
                onClick={() => setSelectedCardForEdit(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Task</label>
                <input
                  type="text"
                  value={formTaskName}
                  onChange={(e) => setFormTaskName(e.target.value)}
                  placeholder="Nama Task..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sub-Task</label>
                <input
                  type="text"
                  value={formSubTaskName}
                  onChange={(e) => setFormSubTaskName(e.target.value)}
                  placeholder="Nama Sub-Task..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Deadline</label>
                  <input
                    type="text"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    placeholder="Contoh: 15/10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ID Karyawan (PIC)</label>
                  <input
                    type="text"
                    value={formIdKaryawan}
                    onChange={(e) => setFormIdKaryawan(e.target.value)}
                    placeholder="00015 / 00018 / 00019"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={formIsNonProyek ? 'non_proyek' : 'proyek_sapa'}
                    onChange={(e) => {
                      const isNon = e.target.value === 'non_proyek';
                      setFormIsNonProyek(isNon);
                      if (isNon) setFormProyekSapaOrJenis('Jenis Proyek');
                      else setFormProyekSapaOrJenis('Proyek SAPA');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  >
                    <option value="non_proyek">Non Proyek</option>
                    <option value="proyek_sapa">Proyek SAPA</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Label Badge Proyek/Jenis</label>
                  <input
                    type="text"
                    value={formProyekSapaOrJenis}
                    onChange={(e) => setFormProyekSapaOrJenis(e.target.value)}
                    placeholder="Jenis Proyek / Proyek SAPA..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Divisi</label>
                  <input
                    type="text"
                    value={formDivisi}
                    onChange={(e) => setFormDivisi(e.target.value)}
                    placeholder="PNB / MAD / EVE..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Pengerjaan</label>
                  <select
                    value={formStatusPengerjaan}
                    onChange={(e) => setFormStatusPengerjaan(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  >
                    <option value="belum_mulai">Belum Mulai</option>
                    <option value="ongoing">Sedang Dikerjakan (Ongoing)</option>
                    <option value="selesai">Selesai</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Tanggal Pengerjaan inputs */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block">Tanggal Pengerjaan</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Tanggal Mulai</label>
                    <input
                      type="text"
                      value={formTanggalMulai}
                      onChange={(e) => setFormTanggalMulai(e.target.value)}
                      placeholder="Contoh: 22/10"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#008d91]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Tanggal Selesai</label>
                    <input
                      type="text"
                      value={formTanggalSelesai}
                      onChange={(e) => setFormTanggalSelesai(e.target.value)}
                      placeholder="Contoh: 24/10"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#008d91]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">
                    Riwayat Tanggal (Jika Pending)
                  </label>
                  <input
                    type="text"
                    value={formRiwayatTanggal}
                    onChange={(e) => setFormRiwayatTanggal(e.target.value)}
                    placeholder="Contoh: 22/10-23/10, 25/10-27/10"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              {/* Kendala */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formHasKendala}
                    onChange={(e) => setFormHasKendala(e.target.checked)}
                    className="accent-rose-500 w-4 h-4"
                  />
                  <span>Ada Kendala (Munculkan lingkaran merah dan tanda seru putih)</span>
                </label>

                {formHasKendala && (
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Keterangan Kendala
                    </label>
                    <input
                      type="text"
                      value={formKendalaKeterangan}
                      onChange={(e) => setFormKendalaKeterangan(e.target.value)}
                      placeholder="Tuliskan kendala yang dihadapi..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-400"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDeleteCard(selectedCardForEdit.id)}
                className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold cursor-pointer"
              >
                Hapus
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCardForEdit(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditCard}
                  className="px-5 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl font-semibold cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Kartu Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Tambah Kartu Baru</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Task</label>
                <input
                  type="text"
                  value={formTaskName}
                  onChange={(e) => setFormTaskName(e.target.value)}
                  placeholder="Nama Task..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sub-Task</label>
                <input
                  type="text"
                  value={formSubTaskName}
                  onChange={(e) => setFormSubTaskName(e.target.value)}
                  placeholder="Nama Sub-Task..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Deadline</label>
                  <input
                    type="text"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    placeholder="Contoh: 15/10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ID Karyawan</label>
                  <input
                    type="text"
                    value={formIdKaryawan}
                    onChange={(e) => setFormIdKaryawan(e.target.value)}
                    placeholder="00015 / 00018 / 00019"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kolom Tujuan</label>
                  <select
                    value={createStage}
                    onChange={(e) => setCreateStage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  >
                    <option value="not_started_non_proyek">Not Started Non Proyek</option>
                    <option value="not_started_proyek_sapa">Not Started Proyek SAPA</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="selesai_pending">Selesai / Status Pending</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Divisi</label>
                  <input
                    type="text"
                    value={formDivisi}
                    onChange={(e) => setFormDivisi(e.target.value)}
                    placeholder="PNB / MAD / EVE..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              {/* Tanggal Pengerjaan */}
              {(createStage === 'ongoing' || createStage === 'selesai_pending') && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-700 block">Tanggal Pengerjaan</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-0.5">Tanggal Mulai</label>
                      <input
                        type="text"
                        value={formTanggalMulai}
                        onChange={(e) => setFormTanggalMulai(e.target.value)}
                        placeholder="Contoh: 22/10"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#008d91]"
                      />
                    </div>
                    {createStage === 'selesai_pending' && (
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-0.5">Tanggal Selesai</label>
                        <input
                          type="text"
                          value={formTanggalSelesai}
                          onChange={(e) => setFormTanggalSelesai(e.target.value)}
                          placeholder="Contoh: 24/10"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#008d91]"
                        />
                      </div>
                    )}
                  </div>

                  {createStage === 'selesai_pending' && (
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-0.5">
                        Riwayat Tanggal (Jika Pending)
                      </label>
                      <input
                        type="text"
                        value={formRiwayatTanggal}
                        onChange={(e) => setFormRiwayatTanggal(e.target.value)}
                        placeholder="Contoh: 22/10-23/10, 25/10-27/10"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#008d91]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Kendala */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formHasKendala}
                    onChange={(e) => setFormHasKendala(e.target.checked)}
                    className="accent-rose-500 w-4 h-4"
                  />
                  <span>Ada Kendala (Munculkan lingkaran merah dan tanda seru putih)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewCard}
                className="px-5 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl font-semibold cursor-pointer shadow-xs"
              >
                Tambah Kartu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
