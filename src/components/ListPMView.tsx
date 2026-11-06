import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Rocket,
  CreditCard,
  ShoppingCart,
  Send,
  MoreVertical,
  Plus,
  Search,
  Eye,
  EyeOff,
  SlidersHorizontal,
  X,
  Check,
  ExternalLink,
  MessageCircle,
  Copy,
  Edit3,
  Trash2,
  Users,
  User,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Kanban,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  ChevronDown,
  CheckSquare,
  Square,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { ListPMItem, ListPMRecipient, ListPMDetailRow } from '../types';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import {
  calculateProgressPercent,
  getEffectiveStatusBisaPM,
  isTanggalMulaiPMDue,
  getDateBadgeColor,
  PMSearchScope,
  PMSearchResult,
  searchListPMItem,
} from '../listPMData';
import { SalurOrder } from '../salurData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { DonasiOrder } from '../donasiData';
import { DetailListPMView } from './DetailListPMView';
import { PipelineListPMView } from './PipelineListPMView';

interface ListPMViewProps {
  items: ListPMItem[];
  identitasList?: IdentitasItem[];
  salurOrders?: SalurOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  donasiOrders?: DonasiOrder[];
  onSaveItem: (item: ListPMItem) => void;
  onDeleteItem: (id: string) => void;
  onBulkDeleteItems?: (ids: string[]) => void;
  onBulkSaveItems?: (items: ListPMItem[]) => void;
  onOpenDetail?: (item: ListPMItem) => void;
  onShowToast?: (message: string) => void;
  onAddNew?: () => void;
  onNavigateToAutoInputSalur?: () => void;
  onNavigateToFormPMWithProject?: (project: ListPMItem) => void;
  initialViewMode?: 'table' | 'pipeline';
}

