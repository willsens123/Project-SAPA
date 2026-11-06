import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  RotateCcw,
  UserPlus,
  Users,
  GitFork,
  Phone,
  EyeOff,
  Eye,
  SlidersHorizontal,
  MoreVertical,
  ChevronRight,
  Shield,
  Layers,
  Settings,
  Sparkles,
  ZoomIn,
  ZoomOut,
  CornerDownRight,
} from 'lucide-react';
import { ItemAjarEvent } from '../itemAjarData';
import { IdentitasItem } from '../identitasData';
import {
  PanitiaNode,
  TingkatJabatan,
  DIVISI_PRESETS,
  loadStrukturKepanitiaan,
  saveStrukturKepanitiaan,
  getDefaultKepanitiaanNodes,
} from '../kepanitiaanAjarData';

interface ModalStrukturKepanitiaanAjarProps {
  isOpen: boolean;
  onClose: () => void;
  event: ItemAjarEvent | null;
  identitasList: IdentitasItem[];
  onShowToast?: (msg: string) => void;
}

export const ModalStrukturKepanitiaanAjar: React.FC<ModalStrukturKepanitiaanAjarProps> = ({
  isOpen,
  onClose,
  event,
  identitasList,
  onShowToast = (_msg: string) => {},
}) => {
  // Nodes state for this specific event
  const [nodes, setNodes] = useState<PanitiaNode[]>(() =>
    event ? loadStrukturKepanitiaan(event.id, event.name) : []
  );

  // Re-load when event changes
  useEffect(() => {
    if (event) {
      setNodes(loadStrukturKepanitiaan(event.id, event.name));
    }
  }, [event?.id, event?.name]);

  // Persist nodes
  const updateNodes = (newNodes: PanitiaNode[]) => {
    setNodes(newNodes);
    if (event) {
      saveStrukturKepanitiaan(event.id, newNodes);
    }
  };

  // Edit Mode toggle (when "Edit" button is clicked)
  const [isEditMode, setIsEditMode] = useState(false);

  // Top bar tools states
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDivisi, setSelectedDivisi] = useState<string>('all');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Action Choice Modal: Shown when user clicks the PLUS (+) button on a card in edit mode
  // Choices: 1. "Menambah Identitas ID" | 2. "Mengubah Struktur Diagram"
  const [isActionChoiceOpen, setIsActionChoiceOpen] = useState(false);
  const [selectedTargetNode, setSelectedTargetNode] = useState<PanitiaNode | null>(null);
  const [selectedTargetRoleLabel, setSelectedTargetRoleLabel] = useState<string>('');
  const [targetMemberIndex, setTargetMemberIndex] = useState<number | null>(null);

  // Modal 1: Identitas ID Picker Modal
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Modal 2: Form Mengubah Struktur Diagram
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formPosisi, setFormPosisi] = useState('');
  const [formDivisi, setFormDivisi] = useState('');
  const [formCustomDivisi, setFormCustomDivisi] = useState('');
  const [formTingkat, setFormTingkat] = useState<TingkatJabatan>('divisi');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formTugas, setFormTugas] = useState('');

  // Map of identitas by ID for fast lookup
  const identitasMap = useMemo(() => {
    const map = new Map<string, IdentitasItem>();
    identitasList.forEach((it) => {
      map.set(it.id, it);
    });
    return map;
  }, [identitasList]);

  // Canvas Zoom Level state
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Build lookup maps for hierarchy
  const nodeMap = useMemo(() => {
    return new Map<string, PanitiaNode>(nodes.map((n) => [n.id, n]));
  }, [nodes]);

  // Children mapping: parentId -> children nodes
  const childrenMap = useMemo(() => {
    const map = new Map<string, PanitiaNode[]>();
    nodes.forEach((n) => {
      if (n.parentId && nodeMap.has(n.parentId)) {
        const list = map.get(n.parentId) || [];
        list.push(n);
        map.set(n.parentId, list);
      }
    });

    // Sort children by level: pimpinan -> divisi -> staff
    const levelOrder: Record<TingkatJabatan, number> = {
      pimpinan: 1,
      divisi: 2,
      staff: 3,
    };
    map.forEach((children) => {
      children.sort((a, b) => (levelOrder[a.tingkat] || 99) - (levelOrder[b.tingkat] || 99));
    });

    return map;
  }, [nodes, nodeMap]);

  // Root nodes: nodes without a valid parent or circular parent
  const rootNodes = useMemo(() => {
    const isAncestor = (ancestorId: string, nodeId: string): boolean => {
      let curr = nodeMap.get(nodeId);
      const seen = new Set<string>();
      while (curr && curr.parentId && nodeMap.has(curr.parentId)) {
        if (curr.parentId === ancestorId) return true;
        if (seen.has(curr.id)) break;
        seen.add(curr.id);
        curr = nodeMap.get(curr.parentId);
      }
      return false;
    };

    const roots = nodes.filter((n) => {
      if (!n.parentId) return true;
      if (!nodeMap.has(n.parentId)) return true;
      if (n.parentId === n.id) return true;
      if (isAncestor(n.id, n.parentId)) return true;
      return false;
    });

    return roots.length > 0 ? roots : nodes.slice(0, 1);
  }, [nodes, nodeMap]);

  // Helper to find all descendants of a node to avoid circular parenting loops in form
  const getDescendantIds = (nodeId: string): Set<string> => {
    const descendants = new Set<string>();
    const stack = [nodeId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      const children = childrenMap.get(current) || [];
      for (const child of children) {
        if (!descendants.has(child.id)) {
          descendants.add(child.id);
          stack.push(child.id);
        }
      }
    }
    return descendants;
  };

  const currentDescendantIds = useMemo(() => {
    if (!selectedTargetNode) return new Set<string>();
    return getDescendantIds(selectedTargetNode.id);
  }, [selectedTargetNode, childrenMap]);

  // Filtered identitas for picker
  const filteredIdentitasForPicker = useMemo(() => {
    if (!pickerSearch.trim()) return identitasList;
    const q = pickerSearch.toLowerCase();
    return identitasList.filter((it) => {
      const nama = it.namaLengkap.toLowerCase();
      const panggilan = (it.namaPanggilan || '').toLowerCase();
      const code = (it.codeId || '').toLowerCase();
      const hp = (it.nomorHandPhone || '').toLowerCase();
      return (
        nama.includes(q) ||
        panggilan.includes(q) ||
        code.includes(q) ||
        hp.includes(q)
      );
    });
  }, [identitasList, pickerSearch]);

  // Trigger when PLUS (+) is clicked on any node/role
  const handlePlusClick = (node: PanitiaNode, roleLabel: string, memberIdx?: number) => {
    setSelectedTargetNode(node);
    setSelectedTargetRoleLabel(roleLabel);
    setTargetMemberIndex(memberIdx !== undefined ? memberIdx : null);
    setIsActionChoiceOpen(true);
  };

  // Choice 1: "Menambah Identitas ID"
  const handleChooseAddIdentitas = () => {
    setIsActionChoiceOpen(false);
    setPickerSearch('');
    setIsPickerOpen(true);
  };

  // Choice 2: "Tambah Posisi Subordinat (Bawahan)"
  const handleChooseAddSubordinate = () => {
    setIsActionChoiceOpen(false);
    if (!selectedTargetNode) return;
    const newId = `panitia-node-${Date.now()}`;
    const defaultPersonId = identitasList[0]?.id || 'id-1';

    let subLevel: TingkatJabatan = 'staff';
    if (selectedTargetNode.tingkat === 'pimpinan') {
      subLevel = 'divisi';
    } else {
      subLevel = 'staff';
    }

    const newNode: PanitiaNode = {
      id: newId,
      posisi: 'Posisi Baru',
      divisi: selectedTargetNode.divisi,
      tingkat: subLevel,
      parentId: selectedTargetNode.id,
      identitasId: defaultPersonId,
      identitasIds: [defaultPersonId],
    };

    updateNodes([...nodes, newNode]);
    setSelectedTargetNode(newNode);
    setSelectedTargetRoleLabel(newNode.posisi);
    setFormPosisi('Posisi Baru');
    setFormDivisi(selectedTargetNode.divisi);
    setFormCustomDivisi('');
    setFormTingkat(subLevel);
    setFormParentId(selectedTargetNode.id);
    setFormTugas('');
    setIsFormModalOpen(true);
    onShowToast(`Posisi subordinat ditambahkan di bawah ${selectedTargetNode.posisi}. Silakan sesuaikan.`);
  };

  // Choice 3: "Mengubah Struktur Diagram"
  const handleChooseEditStructure = () => {
    setIsActionChoiceOpen(false);
    if (!selectedTargetNode) return;
    setFormPosisi(selectedTargetNode.posisi);
    setFormDivisi(selectedTargetNode.divisi);
    setFormCustomDivisi('');
    setFormTingkat(selectedTargetNode.tingkat);
    setFormParentId(selectedTargetNode.parentId || '');
    setFormTugas(selectedTargetNode.tugasDanTanggungJawab || '');
    setIsFormModalOpen(true);
  };

  // Assign person to node
  const handleSelectIdentitasForNode = (personId: string) => {
    if (!selectedTargetNode) return;
    const person = identitasMap.get(personId);

    const updated = nodes.map((n) => {
      if (n.id === selectedTargetNode.id) {
        // If targetMemberIndex is specified (e.g. editing a specific staff slot)
        if (targetMemberIndex !== null && n.identitasIds) {
          const newIds = [...n.identitasIds];
          newIds[targetMemberIndex] = personId;
          return {
            ...n,
            identitasId: newIds[0] || personId,
            identitasIds: newIds,
          };
        }

        // If node supports multiple people and already has people, append or replace
        const currentIds = n.identitasIds && n.identitasIds.length > 0 ? n.identitasIds : (n.identitasId ? [n.identitasId] : []);
        const newIds = [...currentIds, personId];

        return {
          ...n,
          identitasId: personId,
          identitasIds: newIds,
        };
      }
      return n;
    });

    updateNodes(updated);
    setIsPickerOpen(false);
    onShowToast(
      `Identitas ID [${person?.codeId || ''} ${person?.namaLengkap || ''}] berhasil ditugaskan ke ${selectedTargetRoleLabel || selectedTargetNode.posisi}!`
    );
  };

  // Remove a person assignment from node
  const handleRemovePersonFromNode = (nodeId: string, memberIdx?: number) => {
    const updated = nodes.map((n) => {
      if (n.id === nodeId) {
        if (memberIdx !== undefined && n.identitasIds && n.identitasIds.length > 1) {
          const newIds = n.identitasIds.filter((_, idx) => idx !== memberIdx);
          return {
            ...n,
            identitasId: newIds[0],
            identitasIds: newIds,
          };
        }
        return {
          ...n,
          identitasId: undefined,
          identitasIds: [],
        };
      }
      return n;
    });
    updateNodes(updated);
    onShowToast('Identitas ID berhasil dilepas dari posisi ini.');
  };

  // Save changes to structure diagram
  const handleSaveStructureForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetNode) return;

    const divisionName =
      formDivisi === '__custom__' && formCustomDivisi.trim()
        ? formCustomDivisi.trim()
        : formDivisi;

    const updated = nodes.map((n) => {
      if (n.id === selectedTargetNode.id) {
        return {
          ...n,
          posisi: formPosisi.trim(),
          divisi: divisionName,
          tingkat: formTingkat,
          parentId: formParentId || null,
          tugasDanTanggungJawab: formTugas.trim() || undefined,
        };
      }
      return n;
    });

    updateNodes(updated);
    setIsFormModalOpen(false);
    onShowToast(`Struktur diagram untuk "${formPosisi}" berhasil diperbarui!`);
  };

  // Delete node from diagram (reparents children to deleted node's parent so they don't get orphaned)
  const handleDeleteNode = (nodeId: string) => {
    if (nodes.length <= 1) {
      onShowToast('Tidak dapat menghapus semua posisi.');
      return;
    }
    const targetNode = nodeMap.get(nodeId);
    const targetParent = targetNode?.parentId || null;
    const updated = nodes
      .filter((n) => n.id !== nodeId)
      .map((n) => {
        if (n.parentId === nodeId) {
          return { ...n, parentId: targetParent };
        }
        return n;
      });
    updateNodes(updated);
    setIsFormModalOpen(false);
    setIsActionChoiceOpen(false);
    onShowToast('Posisi berhasil dihapus dari diagram kepanitiaan.');
  };

  // Add brand new node to diagram
  const handleAddNewPosition = () => {
    const newId = `panitia-node-${Date.now()}`;
    const defaultPersonId = identitasList[0]?.id || 'id-1';
    const defaultParent = rootNodes[0]?.id || null;
    const newNode: PanitiaNode = {
      id: newId,
      posisi: 'Posisi Baru',
      divisi: 'Divisi Acara',
      tingkat: 'divisi',
      parentId: defaultParent,
      identitasId: defaultPersonId,
      identitasIds: [defaultPersonId],
    };
    updateNodes([...nodes, newNode]);
    setSelectedTargetNode(newNode);
    setSelectedTargetRoleLabel(newNode.posisi);
    setFormPosisi('Posisi Baru');
    setFormDivisi('Divisi Acara');
    setFormCustomDivisi('');
    setFormTingkat('divisi');
    setFormParentId(defaultParent || '');
    setFormTugas('');
    setIsFormModalOpen(true);
    onShowToast('Posisi baru ditambahkan ke struktur diagram. Silakan atur detailnya.');
  };

  // Reset to default
  const handleResetDefault = () => {
    const defaults = getDefaultKepanitiaanNodes(event?.name || 'A-AJAR');
    updateNodes(defaults);
    onShowToast('Struktur kepanitiaan dikembalikan ke default.');
  };

  // Render individual person entry in card
  const renderPersonRow = (
    personId?: string,
    onDeletePerson?: () => void,
    roleLabel?: string,
    node?: PanitiaNode,
    idx?: number
  ) => {
    const person = personId ? identitasMap.get(personId) : null;
    const initial = person?.avatarInitial || person?.namaLengkap?.charAt(0) || 'A';
    const codeAndName = person
      ? `${person.codeId ? person.codeId + ' ' : ''}${person.namaLengkap}`
      : '00031 Agustino Ong';
    const nickname = person?.namaPanggilan || 'Ko Agus';

    return (
      <div className="flex items-center justify-between gap-3 group/person">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar Circle */}
          <div className="w-12 h-12 rounded-full bg-[#1eb6a7] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            {initial}
          </div>
          {/* Text Info */}
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate" title={codeAndName}>
              {codeAndName}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-snug truncate">
              {nickname}
            </p>
            {isEyeActive && person && (
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {person.nomorHandPhone || '-'} {person.kota ? `• ${person.kota}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Edit mode quick icons on person */}
        {isEditMode && node && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePlusClick(node, roleLabel || node.posisi, idx)}
              title="Ganti Identitas ID"
              className="p-1.5 text-[#008d91] hover:text-[#007b7e] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {onDeletePerson && (
              <button
                type="button"
                onClick={onDeletePerson}
                title="Hapus Penugasan"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Card Component for each node in the diagram
  const renderCard = (node: PanitiaNode) => {
    // Search matching
    const isMatchedBySearch = (() => {
      if (!searchQuery.trim()) return false;
      const q = searchQuery.toLowerCase();
      if (node.posisi.toLowerCase().includes(q)) return true;
      if (node.divisi.toLowerCase().includes(q)) return true;
      const pIds =
        node.identitasIds && node.identitasIds.length > 0
          ? node.identitasIds
          : node.identitasId
          ? [node.identitasId]
          : [];
      return pIds.some((pId) => {
        const p = identitasMap.get(pId);
        if (!p) return false;
        return (
          p.namaLengkap.toLowerCase().includes(q) ||
          (p.namaPanggilan || '').toLowerCase().includes(q) ||
          (p.codeId || '').toLowerCase().includes(q) ||
          (p.nomorHandPhone || '').toLowerCase().includes(q)
        );
      });
    })();

    const isDivisiFiltered = selectedDivisi !== 'all' && node.divisi !== selectedDivisi;

    const personIds =
      node.identitasIds && node.identitasIds.length > 0
        ? node.identitasIds
        : node.identitasId
        ? [node.identitasId]
        : [];

    const parentNode = node.parentId ? nodeMap.get(node.parentId) : null;

    return (
      <div
        className={`bg-[#f0f6fa] rounded-3xl px-6 py-4.5 w-[300px] sm:w-[330px] shadow-xs relative transition-all group/card border ${
          isMatchedBySearch
            ? 'ring-3 ring-[#008d91] ring-offset-2 bg-teal-50/80 shadow-md border-teal-300'
            : 'border-slate-200/60 hover:shadow-md'
        } ${isDivisiFiltered ? 'opacity-40 grayscale-20' : 'opacity-100'}`}
      >
        {/* Card Header Badge */}
        <div className="flex items-center justify-center relative mb-1">
          <span
            className="bg-[#008d91] text-white px-5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-xs truncate max-w-[210px] text-center"
            title={node.posisi}
          >
            {node.posisi}
          </span>

          {/* Action button in Edit Mode */}
          {isEditMode && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePlusClick(node, node.posisi)}
                title="Kelola Posisi (+ Personil, + Subordinat, Ubah Bagan)"
                className="w-7 h-7 rounded-full bg-[#008d91] hover:bg-[#007477] text-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Sub-header info if Eye is active */}
        {isEyeActive && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1 truncate">
            <span className="truncate">{node.divisi}</span>
            {parentNode && (
              <>
                <span className="text-slate-300">•</span>
                <span
                  className="text-slate-400 truncate max-w-[130px]"
                  title={`Melapor ke: ${parentNode.posisi}`}
                >
                  Atasan: {parentNode.posisi}
                </span>
              </>
            )}
          </div>
        )}

        {/* Subtle Divider */}
        <div className="border-t border-slate-200/80 my-2 w-full"></div>

        {/* Personnel List */}
        <div className="space-y-2.5">
          {personIds.length > 0 ? (
            personIds.map((pId, idx) => (
              <div key={`${pId}-${idx}`}>
                {idx > 0 && <div className="border-t border-slate-200/60 my-2 w-full" />}
                {renderPersonRow(
                  pId,
                  personIds.length > 1
                    ? () => handleRemovePersonFromNode(node.id, idx)
                    : undefined,
                  node.posisi,
                  node,
                  idx
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-2 text-xs text-slate-400 italic">
              Belum ada personil yang ditugaskan
            </div>
          )}
        </div>

        {/* Quick Add Person button in edit mode */}
        {isEditMode && (
          <button
            type="button"
            onClick={() => {
              setSelectedTargetNode(node);
              setSelectedTargetRoleLabel(node.posisi);
              setTargetMemberIndex(null);
              setIsPickerOpen(true);
            }}
            className="w-full mt-2.5 py-1 px-2.5 rounded-xl border border-dashed border-teal-300 hover:border-[#008d91] bg-teal-50/50 hover:bg-teal-50 text-[#008d91] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3 h-3" />
            <span>+ Tambah Personil</span>
          </button>
        )}

        {/* Optional Tugas dan Tanggung Jawab if Eye is active */}
        {isEyeActive && node.tugasDanTanggungJawab && (
          <div
            className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 line-clamp-2 leading-relaxed"
            title={node.tugasDanTanggungJawab}
          >
            {node.tugasDanTanggungJawab}
          </div>
        )}
      </div>
    );
  };

  // Render a node and its entire subtree recursively according to parentId hierarchy
  const renderTreeNode = (node: PanitiaNode, visited: Set<string>): React.ReactNode => {
    if (visited.has(node.id)) return null;
    const nextVisited = new Set(visited);
    nextVisited.add(node.id);

    const children = childrenMap.get(node.id) || [];

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div className="relative z-10">{renderCard(node)}</div>

        {/* Subordinate Children */}
        {children.length > 0 && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical stem down from parent */}
            <div className="w-[2px] h-8 bg-slate-700"></div>

            {/* Children container with horizontal bar & vertical drops */}
            <div className="flex items-start justify-center relative">
              {children.map((child, index) => {
                const isFirst = index === 0;
                const isLast = index === children.length - 1;
                const isOnly = children.length === 1;

                return (
                  <div key={child.id} className="flex flex-col items-center px-4 sm:px-6 relative">
                    {/* Connector lines above this child */}
                    <div className="relative w-full h-8 flex justify-center">
                      {!isOnly && (
                        <>
                          {/* Horizontal line extending left */}
                          {!isFirst && (
                            <div className="absolute top-0 left-0 right-1/2 h-[2px] bg-slate-700"></div>
                          )}
                          {/* Horizontal line extending right */}
                          {!isLast && (
                            <div className="absolute top-0 left-1/2 right-0 h-[2px] bg-slate-700"></div>
                          )}
                        </>
                      )}
                      {/* Vertical line dropping down to this child's card */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-slate-700"></div>
                    </div>

                    {/* Recursively render child's subtree */}
                    {renderTreeNode(child, nextVisited)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl max-h-[94vh] rounded-[32px] shadow-2xl flex flex-col border border-slate-200 overflow-hidden relative">
        {/* Top Control Bar */}
        <div className="px-6 sm:px-10 pt-5 pb-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Struktur Kepanitiaan A-AJAK
            </span>
            {isEditMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-[#008d91] border border-teal-200 animate-pulse">
                <Sparkles className="w-3 h-3" />
                Mode Edit Aktif
              </span>
            )}
          </div>

          {/* Right Toolbar matching image.png */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEyeActive(!isEyeActive)}
              title={isEyeActive ? 'Sembunyikan detail tambahan' : 'Tampilkan detail tambahan'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isEyeActive ? 'text-slate-400 hover:text-slate-600' : 'text-teal-600 bg-teal-50'
              }`}
            >
              {isEyeActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Cari Posisi atau Nama"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSearchOpen ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter Divisi & Pengaturan"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isFilterOpen ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* EDIT BUTTON (Teal pill button matching image.png) */}
            <button
              type="button"
              onClick={() => {
                const nextState = !isEditMode;
                setIsEditMode(nextState);
                if (nextState) {
                  onShowToast(
                    'Mode Edit aktif. Klik tombol (+) pada diagram untuk Menambah Identitas ID atau Mengubah Struktur Diagram.'
                  );
                } else {
                  onShowToast('Mode Edit dinonaktifkan.');
                }
              }}
              className={`px-6 py-2 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                isEditMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                  : 'bg-[#008d91] hover:bg-[#007b7e] text-white'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Selesai</span>
                </>
              ) : (
                <span>Edit</span>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ml-1"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Search and Filter Sub-bars */}
        {isSearchOpen && (
          <div className="px-6 sm:px-10 py-2 bg-slate-50 border-y border-slate-100 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama jabatan, kode identitas, atau nama personil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-hidden text-slate-700"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Hapus
              </button>
            )}
          </div>
        )}

        {isFilterOpen && (
          <div className="px-6 sm:px-10 py-2.5 bg-slate-50 border-y border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Filter Divisi:</span>
              <select
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden focus:border-[#008d91]"
              >
                <option value="all">Semua Bagian ({nodes.length} posisi)</option>
                {DIVISI_PRESETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddNewPosition}
                className="px-3 py-1 bg-[#008d91] hover:bg-[#007b7e] text-white rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Cabang Posisi Baru</span>
              </button>
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset Default</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Header: "Nama Kegiatan" and the Peach "Auto Text" Capsule matching image.png */}
        <div className="px-6 sm:px-10 py-3 flex items-center justify-center gap-6 shrink-0 relative">
          <span className="text-slate-500 font-normal text-base md:text-lg select-none">
            Nama Kegiatan
          </span>

          <div className="relative">
            <div
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="bg-[#fff2e8] text-[#c2410c] px-6 py-2.5 rounded-2xl flex items-center justify-between min-w-[280px] sm:min-w-[340px] border border-orange-100/90 shadow-2xs cursor-pointer hover:bg-[#ffeada] transition-colors"
            >
              <span className="text-slate-700 font-medium text-sm">
                {event?.name || 'Auto Text'}
              </span>
              <MoreVertical className="w-4 h-4 text-orange-500 shrink-0 ml-3" />
            </div>

            {/* Dropdown menu for Nama Kegiatan */}
            {isMoreMenuOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in duration-150 text-xs">
                <div className="px-3 py-2 text-slate-500 font-medium border-b border-slate-100">
                  Detail Kegiatan A-AJAR:
                </div>
                <div className="px-3 py-2 text-slate-700 space-y-1">
                  <p>
                    <strong>ID Kegiatan:</strong> {event?.id}
                  </p>
                  <p>
                    <strong>Tanggal:</strong> {event?.tanggalRange}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className="text-emerald-600 font-semibold">{event?.status}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full mt-1 py-1.5 text-center text-[#008d91] font-semibold hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Banner if Edit Mode is Active */}
        {isEditMode && (
          <div className="mx-6 sm:mx-10 my-1 py-2 px-4 bg-teal-50/90 border border-teal-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-teal-900 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#008d91] animate-ping" />
              <span>
                <strong>Mode Edit Aktif:</strong> Klik tombol plus (<strong>+</strong>) pada struktur
                untuk memilih <strong>Menambah Identitas ID</strong> atau{' '}
                <strong>Mengubah Struktur Diagram</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddNewPosition}
              className="px-3 py-1 bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl font-semibold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              + Posisi Baru
            </button>
          </div>
        )}

        {/* Scrollable Diagram Canvas with Dynamic Tree Hierarchy */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-6 sm:p-10 bg-slate-50/40 flex flex-col items-center relative">
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full flex flex-col items-center relative py-4 min-w-max"
          >
            {/* Roots (Level 1: Ketua Panitia / Pimpinan Tertinggi) */}
            <div className="flex items-start justify-center gap-12 sm:gap-16 relative">
              {rootNodes.map((root) => renderTreeNode(root, new Set()))}
            </div>
          </div>

          {/* Floating Zoom Controls in bottom-right */}
          <div className="sticky bottom-4 self-end mr-4 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-2xl p-1 shadow-lg">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              title="Perkecil Diagram"
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              title="Reset Zoom ke 100%"
              className="px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              title="Perbesar Diagram"
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL ACTION CHOICE: SHOWN WHEN USER CLICKS PLUS (+) */}
      {/* Offers: 1. "Menambah Identitas ID" | 2. "Mengubah Struktur Diagram" */}
      {isActionChoiceOpen && selectedTargetNode && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Kelola Struktur Kepanitiaan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Posisi:{' '}
                  <strong className="text-[#008d91]">
                    {selectedTargetRoleLabel || selectedTargetNode.posisi}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActionChoiceOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* The 3 Action Choices */}
            <div className="p-6 space-y-3">
              {/* CHOICE 1: Menambah Identitas ID */}
              <button
                type="button"
                onClick={handleChooseAddIdentitas}
                className="w-full text-left p-3.5 rounded-2xl border-2 border-teal-100 bg-teal-50/50 hover:bg-teal-50 hover:border-[#008d91] transition-all flex items-start gap-3.5 cursor-pointer group shadow-xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#008d91] transition-colors flex items-center justify-between">
                    <span>Menambah / Mengubah Identitas ID</span>
                    <ChevronRight className="w-4 h-4 text-[#008d91] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Pilih dan tugaskan personil dari database Identitas A-AJAK untuk posisi ini.
                  </p>
                </div>
              </button>

              {/* CHOICE 2: Tambah Posisi Subordinat (Bawahan) */}
              <button
                type="button"
                onClick={handleChooseAddSubordinate}
                className="w-full text-left p-3.5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-500 transition-all flex items-start gap-3.5 cursor-pointer group shadow-xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <CornerDownRight className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                    <span>Tambah Posisi Subordinat (Bawahan)</span>
                    <ChevronRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Buat posisi baru yang berada di bawah (melapor langsung ke) posisi ini pada diagram.
                  </p>
                </div>
              </button>

              {/* CHOICE 3: Mengubah Struktur Diagram */}
              <button
                type="button"
                onClick={handleChooseEditStructure}
                className="w-full text-left p-3.5 rounded-2xl border-2 border-slate-150 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300 transition-all flex items-start gap-3.5 cursor-pointer group shadow-xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <GitFork className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-slate-800 transition-colors flex items-center justify-between">
                    <span>Mengubah Struktur Diagram</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Ubah nama jabatan, divisi, atasan langsung (parent), tingkat jabatan, atau hapus posisi ini.
                  </p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsActionChoiceOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 1: PILIH IDENTITAS ID */}
      {isPickerOpen && selectedTargetNode && (
        <div className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh]">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Pilih Identitas ID
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menugaskan personil untuk posisi:{' '}
                  <strong className="text-[#008d91]">
                    {selectedTargetRoleLabel || selectedTargetNode.posisi}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode ID (00031), nama lengkap, atau panggilan..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                />
              </div>
            </div>

            {/* List Identitas */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredIdentitasForPicker.map((it) => {
                const isSelected = selectedTargetNode.identitasId === it.id;
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => handleSelectIdentitasForNode(it.id)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-teal-50/80 border-[#008d91]'
                        : 'hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#1eb6a7] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {it.avatarInitial || it.namaLengkap.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {it.codeId ? `${it.codeId} ` : ''}
                            {it.namaLengkap}
                          </span>
                          {it.namaPanggilan && (
                            <span className="text-xs text-slate-500 font-normal truncate">
                              ({it.namaPanggilan})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {it.nomorHandPhone || '-'} {it.kota ? `• ${it.kota}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#008d91] bg-teal-100/80 px-2.5 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5" />
                          <span>Terpilih</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#008d91] bg-white border border-teal-200 px-3 py-1 rounded-xl hover:bg-[#008d91] hover:text-white transition-colors">
                          Pilih
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredIdentitasForPicker.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ditemukan identitas dengan kata kunci "{pickerSearch}".
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleRemovePersonFromNode(selectedTargetNode.id);
                  setIsPickerOpen(false);
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Kosongkan Penugasan Posisi Ini
              </button>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: FORM MENGUBAH STRUKTUR DIAGRAM */}
      {isFormModalOpen && selectedTargetNode && (
        <div className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Mengubah Struktur Diagram
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kustomisasi nama posisi, divisi, atasan langsung, dan hirarki
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStructureForm} className="p-6 space-y-4">
              {/* Nama Posisi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Posisi / Jabatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ketua Panitia, Wakil Ketua, Koordinator Acara..."
                  value={formPosisi}
                  onChange={(e) => setFormPosisi(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                />
              </div>

              {/* Tingkat & Divisi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tingkat Hirarki
                  </label>
                  <select
                    value={formTingkat}
                    onChange={(e) => setFormTingkat(e.target.value as TingkatJabatan)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                  >
                    <option value="pimpinan">Level 1 - Pimpinan Inti</option>
                    <option value="divisi">Level 2 - Koordinator / Ketua Divisi</option>
                    <option value="staff">Level 3 - Staff Pelaksana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Divisi
                  </label>
                  <select
                    value={formDivisi}
                    onChange={(e) => setFormDivisi(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                  >
                    {DIVISI_PRESETS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                    <option value="__custom__">+ Divisi Baru...</option>
                  </select>
                </div>
              </div>

              {formDivisi === '__custom__' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Divisi Baru
                  </label>
                  <input
                    type="text"
                    placeholder="Ketik nama divisi baru..."
                    value={formCustomDivisi}
                    onChange={(e) => setFormCustomDivisi(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                  />
                </div>
              )}

              {/* Atasan Langsung (Parent) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Atasan Langsung (Melapor ke)
                </label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                >
                  <option value="">(Paling Atas / Penanggung Jawab Tertinggi)</option>
                  {nodes
                    .filter(
                      (n) =>
                        n.id !== selectedTargetNode.id &&
                        !currentDescendantIds.has(n.id)
                    )
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.posisi} ({n.divisi})
                      </option>
                    ))}
                </select>
              </div>

              {/* Tugas & Tanggung Jawab */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tugas & Tanggung Jawab (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat tanggung jawab posisi ini..."
                  value={formTugas}
                  onChange={(e) => setFormTugas(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteNode(selectedTargetNode.id)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Posisi</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
