import React, { useState } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  ListTodo,
  Check,
  RotateCcw,
} from 'lucide-react';
import { JenisProyekItem, JenisProyekTemplateTask } from '../types';

interface JenisProyekTableProps {
  items: JenisProyekItem[];
  onAddClick: () => void;
  onEditItem: (item: JenisProyekItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateTemplate?: (jenisProyekId: string, tasks: JenisProyekTemplateTask[]) => void;
}

export const JenisProyekTable: React.FC<JenisProyekTableProps> = ({
  items,
  onAddClick,
  onEditItem,
  onDeleteItem,
  onUpdateTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showKeterangan, setShowKeterangan] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal State for "Template Rekomendasi Isi To-Do List"
  const [selectedItemForTemplate, setSelectedItemForTemplate] = useState<JenisProyekItem | null>(null);
  const [templateTasks, setTemplateTasks] = useState<JenisProyekTemplateTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeskripsi, setNewTaskDeskripsi] = useState('');
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDeskripsi, setEditTaskDeskripsi] = useState('');

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutside = () => {
      setActiveMenuId(null);
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.jenisKegiatan.toLowerCase().includes(q) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q)) ||
      (item.isCoa && '10100-10299 coa aktiva kas bank'.includes(q)) ||
      (item.coaCode && item.coaCode.toLowerCase().includes(q)) ||
      (item.coaName && item.coaName.toLowerCase().includes(q))
    );
  });

  const handleOpenTemplateModal = (item: JenisProyekItem) => {
    setSelectedItemForTemplate(item);
    setTemplateTasks(item.templateTodoList ? JSON.parse(JSON.stringify(item.templateTodoList)) : []);
    setNewTaskTitle('');
    setNewTaskDeskripsi('');
    setEditingTaskIndex(null);
  };

  const handleCloseTemplateModal = () => {
    setSelectedItemForTemplate(null);
    setTemplateTasks([]);
    setNewTaskTitle('');
    setNewTaskDeskripsi('');
    setEditingTaskIndex(null);
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: JenisProyekTemplateTask = {
      id: `task-tpl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      task: newTaskTitle.trim(),
      deskripsi: newTaskDeskripsi.trim() || undefined,
    };
    setTemplateTasks([...templateTasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDeskripsi('');
  };

  const handleRemoveTask = (index: number) => {
    setTemplateTasks(templateTasks.filter((_, idx) => idx !== index));
  };

  const handleStartEditTask = (index: number) => {
    setEditingTaskIndex(index);
    setEditTaskTitle(templateTasks[index].task);
    setEditTaskDeskripsi(templateTasks[index].deskripsi || '');
  };

  const handleSaveEditTask = () => {
    if (editingTaskIndex === null || !editTaskTitle.trim()) return;
    const updated = [...templateTasks];
    updated[editingTaskIndex] = {
      ...updated[editingTaskIndex],
      task: editTaskTitle.trim(),
      deskripsi: editTaskDeskripsi.trim() || undefined,
    };
    setTemplateTasks(updated);
    setEditingTaskIndex(null);
  };

  const handleSaveAllTemplates = () => {
    if (!selectedItemForTemplate) return;
    if (onUpdateTemplate) {
      onUpdateTemplate(selectedItemForTemplate.id, templateTasks);
    }
    handleCloseTemplateModal();
  };

  return (
    <div className="w-full flex flex-col py-2">
      {/* Top Toolbar matching image.png */}
      <div className="w-full flex items-center justify-end gap-3 py-3 px-2 sm:px-4">
        {/* Search Bar */}
        {showSearchInput ? (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm text-sm animate-in fade-in zoom-in-95 duration-150">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              id="input-search-jenis-proyek"
              type="text"
              placeholder="Cari jenis kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="outline-none text-slate-700 placeholder-slate-400 text-xs sm:text-sm w-36 sm:w-56"
            />
            <button
              type="button"
              onClick={() => {
                setShowSearchInput(false);
                setSearchQuery('');
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            id="btn-toggle-col-jenis-proyek"
            type="button"
            onClick={() => setShowKeterangan(!showKeterangan)}
            title="Sembunyikan/Tampilkan Keterangan"
            aria-label="Sembunyikan/Tampilkan Keterangan"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              !showKeterangan ? 'text-[#05828e]' : 'text-[#9ca3af] hover:text-[#4b5563]'
            }`}
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}

        {!showSearchInput && (
          <button
            id="btn-search-jenis-proyek"
            type="button"
            onClick={() => setShowSearchInput(true)}
            title="Cari Jenis Proyek"
            aria-label="Cari Jenis Proyek"
            className="text-[#9ca3af] hover:text-[#4b5563] p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}

        <button
          id="btn-filter-jenis-proyek"
          type="button"
          title="Filter"
          aria-label="Filter"
          className="text-[#9ca3af] hover:text-[#4b5563] p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* + Add Button matching image.png */}
        <button
          id="btn-add-jenis-proyek"
          type="button"
          onClick={onAddClick}
          className="bg-[#05828e] hover:bg-[#046c76] active:bg-[#035b64] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium text-sm sm:text-base flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Table Section matching image.png */}
      <div className="w-full max-w-[960px] mt-2 overflow-x-auto">
        {/* Table Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#cbd5e1] text-[15px] font-bold text-[#555e69] min-w-[700px]">
          <div className="w-[200px] sm:w-[220px] pl-2 shrink-0">Jenis Kegiatan</div>
          <div className="w-[170px] sm:w-[190px] px-3 shrink-0">Ada Template To-Do List?</div>
          <div className="w-[160px] sm:w-[180px] px-3 shrink-0">COA</div>
          {showKeterangan && <div className="flex-1 pl-4 min-w-[120px]">Keterangan</div>}
          <div className="w-8 shrink-0"></div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100 text-sm text-slate-700 min-w-[700px]">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const taskCount = item.templateTodoList ? item.templateTodoList.length : 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3.5 hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Kolom 1: Jenis Kegiatan */}
                  <div className="w-[200px] sm:w-[220px] pl-2 font-normal text-slate-700 shrink-0">
                    {item.jenisKegiatan}
                  </div>

                  {/* Kolom 2: Ada Template To-Do List? */}
                  <div className="w-[170px] sm:w-[190px] px-3 shrink-0">
                    {taskCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleOpenTemplateModal(item)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#e6f4f5] text-[#05828e] hover:bg-[#d4eef0] transition-colors cursor-pointer group/badge"
                        title="Klik untuk melihat / edit template rekomendasi"
                      >
                        <ListTodo className="w-3.5 h-3.5 text-[#05828e]" />
                        <span>{taskCount} Task</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 font-normal text-xs pl-1">-</span>
                    )}
                  </div>

                  {/* Kolom 3: COA (Aktiva COA 10101 - 10299) */}
                  <div className="w-[180px] sm:w-[210px] px-3 shrink-0">
                    {item.isCoa && item.coaCode ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#e6f4f5] text-[#05828e] border border-[#bce2e5] max-w-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#05828e] shrink-0"></span>
                        <span className="font-mono font-bold shrink-0">{item.coaCode}</span>
                        <span
                          className="text-slate-700 font-medium truncate max-w-[120px]"
                          title={`${item.coaCode} - ${item.coaName || item.jenisKegiatan}`}
                        >
                          {item.coaName || item.jenisKegiatan}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-normal text-xs pl-1">-</span>
                    )}
                  </div>

                  {/* Kolom 4: Keterangan */}
                  {showKeterangan && (
                    <div className="flex-1 pl-4 text-slate-600 min-w-[120px]">
                      {item.keterangan || '-'}
                    </div>
                  )}

                  {/* 3 Dots Menu Button */}
                  <div className="w-8 relative flex justify-end pr-1 shrink-0">
                    <button
                      id={`btn-menu-jp-${item.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === item.id ? null : item.id);
                      }}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
                      title="Opsi Menu Jenis Proyek"
                      aria-label="Opsi Menu Jenis Proyek"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Options */}
                    {activeMenuId === item.id && (
                      <div
                        id={`dropdown-jp-${item.id}`}
                        className="absolute right-0 top-7 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Pilihan 1: Template Rekomendasi Isi To-Do List */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            handleOpenTemplateModal(item);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-teal-50/70 text-[#05828e] font-semibold flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <div className="w-6 h-6 rounded-md bg-[#e6f4f5] text-[#05828e] flex items-center justify-center shrink-0">
                            <ListTodo className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="block text-slate-800 font-bold hover:text-[#05828e]">
                              Template Rekomendasi Isi To-Do List
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal block">
                              {taskCount > 0 ? `${taskCount} task terdaftar` : 'Atur daftar task standar'}
                            </span>
                          </div>
                        </button>

                        <div className="my-1 border-t border-slate-100" />

                        {/* Pilihan 2: Edit */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onEditItem(item);
                          }}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit</span>
                        </button>

                        {/* Pilihan 3: Hapus */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onDeleteItem(item.id);
                          }}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              Tidak ada jenis proyek ditemukan
            </div>
          )}
        </div>
      </div>

      {/* Modal: Template Rekomendasi Isi To-Do List */}
      {selectedItemForTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#e6f4f5] text-[#05828e] flex items-center justify-center shrink-0">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    Template Rekomendasi Isi To-Do List
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Jenis Kegiatan:{' '}
                    <span className="font-bold text-[#05828e]">
                      {selectedItemForTemplate.jenisKegiatan}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseTemplateModal}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
              {/* Summary Banner */}
              <div className="bg-[#f0f9fa] border border-[#cbe6e8] rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#05828e]">
                    Total {templateTasks.length} Task Rekomendasi
                  </span>
                  <p className="text-slate-600 mt-0.5">
                    Daftar tugas ini direkomendasikan otomatis saat membuat To-Do List untuk jenis proyek ini.
                  </p>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Task Rekomendasi
                </label>

                {templateTasks.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs">
                    Belum ada rekomendasi task untuk jenis proyek ini. Tambahkan di bawah.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {templateTasks.map((t, idx) => (
                      <div
                        key={t.id || idx}
                        className="bg-white border border-slate-200 rounded-xl p-3 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors shadow-2xs group"
                      >
                        {editingTaskIndex === idx ? (
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editTaskTitle}
                              onChange={(e) => setEditTaskTitle(e.target.value)}
                              placeholder="Nama task..."
                              className="w-full h-8 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#05828e]"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={editTaskDeskripsi}
                              onChange={(e) => setEditTaskDeskripsi(e.target.value)}
                              placeholder="Deskripsi (opsional)..."
                              className="w-full h-7 px-3 text-[11px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#05828e]"
                            />
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={handleSaveEditTask}
                                className="px-2.5 py-1 bg-[#05828e] text-white text-xs rounded-md font-semibold cursor-pointer"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTaskIndex(null)}
                                className="px-2.5 py-1 text-slate-600 text-xs rounded-md hover:bg-slate-100 cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 leading-snug">
                                  {t.task}
                                </p>
                                {t.deskripsi && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                    {t.deskripsi}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleStartEditTask(idx)}
                                title="Edit task"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveTask(idx)}
                                title="Hapus task"
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Tambah Task Baru */}
              <form
                onSubmit={handleAddNewTask}
                className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    + Tambah Task Rekomendasi
                  </span>
                  <span className="text-[10px] text-slate-400">Tekan Enter atau klik Tambah</span>
                </div>

                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Contoh: Pengecekan Ketersediaan Stok Fisik..."
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#05828e] shadow-2xs"
                />

                <input
                  type="text"
                  value={newTaskDeskripsi}
                  onChange={(e) => setNewTaskDeskripsi(e.target.value)}
                  placeholder="Deskripsi atau instruksi pengerjaan (opsional)..."
                  className="w-full h-8 px-3 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 placeholder-slate-400 outline-none focus:border-[#05828e] shadow-2xs"
                />

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="px-3.5 py-1.5 bg-[#05828e] hover:bg-[#046c76] disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Tambahkan ke Template</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseTemplateModal}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-medium text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveAllTemplates}
                className="px-5 py-2 bg-[#05828e] hover:bg-[#046c76] text-white font-medium text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Simpan Perubahan Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