export const ListPMView: React.FC<ListPMViewProps> = ({
  items,
  identitasList,
  salurOrders,
  transaksiAjarList,
  donasiOrders,
  onSaveItem,
  onDeleteItem,
  onBulkDeleteItems,
  onBulkSaveItems,
  onOpenDetail,
  onShowToast,
  onAddNew,
  onNavigateToAutoInputSalur,
  onNavigateToFormPMWithProject,
  initialViewMode = 'table',
}) => {
  const allIdentitas = identitasList && identitasList.length > 0 ? identitasList : INITIAL_IDENTITAS;

  // View Mode: Table vs Pipeline
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>(initialViewMode);

  // Sync if prop changes
  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  // Toolbar toggles & Active Tab
  const [activeTab, setActiveTab] = useState<'sudah' | 'belum' | 'sudah_dihubungi'>('sudah');
  const [hideSensitive, setHideSensitive] = useState(false);
  const [searchOpen, setSearchOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<PMSearchScope>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all');

  // Checkbox selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Bulk status dropdown state
  const [bulkStatusMenuOpen, setBulkStatusMenuOpen] = useState(false);
  // Bulk delete confirmation modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Popover menu state per row
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Detail / Manage Chat Modal state
  const [detailModalItem, setDetailModalItem] = useState<ListPMItem | null>(null);
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('');

  // Add / Edit Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formEditingItem, setFormEditingItem] = useState<ListPMItem | null>(null);

  // Add / Edit Form State
  const [formData, setFormData] = useState<{
    proyekSapa: string;
    proyekKode: string;
    iconType: string;
    targetType: 'multiple' | 'single';
    targetCount: number;
    singleIdentitasId: string;
    singleNama: string;
    singleHp: string;
    deadlineType: 'none' | 'date';
    deadlineDate: string;
    statusBisaPM: 'sudah' | 'belum';
    tanggalMulaiPM: string;
    templatePesan: string;
  }>({
    proyekSapa: '',
    proyekKode: 'MAD',
    iconType: 'package',
    targetType: 'multiple',
    targetCount: 10,
    singleIdentitasId: '',
    singleNama: '',
    singleHp: '',
    deadlineType: 'none',
    deadlineDate: '26 Nov 2021',
    statusBisaPM: 'sudah',
    tanggalMulaiPM: '15 Nov 2021',
    templatePesan: '',
  });

  // Helper to render row icon
  const renderRowIcon = (iconType: string) => {
    switch (iconType) {
      case 'rocket':
        return <Rocket className="w-6 h-6 text-white" />;
      case 'creditCard':
        return <CreditCard className="w-6 h-6 text-white" />;
      case 'shoppingCart':
        return <ShoppingCart className="w-6 h-6 text-white" />;
      case 'package':
      default:
        return <Package className="w-6 h-6 text-white" />;
    }
  };

  // Helper for deadline badge
  const renderDeadlineBadge = (deadline: string, color?: string) => {
    if (deadline === '-' || deadline.trim() === '') {
      return (
        <span className="bg-[#008d91] text-white px-7 sm:px-8 py-1.5 rounded-full text-sm font-semibold inline-flex items-center justify-center min-w-[85px] shadow-xs select-none">
          -
        </span>
      );
    }

    const badgeColor = getDateBadgeColor(deadline);
    const bgClass =
      badgeColor === 'red'
        ? 'bg-[#e65243]'
        : badgeColor === 'yellow'
        ? 'bg-[#f5b638]'
        : 'bg-[#008d91]';

    return (
      <span className={`${bgClass} text-white px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center justify-center min-w-[110px] shadow-xs select-none`}>
        {deadline}
      </span>
    );
  };

  // Helper for tanggal mulai PM badge
  const renderTanggalMulaiBadge = (dateStr: string) => {
    if (dateStr === '-' || !dateStr.trim()) {
      return (
        <span className="bg-[#008d91] text-white px-7 sm:px-8 py-1.5 rounded-full text-sm font-semibold inline-flex items-center justify-center min-w-[85px] shadow-xs select-none">
          -
        </span>
      );
    }

    const badgeColor = getDateBadgeColor(dateStr);
    const bgClass =
      badgeColor === 'red'
        ? 'bg-[#e65243]'
        : badgeColor === 'yellow'
        ? 'bg-[#f5b638]'
        : 'bg-[#008d91]';

    return (
      <span className={`${bgClass} text-white px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center justify-center min-w-[110px] shadow-xs select-none`}>
        {dateStr}
      </span>
    );
  };

  // Auto-sync items whose "Tanggal mulai PM" is due / smaller than or equal to today
  useEffect(() => {
    let hasChanges = false;
    const updated = items.map((item) => {
      if (item.statusBisaPM === 'sudah_dihubungi') return item;
      const eff = getEffectiveStatusBisaPM(item);
      if (item.statusBisaPM !== eff) {
        hasChanges = true;
        return { ...item, statusBisaPM: eff };
      }
      return item;
    });
    if (hasChanges) {
      updated.forEach((it, idx) => {
        if (it !== items[idx]) {
          onSaveItem(it);
        }
      });
    }
  }, [items, onSaveItem]);

  // Filtered items & match metadata map
  const { filteredItems, searchMatchMap } = useMemo(() => {
    const matchMap = new Map<string, PMSearchResult>();

    const list = items.filter((item) => {
      // Tab filter: 'sudah' vs 'belum' vs 'sudah_dihubungi'
      // Rule: "Pindahkan semua yang sudah Progress 100% ke 'Sudah dihubungi'"
      const isCompleted = item.progressPercent >= 100 || item.statusBisaPM === 'sudah_dihubungi';

      if (activeTab === 'sudah_dihubungi') {
        if (!isCompleted) return false;
      } else {
        // Tab "Sudah bisa di-PM" dan "Belum bisa di-PM" tidak menampilkan yang sudah Progress 100%
        if (isCompleted) return false;

        // Jika "Tanggal mulai PM" pada "List PM" sudah lebih kecil dari tanggal hari ini, berpindah ke tab "Sudah bisa di-PM"
        const itemStatus = getEffectiveStatusBisaPM(item);
        if (activeTab === 'sudah' && itemStatus === 'belum') return false;
        if (activeTab === 'belum' && itemStatus !== 'belum') return false;
      }

      // Search filter using searchListPMItem (matching project name OR target name)
      if (searchQuery.trim()) {
        const result = searchListPMItem(item, searchQuery, searchScope, identitasList);
        if (!result.matches) return false;
        matchMap.set(item.id, result);
      }

      // Status filter
      if (statusFilter === 'completed' && item.progressPercent < 100) return false;
      if (statusFilter === 'in_progress' && (item.progressPercent <= 0 || item.progressPercent >= 100)) return false;
      if (statusFilter === 'not_started' && item.progressPercent > 0) return false;

      // Jeda / Berkala filter rule: "Jika belum waktunya / sebelum durasi, data tidak akan muncul di 'List PM'."
      if (item.isWaitingJeda && item.availableDate) {
        const availableTime = new Date(item.availableDate).getTime();
        const now = Date.now();
        if (now < availableTime) {
          return false; // Belum waktunya / belum sampai durasi, data tidak muncul di List PM
        }
      }

      // Tanggal Berakhir filter rule: jika sudah melewati batas tanggal berakhir, tidak muncul
      if (item.tanggalBerakhir) {
        const endTime = new Date(item.tanggalBerakhir).getTime();
        if (!isNaN(endTime) && Date.now() > endTime + 86400000) {
          return false;
        }
      }

      return true;
    });

    return { filteredItems: list, searchMatchMap: matchMap };
  }, [items, searchQuery, searchScope, statusFilter, activeTab, identitasList]);

  // Total matching items across all tabs (for helpful user feedback)
  const totalSearchMatchesAllTabs = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    return items.filter((it) => searchListPMItem(it, searchQuery, searchScope, identitasList).matches).length;
  }, [items, searchQuery, searchScope, identitasList]);

  // Selection helpers for table checkboxes
  const isAllSelected =
    filteredItems.length > 0 && filteredItems.every((it) => selectedIds.includes(it.id));
  const isSomeSelected =
    selectedIds.length > 0 && !isAllSelected && filteredItems.some((it) => selectedIds.includes(it.id));

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all items currently in filteredItems
      const filteredIdSet = new Set(filteredItems.map((it) => it.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      // Select all items currently in filteredItems
      setSelectedIds((prev) => {
        const set = new Set(prev);
        filteredItems.forEach((it) => set.add(it.id));
        return Array.from(set);
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk status update handler
  const handleBulkChangeStatus = (newStatus: 'sudah' | 'belum' | 'sudah_dihubungi') => {
    setBulkStatusMenuOpen(false);
    const selectedSet = new Set(selectedIds);
    const toUpdate: ListPMItem[] = [];

    items.forEach((item) => {
      if (selectedSet.has(item.id)) {
        if (newStatus === 'sudah_dihubungi') {
          const updatedRecs = item.recipients?.map((r) => ({
            ...r,
            isSent: true,
            sentAt: r.sentAt || new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
          }));
          toUpdate.push({
            ...item,
            statusBisaPM: 'sudah_dihubungi',
            progressPercent: 100,
            recipients: updatedRecs,
          });
        } else if (newStatus === 'sudah') {
          const resetRecs =
            item.progressPercent >= 100
              ? item.recipients?.map((r) => ({ ...r, isSent: false, sentAt: undefined }))
              : item.recipients;
          toUpdate.push({
            ...item,
            statusBisaPM: 'sudah',
            progressPercent: item.progressPercent >= 100 ? 0 : item.progressPercent,
            recipients: resetRecs,
          });
        } else {
          // 'belum'
          toUpdate.push({
            ...item,
            statusBisaPM: 'belum',
            tanggalMulaiPM: item.tanggalMulaiPM || item.tanggalMulaiDihubungi || '15 Nov 2021',
          });
        }
      }
    });

    if (onBulkSaveItems) {
      onBulkSaveItems(toUpdate);
    } else {
      toUpdate.forEach((it) => onSaveItem(it));
    }

    const labelMap = {
      sudah: '"Sudah bisa di-PM"',
      belum: '"Belum bisa di-PM"',
      sudah_dihubungi: '"Sudah dihubungi"',
    };
    if (onShowToast) {
      onShowToast(`${toUpdate.length} proyek berhasil diubah ke ${labelMap[newStatus]}`);
    }
    setSelectedIds([]);
  };

  // Bulk progress update handler
  const handleBulkSetProgress = (percent: 100 | 0) => {
    setBulkStatusMenuOpen(false);
    const selectedSet = new Set(selectedIds);
    const toUpdate: ListPMItem[] = [];

    items.forEach((item) => {
      if (selectedSet.has(item.id)) {
        const isSent = percent === 100;
        const updatedRecs = item.recipients?.map((r) => ({
          ...r,
          isSent,
          sentAt: isSent ? (r.sentAt || new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })) : undefined,
        }));
        toUpdate.push({
          ...item,
          progressPercent: percent,
          statusBisaPM: percent === 100 ? 'sudah_dihubungi' : (item.statusBisaPM === 'sudah_dihubungi' ? 'sudah' : item.statusBisaPM),
          recipients: updatedRecs,
        });
      }
    });

    if (onBulkSaveItems) {
      onBulkSaveItems(toUpdate);
    } else {
      toUpdate.forEach((it) => onSaveItem(it));
    }

    if (onShowToast) {
      onShowToast(
        percent === 100
          ? `${toUpdate.length} proyek ditandai selesai (100%)`
          : `${toUpdate.length} proyek di-reset ke 0%`
      );
    }
    setSelectedIds([]);
  };

  // Bulk delete confirmation execution
  const handleConfirmBulkDelete = () => {
    const count = selectedIds.length;
    if (onBulkDeleteItems) {
      onBulkDeleteItems(selectedIds);
    } else {
      selectedIds.forEach((id) => onDeleteItem(id));
      if (onShowToast) {
        onShowToast(`${count} proyek List PM berhasil dihapus`);
      }
    }
    setSelectedIds([]);
    setBulkDeleteModalOpen(false);
  };

  // Open Form Modal for Create or Edit
  const openFormModal = (item?: ListPMItem) => {
    if (item) {
      setFormEditingItem(item);
      setFormData({
        proyekSapa: item.proyekSapa,
        proyekKode: item.proyekKode,
        iconType: item.iconType,
        targetType: item.targetType,
        targetCount: item.targetCount || 10,
        singleIdentitasId: item.singleTarget?.identitasId || '',
        singleNama: item.singleTarget?.nama || '',
        singleHp: item.singleTarget?.nomorHp || '',
        deadlineType: item.deadline === '-' ? 'none' : 'date',
        deadlineDate: item.deadline === '-' ? '26 Nov 2021' : item.deadline,
        statusBisaPM: item.statusBisaPM === 'belum' ? 'belum' : 'sudah',
        tanggalMulaiPM: item.tanggalMulaiPM || item.tanggalMulaiDihubungi || '15 Nov 2021',
        templatePesan: item.templatePesan || '',
      });
    } else {
      setFormEditingItem(null);
      setFormData({
        proyekSapa: '',
        proyekKode: 'MAD',
        iconType: 'package',
        targetType: 'multiple',
        targetCount: 10,
        singleIdentitasId: '',
        singleNama: '',
        singleHp: '',
        deadlineType: 'none',
        deadlineDate: '26 Nov 2021',
        statusBisaPM: activeTab === 'belum' ? 'belum' : 'sudah',
        tanggalMulaiPM: '15 Nov 2021',
        templatePesan:
          'Namo Buddhaya {Nama},\n\nTerima kasih atas partisipasinya dalam Proyek SAPA ({ProyekKode}). Semoga kebajikan ini membawa kebahagiaan bagi Anda dan keluarga. 🙏',
      });
    }
    setActiveMenuId(null);
    setFormModalOpen(true);
  };

  // Submit Form Modal
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proyekSapa.trim()) {
      if (onShowToast) onShowToast('Nama Proyek SAPA wajib diisi');
      return;
    }

    const deadlineVal = formData.deadlineType === 'none' ? '-' : formData.deadlineDate;
    let deadlineColor: 'teal' | 'red' | 'amber' = 'teal';
    if (deadlineVal !== '-') {
      const col = getDateBadgeColor(deadlineVal);
      deadlineColor = col === 'red' ? 'red' : col === 'yellow' ? 'amber' : 'teal';
    }

    if (formEditingItem) {
      // Update existing item
      const updated: ListPMItem = {
        ...formEditingItem,
        proyekSapa: formData.proyekSapa,
        proyekKode: formData.proyekKode,
        iconType: formData.iconType,
        targetType: formData.targetType,
        targetCount: formData.targetType === 'multiple' ? formData.targetCount : undefined,
        deadline: deadlineVal,
        deadlineColor,
        statusBisaPM: formData.statusBisaPM,
        tanggalMulaiPM: formData.tanggalMulaiPM,
        templatePesan: formData.templatePesan,
      };

      if (formData.targetType === 'single') {
        const found = allIdentitas.find((id) => id.id === formData.singleIdentitasId);
        updated.singleTarget = {
          identitasId: formData.singleIdentitasId,
          codeId: found?.codeId || '00031',
          nama: formData.singleNama || found?.namaLengkap || 'Agustino Ong',
          nomorHp: formData.singleHp || found?.nomorHandPhone || '081234567898',
          avatarInitial: (formData.singleNama || found?.namaLengkap || 'A')[0].toUpperCase(),
          avatarBg: found?.avatarBg || 'bg-[#14b8a6]',
        };
        // Update recipient list
        if (!updated.recipients || updated.recipients.length === 0) {
          updated.recipients = [
            {
              id: `rec-${updated.id}-single`,
              identitasId: formData.singleIdentitasId,
              codeId: updated.singleTarget.codeId,
              nama: updated.singleTarget.nama,
              nomorHp: updated.singleTarget.nomorHp,
              isSent: false,
            },
          ];
        }
      }

      onSaveItem(updated);
      if (onShowToast) onShowToast(`List PM "${updated.proyekSapa}" berhasil diperbarui`);
    } else {
      // Create new item
      const newId = `pm-${Date.now()}`;
      let recipients: ListPMRecipient[] = [];

      let singleTargetData = undefined;
      if (formData.targetType === 'single') {
        const found = allIdentitas.find((id) => id.id === formData.singleIdentitasId);
        singleTargetData = {
          identitasId: formData.singleIdentitasId,
          codeId: found?.codeId || '00031',
          nama: formData.singleNama || found?.namaLengkap || 'Agustino Ong',
          nomorHp: formData.singleHp || found?.nomorHandPhone || '081234567898',
          avatarInitial: (formData.singleNama || found?.namaLengkap || 'A')[0].toUpperCase(),
          avatarBg: found?.avatarBg || 'bg-[#14b8a6]',
        };
        recipients = [
          {
            id: `rec-${newId}-1`,
            identitasId: formData.singleIdentitasId,
            codeId: singleTargetData.codeId,
            nama: singleTargetData.nama,
            nomorHp: singleTargetData.nomorHp,
            isSent: false,
          },
        ];
      } else {
        // Generate recipients based on target count
        recipients = Array.from({ length: formData.targetCount }, (_, i) => {
          const identitasMatch = allIdentitas[i % allIdentitas.length];
          return {
            id: `rec-${newId}-${i + 1}`,
            identitasId: identitasMatch?.id,
            codeId: identitasMatch?.codeId || `000${(20 + i).toString().padStart(2, '0')}`,
            nama: identitasMatch?.namaLengkap || `Penerima SAPA #${i + 1}`,
            nomorHp: identitasMatch?.nomorHandPhone || `0812${(10000000 + i * 11111).toString().slice(0, 8)}`,
            isSent: false,
          };
        });
      }

      const newItem: ListPMItem = {
        id: newId,
        proyekSapa: formData.proyekSapa,
        proyekKode: formData.proyekKode,
        iconType: formData.iconType,
        targetType: formData.targetType,
        targetCount: formData.targetType === 'multiple' ? formData.targetCount : undefined,
        targetAvatars:
          formData.targetType === 'multiple'
            ? [
                { initial: 'H', bg: 'bg-[#d94819]' },
                { initial: 'T', bg: 'bg-[#d9659b]' },
                { initial: '+', bg: 'bg-[#2295d8]' },
              ]
            : undefined,
        singleTarget: singleTargetData,
        deadline: deadlineVal,
        deadlineColor,
        statusBisaPM: formData.statusBisaPM,
        tanggalMulaiPM: formData.tanggalMulaiPM || '15 Nov 2021',
        templatePesan: formData.templatePesan,
        progressPercent: 0,
        recipients,
        createdAt: new Date().toISOString().split('T')[0],
      };

      onSaveItem(newItem);
      if (onShowToast) onShowToast(`List PM "${newItem.proyekSapa}" berhasil ditambahkan`);
    }

    setFormModalOpen(false);
  };

  // Toggle recipient sent status in Detail modal
  const handleToggleRecipientSent = (item: ListPMItem, recipientId: string) => {
    if (!item.recipients) return;
    const updatedRecipients = item.recipients.map((rec) => {
      if (rec.id === recipientId) {
        const nextSent = !rec.isSent;
        return {
          ...rec,
          isSent: nextSent,
          sentAt: nextSent ? new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : undefined,
        };
      }
      return rec;
    });

    const newProgress = calculateProgressPercent(updatedRecipients);
    const updatedItem: ListPMItem = {
      ...item,
      recipients: updatedRecipients,
      progressPercent: newProgress,
    };

    onSaveItem(updatedItem);
    setDetailModalItem(updatedItem);
  };

  // Mark all sent or unsent
  const handleMarkAllRecipients = (item: ListPMItem, status: boolean) => {
    if (!item.recipients) return;
    const updatedRecipients = item.recipients.map((rec) => ({
      ...rec,
      isSent: status,
      sentAt: status ? new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : undefined,
    }));
    const newProgress = status ? 100 : 0;
    const updatedItem: ListPMItem = {
      ...item,
      recipients: updatedRecipients,
      progressPercent: newProgress,
    };

    onSaveItem(updatedItem);
    setDetailModalItem(updatedItem);
    if (onShowToast) {
      onShowToast(status ? 'Semua chat ditandai sudah terkirim (100%)' : 'Semua chat ditandai belum terkirim (0%)');
    }
  };

  // Generate personalized message for WhatsApp
  const generateMessageText = (template: string, rec: ListPMRecipient, item: ListPMItem) => {
    return template
      .replace(/{Nama}/g, rec.nama)
      .replace(/{CodeID}/g, rec.codeId || '')
      .replace(/{NomorHP}/g, rec.nomorHp)
      .replace(/{ProyekKode}/g, item.proyekKode)
      .replace(/{ProyekSapa}/g, item.proyekSapa);
  };

  // Send WhatsApp Action
  const handleSendWhatsApp = (rec: ListPMRecipient, item: ListPMItem) => {
    const rawNumber = rec.nomorHp.replace(/\D/g, '');
    const cleanNumber = rawNumber.startsWith('0') ? `62${rawNumber.slice(1)}` : rawNumber;
    const message = generateMessageText(item.templatePesan, rec, item);
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');

    // Automatically mark as sent
    if (!rec.isSent) {
      handleToggleRecipientSent(item, rec.id);
    }
  };

  if (viewMode === 'pipeline') {
    return (
      <PipelineListPMView
        items={items}
        identitasList={identitasList}
        salurOrders={salurOrders}
        transaksiAjarList={transaksiAjarList}
        donasiOrders={donasiOrders}
        onSaveItem={onSaveItem}
        onDeleteItem={onDeleteItem}
        onShowToast={onShowToast}
        onAddNew={onAddNew}
        onNavigateToTableView={() => setViewMode('table')}
        onNavigateToAutoInputSalur={onNavigateToAutoInputSalur}
        onNavigateToFormPMWithProject={onNavigateToFormPMWithProject}
      />
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[580px] flex flex-col justify-between transition-all">
      <div>
        {/* Top Header section matching image.png */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Tabs: "Sudah bisa di-PM", "Belum bisa di-PM", "Sudah dihubungi" & "Pipeline & Bulan" */}
          <div className="flex items-center flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('sudah')}
              className={`px-5 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                activeTab === 'sudah'
                  ? 'bg-[#00897b] text-white hover:bg-[#00796b]'
                  : 'bg-[#a0a8ad] text-white hover:bg-[#929a9f]'
              }`}
            >
              Sudah bisa di-PM
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('belum')}
              className={`px-5 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                activeTab === 'belum'
                  ? 'bg-[#00897b] text-white hover:bg-[#00796b]'
                  : 'bg-[#a0a8ad] text-white hover:bg-[#929a9f]'
              }`}
            >
              Belum bisa di-PM
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sudah_dihubungi')}
              className={`px-5 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                activeTab === 'sudah_dihubungi'
                  ? 'bg-[#00897b] text-white hover:bg-[#00796b]'
                  : 'bg-[#a0a8ad] text-white hover:bg-[#929a9f]'
              }`}
            >
              Sudah dihubungi
            </button>

            {/* Pipeline & Bulan Button */}
            <button
              type="button"
              onClick={() => setViewMode('pipeline')}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              title="Buka tampilan Pipeline alur PM & jadwal bulanan"
            >
              <Kanban className="w-4 h-4 text-indigo-600" />
              <span>Pipeline & Bulan</span>
            </button>

            {onNavigateToAutoInputSalur && (
              <button
                type="button"
                onClick={onNavigateToAutoInputSalur}
                className="ml-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-teal-200/80 bg-teal-50/70 hover:bg-teal-100/80 text-[#00897b] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                title="Buka Pengaturan Auto Input List PM Khusus S-SALUR"
              >
                <Sparkles className="w-4 h-4 text-[#00897b]" />
                <span>Auto Input S-SALUR</span>
              </button>
            )}
          </div>

          {/* Action icons & Add button on the right */}
          <div className="flex items-center justify-end gap-3">
            {/* Eye Privacy Toggle */}
            <button
              type="button"
              onClick={() => setHideSensitive(!hideSensitive)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              title={hideSensitive ? 'Tampilkan Nomor HP' : 'Sembunyikan Nomor HP'}
            >
              {hideSensitive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>

            {/* Search Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                searchOpen || searchQuery
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Cari Proyek atau Target"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Filter Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  statusFilter !== 'all'
                    ? 'text-[#008d91] bg-teal-50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Filter Status Progress"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    Filter Progress
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'all' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Semua Progress</span>
                    {statusFilter === 'all' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('in_progress');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'in_progress' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Sedang Dikirim (1-99%)</span>
                    {statusFilter === 'in_progress' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('completed');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'completed' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Selesai (100%)</span>
                    {statusFilter === 'completed' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('not_started');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'not_started' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Belum Mulai (0%)</span>
                    {statusFilter === 'not_started' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* + Add Button */}
            <button
              type="button"
              onClick={() => {
                if (onAddNew) onAddNew();
                else openFormModal();
              }}
              className="bg-[#008d91] hover:bg-[#05828e] text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Collapsible Search Bar with Scope Selection */}
        {searchOpen && (
          <div className="mb-6 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col gap-3 shadow-2xs animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={
                  searchScope === 'project'
                    ? 'Cari nama proyek (MAD, Paket Dharma, Kirim Resi, dll)...'
                    : searchScope === 'target'
                    ? 'Cari nama penerima/target (Agustino Ong, Cindy, Hendra, Silvia, 00031, dll)...'
                    : 'Cari berdasarkan nama proyek atau nama target penerima...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition-colors"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Scope Selector Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider">
                  Filter:
                </span>
                <button
                  type="button"
                  onClick={() => setSearchScope('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    searchScope === 'all'
                      ? 'bg-[#00897b] text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Semua (Proyek & Target)
                </button>
                <button
                  type="button"
                  onClick={() => setSearchScope('project')}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    searchScope === 'project'
                      ? 'bg-[#00897b] text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Nama Proyek
                </button>
                <button
                  type="button"
                  onClick={() => setSearchScope('target')}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    searchScope === 'target'
                      ? 'bg-[#00897b] text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Nama Target
                </button>
              </div>

              {searchQuery.trim() && (
                <div className="flex items-center gap-2 text-slate-500">
                  <span>
                    Ditemukan <strong className="text-slate-800">{filteredItems.length}</strong> dari {items.length} proyek
                    {totalSearchMatchesAllTabs > filteredItems.length && (
                      <span className="text-teal-700 font-semibold ml-1">
                        ({totalSearchMatchesAllTabs} di semua tab)
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchScope('all');
                    }}
                    className="text-[#00897b] hover:underline font-semibold cursor-pointer ml-1"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bulk Action Bar when items are selected */}
        {selectedIds.length > 0 && (
          <div className="mb-4 px-4 py-3 bg-gradient-to-r from-teal-50 via-teal-50/70 to-slate-50 border border-teal-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00897b] text-white text-xs font-bold shadow-xs">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{selectedIds.length} Proyek Dipilih</span>
              </span>

              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-xs font-semibold text-teal-800 hover:text-teal-950 hover:underline cursor-pointer px-2 py-1"
              >
                {filteredItems.every((it) => selectedIds.includes(it.id))
                  ? 'Batal pilih semua'
                  : `Pilih semua (${filteredItems.length})`}
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer px-2 py-1"
              >
                Reset Pilihan
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-2 relative">
              {/* Ubah Status Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBulkStatusMenuOpen(!bulkStatusMenuOpen)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-teal-600" />
                  <span>Ubah Status</span>
                  <ChevronDown className="w-3.5 h-3.5 text-teal-500" />
                </button>

                {bulkStatusMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                      Ubah Status ({selectedIds.length} Proyek)
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBulkChangeStatus('sudah')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                      <span>Pindahkan ke "Sudah bisa di-PM"</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkChangeStatus('belum')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>Pindahkan ke "Belum bisa di-PM"</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkChangeStatus('sudah_dihubungi')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <span>Pindahkan ke "Sudah dihubungi"</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      type="button"
                      onClick={() => handleBulkSetProgress(100)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Tandai Semua Selesai (100%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSetProgress(0)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <span>Reset Progress ke 0%</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Hapus Terpilih Button */}
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/80">
                <th className="py-4 px-3 w-[46px] text-center">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={filteredItems.length > 0 && selectedIds.length > 0 && filteredItems.every((it) => selectedIds.includes(it.id))}
                      ref={(input) => {
                        if (input) {
                          const someSelected =
                            selectedIds.length > 0 &&
                            !filteredItems.every((it) => selectedIds.includes(it.id)) &&
                            filteredItems.some((it) => selectedIds.includes(it.id));
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-[#00897b] border-slate-300 focus:ring-teal-500 cursor-pointer accent-[#00897b]"
                      title={isAllSelected ? 'Batal pilih semua' : 'Pilih semua'}
                    />
                  </div>
                </th>
                <th className="py-4 px-4 text-slate-700 font-bold text-sm sm:text-base w-[26%]">
                  Proyek SAPA
                </th>
                <th className="py-4 px-4 text-slate-700 font-bold text-sm sm:text-base w-[30%] text-center">
                  Identitas ID
                </th>
                <th className="py-4 px-4 text-slate-700 font-bold text-sm sm:text-base w-[18%] text-center">
                  Deadline
                </th>
                <th className="py-4 px-4 text-slate-700 font-bold text-sm sm:text-base w-[15%] text-left sm:text-center">
                  {activeTab === 'belum' ? 'Tanggal mulai PM' : 'Progress'}
                </th>
                <th className="py-4 px-2 w-[5%] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada list PM yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors group cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/70 hover:bg-teal-50'
                          : 'hover:bg-slate-50/60'
                      }`}
                      onClick={() => {
                        if (onOpenDetail) {
                          onOpenDetail(item);
                        } else {
                          setDetailModalItem(item);
                        }
                      }}
                    >
                      {/* Checkbox Column */}
                      <td
                        className="py-4 sm:py-5 px-3 align-middle text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(item.id)}
                            className="w-4 h-4 rounded text-[#00897b] border-slate-300 focus:ring-teal-500 cursor-pointer accent-[#00897b]"
                          />
                        </div>
                      </td>

                      {/* Proyek SAPA Column */}
                      <td className="py-4 sm:py-5 px-4 align-middle">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-xs">
                          {renderRowIcon(item.iconType)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-[15px] sm:text-base leading-snug">
                            {item.proyekSapa}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium text-slate-500 text-xs sm:text-sm tracking-wide">
                              {item.proyekKode}
                            </span>
                            {item.itemTitle && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                • {item.itemTitle}
                              </span>
                            )}
                          </div>
                          {searchQuery.trim() && searchMatchMap.get(item.id)?.matchType === 'project' && (
                            <div className="mt-1">
                              <span className="inline-block text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                Proyek Cocok
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Target Column */}
                    <td className="py-4 sm:py-5 px-4 align-middle">
                      {item.targetType === 'single' && item.singleTarget ? (
                        <div className="flex items-center gap-3 justify-center">
                          <div
                            className={`w-12 h-12 rounded-full ${
                              item.singleTarget.avatarBg || 'bg-[#00a299]'
                            } text-white font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-xs`}
                          >
                            {item.singleTarget.avatarInitial || 'A'}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-slate-900 text-sm sm:text-[15px] leading-snug">
                              {item.singleTarget.codeId ? `${item.singleTarget.codeId} ` : ''}
                              {item.singleTarget.nama}
                            </div>
                            <div className="text-slate-500 text-xs sm:text-sm font-normal">
                              {hideSensitive
                                ? '0812••••••••'
                                : item.singleTarget.nomorHp}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center -space-x-2">
                            {item.targetAvatars && item.targetAvatars.length > 0 ? (
                              item.targetAvatars.map((av, idx) => (
                                <div
                                  key={idx}
                                  className={`w-8 h-8 rounded-full ${av.bg} text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs`}
                                >
                                  {av.initial}
                                </div>
                              ))
                            ) : (
                              <>
                                <div className="w-8 h-8 rounded-full bg-[#d94819] text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs">
                                  H
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#d9659b] text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs">
                                  T
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#2295d8] text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs">
                                  +
                                </div>
                              </>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 text-sm sm:text-[15px]">
                            {item.targetCount || 10} Orang
                          </span>
                        </div>
                      )}
                      {searchQuery.trim() && searchMatchMap.get(item.id)?.matchType === 'target' && searchMatchMap.get(item.id)?.matchedTargetName && (
                        <div className="mt-1.5 flex items-center justify-center">
                          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50/90 px-2.5 py-0.5 rounded-full border border-teal-200 shadow-2xs">
                            🎯 Target cocok: <strong className="underline ml-0.5">{searchMatchMap.get(item.id)?.matchedTargetName}</strong>
                            {searchMatchMap.get(item.id)?.matchedTargetCode ? ` (${searchMatchMap.get(item.id)?.matchedTargetCode})` : ''}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Deadline Column */}
                    <td className="py-4 sm:py-5 px-4 align-middle text-center">
                      {renderDeadlineBadge(item.deadline, item.deadlineColor)}
                    </td>

                    {/* Progress OR Tanggal mulai PM Column */}
                    {activeTab === 'belum' ? (
                      <td className="py-4 sm:py-5 px-4 align-middle text-left sm:text-center">
                        {renderTanggalMulaiBadge(item.tanggalMulaiPM || item.tanggalMulaiDihubungi || '15 Nov 2021')}
                      </td>
                    ) : (
                      <td className="py-4 sm:py-5 px-4 align-middle">
                        <div className="w-full">
                          <div
                            className={`font-bold text-sm sm:text-base leading-none mb-1.5 ${
                              item.progressPercent === 0
                                ? 'text-slate-400'
                                : 'text-[#008d91]'
                            }`}
                          >
                            {item.progressPercent}%
                          </div>
                          <div className="w-20 sm:w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                item.progressPercent === 0
                                  ? 'bg-transparent'
                                  : 'bg-[#008d91]'
                              }`}
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Action Menu Column */}
                    <td
                      className="py-4 sm:py-5 px-2 align-middle text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div className="absolute right-2 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onOpenDetail) {
                                onOpenDetail(item);
                              } else {
                                setDetailModalItem(item);
                              }
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 text-[#008d91]" />
                            <span>Kirim Chat / Kelola PM</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openFormModal(item)}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4 text-slate-500" />
                            <span>Edit List PM</span>
                          </button>
                          {item.progressPercent >= 100 || item.statusBisaPM === 'sudah_dihubungi' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const resetRecipients = item.recipients?.map((r) => ({
                                  ...r,
                                  isSent: false,
                                  sentAt: undefined,
                                }));
                                onSaveItem({
                                  ...item,
                                  progressPercent: 0,
                                  recipients: resetRecipients,
                                  statusBisaPM: 'sudah',
                                });
                                setActiveMenuId(null);
                                if (onShowToast) onShowToast(`"${item.proyekSapa}" diatur ulang dan dipindahkan ke "Sudah bisa di-PM"`);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#00897b] hover:bg-teal-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4 text-[#00897b]" />
                              <span>Pindahkan ke "Sudah bisa di-PM"</span>
                            </button>
                          ) : item.statusBisaPM === 'belum' ? (
                            <button
                              type="button"
                              onClick={() => {
                                onSaveItem({
                                  ...item,
                                  statusBisaPM: 'sudah',
                                });
                                setActiveMenuId(null);
                                if (onShowToast) onShowToast(`"${item.proyekSapa}" dipindahkan ke "Sudah bisa di-PM"`);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#00897b] hover:bg-teal-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4 text-[#00897b]" />
                              <span>Pindahkan ke "Sudah bisa di-PM"</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onSaveItem({
                                  ...item,
                                  statusBisaPM: 'belum',
                                  tanggalMulaiPM: item.tanggalMulaiPM || item.tanggalMulaiDihubungi || '15 Nov 2021',
                                });
                                setActiveMenuId(null);
                                if (onShowToast) onShowToast(`"${item.proyekSapa}" dipindahkan ke "Belum bisa di-PM"`);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <ArrowUpDown className="w-4 h-4 text-slate-500" />
                              <span>Pindahkan ke "Belum bisa di-PM"</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const duplicated: ListPMItem = {
                                ...item,
                                id: `pm-${Date.now()}`,
                                proyekSapa: `${item.proyekSapa} (Salinan)`,
                                progressPercent: 0,
                                recipients: item.recipients?.map((r, idx) => ({
                                  ...r,
                                  id: `rec-dup-${idx}`,
                                  isSent: false,
                                  sentAt: undefined,
                                })),
                              };
                              onSaveItem(duplicated);
                              setActiveMenuId(null);
                              if (onShowToast) onShowToast(`Berhasil menduplikasi "${item.proyekSapa}"`);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Copy className="w-4 h-4 text-slate-500" />
                            <span>Duplikasi List PM</span>
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteItem(item.id);
                              onShowToast?.(`Proyek "${item.proyekSapa}" dihapus dari List PM`);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-[#008d91]" />
          <span>
            Total <strong>{filteredItems.length}</strong> List PM terdaftar. Klik baris untuk kelola pengiriman chat.
          </span>
        </div>
        <div className="text-slate-400">
          Template chat otomatis disesuaikan dengan Identitas ID penerima.
        </div>
      </div>

      {/* Detail / Send Chat Pop Up Modal matching image.png */}
      {detailModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setDetailModalItem(null)}
        >
          <div
            className="bg-slate-50 rounded-3xl w-full max-w-6xl max-h-[94vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200/80 my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-6 overflow-y-auto">
              <DetailListPMView
                item={detailModalItem}
                identitasList={identitasList || []}
                salurOrders={salurOrders}
                transaksiAjarList={transaksiAjarList}
                donasiOrders={donasiOrders}
                onBack={() => setDetailModalItem(null)}
                onUpdateItem={(updated) => {
                  onSaveItem(updated);
                  setDetailModalItem(updated);
                }}
                onShowToast={onShowToast}
                isModal={true}
                onNavigateToFormPM={(project) => {
                  setDetailModalItem(null);
                  if (onNavigateToFormPMWithProject) {
                    onNavigateToFormPMWithProject(project);
                  } else if (onAddNew) {
                    onAddNew();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-lg">
                {formEditingItem ? 'Edit List PM' : 'Tambah List PM Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Proyek SAPA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proyek SAPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kirim Resi, Ajakan Event, Ajakan Donasi..."
                  value={formData.proyekSapa}
                  onChange={(e) => setFormData({ ...formData, proyekSapa: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#008d91]"
                />
              </div>

              {/* Kode Proyek & Icon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Proyek
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: MAD, EVE, FUN..."
                    value={formData.proyekKode}
                    onChange={(e) => setFormData({ ...formData, proyekKode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Icon Proyek
                  </label>
                  <select
                    value={formData.iconType}
                    onChange={(e) => setFormData({ ...formData, iconType: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#008d91]"
                  >
                    <option value="package">Package / Kotak</option>
                    <option value="rocket">Rocket / Event</option>
                    <option value="creditCard">Credit Card / Donasi</option>
                    <option value="shoppingCart">Shopping Cart / Penyaluran</option>
                  </select>
                </div>
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipe Target Penerima Chat
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, targetType: 'multiple' })}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      formData.targetType === 'multiple'
                        ? 'border-[#008d91] bg-teal-50/50 text-[#008d91]'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Users className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Banyak Identitas (Group)</div>
                      <div className="text-[11px] text-slate-400">Contoh: 10 Orang, 30 Orang</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, targetType: 'single' })}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      formData.targetType === 'single'
                        ? 'border-[#008d91] bg-teal-50/50 text-[#008d91]'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <User className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Satu Identitas</div>
                      <div className="text-[11px] text-slate-400">Contoh: 00031 Agustino Ong</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Target Details */}
              {formData.targetType === 'multiple' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Target Penerima
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.targetCount}
                    onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#008d91]"
                  />
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih dari Master Identitas ID
                    </label>
                    <select
                      value={formData.singleIdentitasId}
                      onChange={(e) => {
                        const id = e.target.value;
                        const match = allIdentitas.find((it) => it.id === id);
                        setFormData({
                          ...formData,
                          singleIdentitasId: id,
                          singleNama: match?.namaLengkap || formData.singleNama,
                          singleHp: match?.nomorHandPhone || formData.singleHp,
                        });
                      }}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#008d91]"
                    >
                      <option value="">-- Pilih Identitas --</option>
                      {allIdentitas.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.codeId ? `[${it.codeId}] ` : ''}{it.namaLengkap} ({it.nomorHandPhone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={formData.singleNama}
                        onChange={(e) => setFormData({ ...formData, singleNama: e.target.value })}
                        placeholder="Nama Identitas"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor Handphone
                      </label>
                      <input
                        type="text"
                        value={formData.singleHp}
                        onChange={(e) => setFormData({ ...formData, singleHp: e.target.value })}
                        placeholder="0812..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deadline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deadline
                </label>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer bg-slate-50">
                    <input
                      type="radio"
                      name="deadlineType"
                      checked={formData.deadlineType === 'none'}
                      onChange={() => setFormData({ ...formData, deadlineType: 'none' })}
                      className="text-[#008d91]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Tanpa Deadline (-)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer bg-slate-50">
                    <input
                      type="radio"
                      name="deadlineType"
                      checked={formData.deadlineType === 'date'}
                      onChange={() => setFormData({ ...formData, deadlineType: 'date' })}
                      className="text-[#008d91]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Tentukan Tanggal</span>
                  </label>
                </div>
                {formData.deadlineType === 'date' && (
                  <input
                    type="text"
                    placeholder="Contoh: 16 Nov 2021 atau 26 Nov 2021"
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#008d91]"
                  />
                )}
              </div>

              {/* Status Tab & Tanggal Mulai PM */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status PM (Tab)
                </label>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer bg-slate-50">
                    <input
                      type="radio"
                      name="statusBisaPM"
                      checked={formData.statusBisaPM === 'sudah'}
                      onChange={() => setFormData({ ...formData, statusBisaPM: 'sudah' })}
                      className="text-[#008d91]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Sudah bisa di-PM</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer bg-slate-50">
                    <input
                      type="radio"
                      name="statusBisaPM"
                      checked={formData.statusBisaPM === 'belum'}
                      onChange={() => setFormData({ ...formData, statusBisaPM: 'belum' })}
                      className="text-[#008d91]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Belum bisa di-PM</span>
                  </label>
                </div>
                {formData.statusBisaPM === 'belum' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Mulai PM
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 15 Nov 2021"
                      value={formData.tanggalMulaiPM}
                      onChange={(e) => setFormData({ ...formData, tanggalMulaiPM: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#008d91]"
                    />
                  </div>
                )}
              </div>

              {/* Template Pesan */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Template Pesan Chat
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Gunakan {'{Nama}'} untuk nama otomatis
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={formData.templatePesan}
                  onChange={(e) => setFormData({ ...formData, templatePesan: e.target.value })}
                  placeholder="Ketik template pesan di sini..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#008d91] font-sans"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {formEditingItem ? 'Simpan Perubahan' : 'Tambah List PM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setBulkDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Hapus {selectedIds.length} Proyek Terpilih?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tindakan ini akan menghapus <strong>{selectedIds.length}</strong> proyek yang dipilih dari List PM secara permanen. Proyek dan progres pengiriman di dalamnya akan dihapus.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Items List Preview */}
            <div className="p-6 max-h-60 overflow-y-auto space-y-2.5 bg-slate-50/50">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Daftar Proyek yang Akan Dihapus:
              </div>
              {items
                .filter((it) => selectedIds.includes(it.id))
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#008d91] flex items-center justify-center text-white shrink-0">
                        {renderRowIcon(item.iconType)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-800 truncate">
                          {item.proyekSapa}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.proyekKode} • {item.targetType === 'single' && item.singleTarget ? item.singleTarget.nama : `${item.targetCount || 10} Orang`}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      {item.progressPercent}%
                    </span>
                  </div>
                ))}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus ({selectedIds.length}) Proyek</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
