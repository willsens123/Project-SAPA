import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  X,
  Plus,
  Search,
  Check,
  Building2,
  Users,
  User,
  Phone,
  Clock,
  Trash2,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { ListPMItem, ListPMDetailRow, TemplatePMItem, OrganisasiItem, KaryawanItem } from '../types';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { INITIAL_ORGANISASI } from '../organisasiData';
import { FunnelingGroupCard, INITIAL_FUNNELING_GROUPS } from '../funnelingData';
import { INITIAL_KARYAWAN } from '../karyawanData';
import { SalurProduct, INITIAL_BOOKS } from '../salurData';
import { isTanggalMulaiPMDue } from '../listPMData';
import { DateRangePickerPopover } from './DateRangePickerPopover';

export interface PmLanjutanFormItem {
  id: string;
  jedaUnit: 'hari' | 'bulan';
  jedaValue: string; // number string
  templateId: string;
  templateName: string;
  itemTitle: string;
}

export interface FormListPMInitialTarget {
  type: 'identitas' | 'organisasi' | 'funneling';
  id?: string;
  identitasIds?: string[];
  nama: string;
  hp?: string;
  detail?: string;
  items?: { id: string; nama: string; nomorHp: string; codeId?: string; }[];
}

const formatToIndonesianDate = (date: Date): string => {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getOffsetDateFormatted = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return formatToIndonesianDate(d);
};

interface FormListPMProps {
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  funnelingGroups?: FunnelingGroupCard[];
  karyawanList?: KaryawanItem[];
  templatePMList?: TemplatePMItem[];
  salurProducts?: SalurProduct[];
  initialTarget?: FormListPMInitialTarget | null;
  initialProject?: ListPMItem | null;
  onSave: (item: ListPMItem, lanjutanItems?: ListPMItem[]) => void;
  onCancel: () => void;
  onShowToast?: (message: string) => void;
}

export const FormListPM: React.FC<FormListPMProps> = ({
  identitasList,
  organisasiList,
  funnelingGroups,
  karyawanList,
  templatePMList,
  salurProducts,
  initialTarget,
  initialProject,
  onSave,
  onCancel,
  onShowToast,
}) => {
  // Master data with safe defaults
  const allIdentitas = identitasList && identitasList.length > 0 ? identitasList : INITIAL_IDENTITAS;
  const allOrganisasi = organisasiList && organisasiList.length > 0 ? organisasiList : INITIAL_ORGANISASI;
  const allFunneling = funnelingGroups && funnelingGroups.length > 0 ? funnelingGroups : INITIAL_FUNNELING_GROUPS;
  const allKaryawan = karyawanList && karyawanList.length > 0 ? karyawanList : INITIAL_KARYAWAN;
  const allTemplates = templatePMList || [];
  const allItems = salurProducts && salurProducts.length > 0 ? salurProducts : INITIAL_BOOKS;

  // Active Tab: Non-rutin vs Rutin
  const [activeTab, setActiveTab] = useState<'non-rutin' | 'rutin'>(() => {
    if (initialProject?.tabType) return initialProject.tabType;
    return 'rutin';
  });

  // Form State for Non-rutin
  const [deadline, setDeadline] = useState(() => {
    if (initialProject?.deadline && initialProject.deadline !== '-') {
      return initialProject.deadline;
    }
    return '16 Nov 2021';
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isNonRutinRangePickerOpen, setIsNonRutinRangePickerOpen] = useState(false);
  const [isRutinRangePickerOpen, setIsRutinRangePickerOpen] = useState(false);

  // Tanggal mulai dihubungi State (auto input tanggal hari ini, can be edited)
  const [tanggalMulaiDihubungi, setTanggalMulaiDihubungi] = useState(() => {
    if (initialProject?.tanggalMulaiPM) return initialProject.tanggalMulaiPM;
    if (initialProject?.tanggalMulaiDihubungi) return initialProject.tanggalMulaiDihubungi;
    return formatToIndonesianDate(new Date());
  });
  const [showTanggalMulaiPickerNonRutin, setShowTanggalMulaiPickerNonRutin] = useState(false);
  const [showTanggalMulaiPickerRutin, setShowTanggalMulaiPickerRutin] = useState(false);

  // Target State: Identitas ID, Organisasi ID, or List group funneling
  // If initialProject is provided, target must be kept empty as requested:
  // "form yang diisi sesuai data proyek sapa-nya, tapi kosongkan targetnya untuk di tambah target yang baru"
  const [targetType, setTargetType] = useState<'identitas' | 'organisasi' | 'funneling' | null>(() => {
    if (initialProject) return null;
    return initialTarget?.type || null;
  });
  const [targetId, setTargetId] = useState(() => (initialProject ? '' : initialTarget?.id || ''));
  const [targetNama, setTargetNama] = useState(() => (initialProject ? '' : initialTarget?.nama || ''));
  const [targetHp, setTargetHp] = useState(() => (initialProject ? '' : initialTarget?.hp || ''));
  const [targetDetail, setTargetDetail] = useState(() => (initialProject ? '' : initialTarget?.detail || ''));
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetSearchQuery, setTargetSearchQuery] = useState('');
  const [targetModalTab, setTargetModalTab] = useState<'identitas' | 'organisasi' | 'funneling'>('identitas');

  // Dihubungi Oleh State: Call Center, PIC YPPLN (sesuai target), or ID Karyawan tertentu
  const [dihubungiType, setDihubungiType] = useState<'call_center' | 'pic_yppln' | 'karyawan' | null>(() => {
    if (initialProject?.dihubungiOlehType) return initialProject.dihubungiOlehType;
    if (initialTarget?.type === 'identitas') return 'pic_yppln';
    return null;
  });
  const [dihubungiNama, setDihubungiNama] = useState(() => {
    if (initialProject?.dihubungiOleh) return initialProject.dihubungiOleh;
    if (initialTarget?.type === 'identitas') {
      const match = allIdentitas.find((i) => i.id === initialTarget.id || i.codeId === initialTarget.id);
      return match?.pic ? `PIC YPPLN (${match.pic})` : 'PIC YPPLN (Bhadra Ksanti)';
    }
    return '';
  });
  const [dihubungiId, setDihubungiId] = useState('');
  const [showDihubungiModal, setShowDihubungiModal] = useState(false);
  const [karyawanSearchQuery, setKaryawanSearchQuery] = useState('');

  // Update target when initialTarget prop changes
  React.useEffect(() => {
    if (initialProject) {
      // Keep target empty when project is provided
      setTargetType(null);
      setTargetId('');
      setTargetNama('');
      setTargetHp('');
      setTargetDetail('');
      return;
    }
    if (initialTarget) {
      setTargetType(initialTarget.type);
      setTargetId(initialTarget.id || '');
      setTargetNama(initialTarget.nama || '');
      setTargetHp(initialTarget.hp || '');
      setTargetDetail(initialTarget.detail || '');
      if (initialTarget.type === 'identitas') {
        setDihubungiType('pic_yppln');
        const match = allIdentitas.find((i) => i.id === initialTarget.id || i.codeId === initialTarget.id);
        setDihubungiNama(match?.pic ? `PIC YPPLN (${match.pic})` : 'PIC YPPLN (Bhadra Ksanti)');
      }
    }
  }, [initialTarget, initialProject, allIdentitas]);

  // Template PM State
  const [templateId, setTemplateId] = useState(() => {
    if (initialProject) {
      const match = (templatePMList || []).find(
        (t) =>
          t.namaTemplate.toLowerCase() === initialProject.proyekSapa.toLowerCase() ||
          t.itemTerkait?.toLowerCase() === initialProject.itemTitle?.toLowerCase()
      );
      return match?.id || '';
    }
    return '';
  });
  const [templateName, setTemplateName] = useState(() => {
    if (initialProject) {
      const match = (templatePMList || []).find(
        (t) =>
          t.namaTemplate.toLowerCase() === initialProject.proyekSapa.toLowerCase() ||
          t.itemTerkait?.toLowerCase() === initialProject.itemTitle?.toLowerCase()
      );
      return match?.namaTemplate || initialProject.proyekSapa;
    }
    return '';
  });
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  // Item State
  const [selectedItem, setSelectedItem] = useState(() => {
    if (initialProject?.itemTitle) return initialProject.itemTitle;
    return '';
  });
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // PM Lanjutan State
  const [pmLanjutanList, setPmLanjutanList] = useState<PmLanjutanFormItem[]>(() => {
    if (initialProject?.pmLanjutanList && initialProject.pmLanjutanList.length > 0) {
      return initialProject.pmLanjutanList.map((pl, idx) => ({
        id: pl.id || `lanjutan-${Date.now()}-${idx}`,
        jedaUnit: pl.jedaUnit || 'hari',
        jedaValue: pl.jedaValue ? String(pl.jedaValue) : '',
        templateId: pl.templateId || '',
        templateName: pl.templateName || '',
        itemTitle: pl.itemTitle || '',
      }));
    }
    return [
      {
        id: 'lanjutan-1',
        jedaUnit: 'hari',
        jedaValue: '',
        templateId: '',
        templateName: '',
        itemTitle: '',
      },
    ];
  });

  // Dropdown states for PM Lanjutan rows
  const [activeLanjutanJedaDropdown, setActiveLanjutanJedaDropdown] = useState<string | null>(null);
  const [activeLanjutanTemplateDropdown, setActiveLanjutanTemplateDropdown] = useState<string | null>(null);
  const [activeLanjutanItemDropdown, setActiveLanjutanItemDropdown] = useState<string | null>(null);
  const [lanjutanItemSearchQuery, setLanjutanItemSearchQuery] = useState('');

  // Rutin Tab specific state (matching image.png)
  const [berkalaMode, setBerkalaMode] = useState<'setiap' | 'setiap_hari' | 'setiap_tanggal'>(() => {
    if (initialProject?.berkalaMode) return initialProject.berkalaMode;
    return 'setiap';
  });
  const [kirimBerkalaExpanded, setKirimBerkalaExpanded] = useState(true);
  const [setiapHariValue, setSetiapHariValue] = useState(() => {
    if (initialProject?.berkalaValue) return initialProject.berkalaValue;
    return '7';
  });
  const [setiapHariPilihan, setSetiapHariPilihan] = useState('Senin');
  const [setiapTanggalPilihan, setSetiapTanggalPilihan] = useState('Tanggal 1');
  const [tanggalBerakhir, setTanggalBerakhir] = useState(() => {
    if (initialProject?.tanggalBerakhir) return initialProject.tanggalBerakhir;
    return '';
  });

  // Re-sync with initialProject when prop updates
  React.useEffect(() => {
    if (initialProject) {
      if (initialProject.tabType) setActiveTab(initialProject.tabType);
      if (initialProject.deadline && initialProject.deadline !== '-') setDeadline(initialProject.deadline);
      const startD = initialProject.tanggalMulaiPM || initialProject.tanggalMulaiDihubungi;
      if (startD) setTanggalMulaiDihubungi(startD);

      const matchT = (templatePMList || []).find(
        (t) =>
          t.namaTemplate.toLowerCase() === initialProject.proyekSapa.toLowerCase() ||
          t.itemTerkait?.toLowerCase() === initialProject.itemTitle?.toLowerCase()
      );
      setTemplateId(matchT?.id || '');
      setTemplateName(matchT?.namaTemplate || initialProject.proyekSapa);

      if (initialProject.itemTitle) setSelectedItem(initialProject.itemTitle);
      if (initialProject.dihubungiOlehType) setDihubungiType(initialProject.dihubungiOlehType);
      if (initialProject.dihubungiOleh) setDihubungiNama(initialProject.dihubungiOleh);
      if (initialProject.berkalaMode) setBerkalaMode(initialProject.berkalaMode);
      if (initialProject.berkalaValue) setSetiapHariValue(initialProject.berkalaValue);
      if (initialProject.tanggalBerakhir) setTanggalBerakhir(initialProject.tanggalBerakhir);

      if (initialProject.pmLanjutanList && initialProject.pmLanjutanList.length > 0) {
        setPmLanjutanList(
          initialProject.pmLanjutanList.map((pl, idx) => ({
            id: pl.id || `lanjutan-${Date.now()}-${idx}`,
            jedaUnit: pl.jedaUnit || 'hari',
            jedaValue: pl.jedaValue ? String(pl.jedaValue) : '',
            templateId: pl.templateId || '',
            templateName: pl.templateName || '',
            itemTitle: pl.itemTitle || '',
          }))
        );
      }

      // Empty target
      setTargetType(null);
      setTargetId('');
      setTargetNama('');
      setTargetHp('');
      setTargetDetail('');
    }
  }, [initialProject, templatePMList]);

  // Dropdown states for Rutin Tab
  const [showSetiapDropdown, setShowSetiapDropdown] = useState(false);
  const [showSetiapHariDropdown, setShowSetiapHariDropdown] = useState(false);
  const [showSetiapTanggalDropdown, setShowSetiapTanggalDropdown] = useState(false);
  const [showTanggalBerakhirPicker, setShowTanggalBerakhirPicker] = useState(false);

  // Filtered Identitas
  const filteredIdentitas = useMemo(() => {
    const q = targetSearchQuery.toLowerCase().trim();
    if (!q) return allIdentitas;
    return allIdentitas.filter(
      (it) =>
        (it.namaLengkap && it.namaLengkap.toLowerCase().includes(q)) ||
        (it.codeId && it.codeId.toLowerCase().includes(q)) ||
        (it.nomorHandPhone && it.nomorHandPhone.includes(q))
    );
  }, [allIdentitas, targetSearchQuery]);

  // Filtered Organisasi
  const filteredOrganisasi = useMemo(() => {
    const q = targetSearchQuery.toLowerCase().trim();
    if (!q) return allOrganisasi;
    return allOrganisasi.filter(
      (org) =>
        (org.namaOrg && org.namaOrg.toLowerCase().includes(q)) ||
        (org.hp && org.hp.includes(q)) ||
        (org.picOrgNama && org.picOrgNama.toLowerCase().includes(q))
    );
  }, [allOrganisasi, targetSearchQuery]);

  // Filtered Funneling
  const filteredFunneling = useMemo(() => {
    const q = targetSearchQuery.toLowerCase().trim();
    if (!q) return allFunneling;
    return allFunneling.filter(
      (f) =>
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.jenisGroup && f.jenisGroup.toLowerCase().includes(q))
    );
  }, [allFunneling, targetSearchQuery]);

  // Filtered Karyawan
  const filteredKaryawan = useMemo(() => {
    const q = karyawanSearchQuery.toLowerCase().trim();
    if (!q) return allKaryawan;
    return allKaryawan.filter(
      (k) =>
        (k.namaLengkap && k.namaLengkap.toLowerCase().includes(q)) ||
        (k.kodeKaryawan && k.kodeKaryawan.toLowerCase().includes(q)) ||
        (k.divisi && k.divisi.toLowerCase().includes(q))
    );
  }, [allKaryawan, karyawanSearchQuery]);

  // Filtered Items
  const filteredItemList = useMemo(() => {
    const q = itemSearchQuery.toLowerCase().trim();
    if (!q) return allItems;
    return allItems.filter((it) => it.title.toLowerCase().includes(q));
  }, [allItems, itemSearchQuery]);

  const filteredLanjutanItemList = useMemo(() => {
    const q = lanjutanItemSearchQuery.toLowerCase().trim();
    if (!q) return allItems;
    return allItems.filter((it) => it.title.toLowerCase().includes(q));
  }, [allItems, lanjutanItemSearchQuery]);

  // Handler selecting Target
  const handleSelectIdentitas = (it: IdentitasItem) => {
    setTargetType('identitas');
    setTargetId(it.id);
    setTargetNama(it.namaLengkap);
    setTargetHp(it.nomorHandPhone || '-');
    setTargetDetail(`ID: ${it.codeId || it.id}`);
    setShowTargetModal(false);

    // Auto-suggest PIC YPPLN if dihubungi is not set
    if (!dihubungiNama) {
      setDihubungiType('pic_yppln');
      setDihubungiNama(it.pic ? `PIC YPPLN (${it.pic})` : 'PIC YPPLN (Bhadra Ksanti)');
    }
  };

  const handleSelectOrganisasi = (org: OrganisasiItem) => {
    setTargetType('organisasi');
    setTargetId(org.id);
    setTargetNama(org.namaOrg);
    setTargetHp(org.hp || '-');
    setTargetDetail(`PIC: ${org.picOrgNama || org.pic || '-'}`);
    setShowTargetModal(false);

    // Auto-suggest PIC YPPLN from organization
    if (org.picOrgNama || org.pic) {
      setDihubungiType('pic_yppln');
      setDihubungiNama(`PIC YPPLN: ${org.picOrgNama || org.pic}`);
    }
  };

  const handleSelectFunneling = (fg: FunnelingGroupCard) => {
    setTargetType('funneling');
    setTargetId(fg.id);
    setTargetNama(fg.name);
    setTargetHp(`${fg.count} Penerima`);
    setTargetDetail(fg.countLabel || `${fg.count} orang`);
    setShowTargetModal(false);

    if (!dihubungiNama) {
      setDihubungiType('call_center');
      setDihubungiNama('Call Center SAPA');
    }
  };

  // Handler selecting Template PM
  const handleSelectTemplate = (t: TemplatePMItem) => {
    setTemplateId(t.id);
    setTemplateName(t.namaTemplate);
    setShowTemplateDropdown(false);
    // If template has related item and item is empty, set it
    if (t.itemTerkait && !selectedItem) {
      setSelectedItem(t.itemTerkait);
    }
  };

  // PM Lanjutan Row Handlers
  const handleAddPmLanjutan = () => {
    setPmLanjutanList((prev) => [
      ...prev,
      {
        id: `lanjutan-${Date.now()}`,
        jedaUnit: 'hari',
        jedaValue: '',
        templateId: '',
        templateName: '',
        itemTitle: '',
      },
    ]);
  };

  const handleRemovePmLanjutan = (id: string) => {
    setPmLanjutanList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdatePmLanjutan = (
    id: string,
    field: keyof PmLanjutanFormItem,
    value: any
  ) => {
    setPmLanjutanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Form Submission
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetNama && !targetId) {
      if (onShowToast) onShowToast('Mohon pilih Target penerima terlebih dahulu');
      return;
    }

    const primaryProyekSapa = initialProject?.proyekSapa || templateName || (selectedItem ? `Kirim ${selectedItem}` : 'List PM Baru');
    const primaryId = initialProject?.id || `pm-${Date.now()}`;
    const primaryKode = initialProject?.proyekKode || 'MAD';
    const primaryIcon = initialProject?.iconType || 'package';

    // Target display
    const formattedTarget = targetNama
      ? targetHp && targetHp !== '-'
        ? `${targetNama} (${targetHp})`
        : targetNama
      : 'Penerima PM';

    const resolvedRecipients =
      initialTarget?.items && initialTarget.items.length > 0
        ? initialTarget.items.map((it, idx) => ({
            id: `rec-${Date.now()}-${idx}`,
            identitasId: it.id,
            codeId: it.codeId,
            nama: it.nama,
            nomorHp: it.nomorHp || '-',
            isSent: false,
          }))
        : targetType === 'funneling'
        ? allIdentitas.slice(0, 10).map((it, idx) => ({
            id: `rec-${Date.now()}-${idx}`,
            identitasId: it.id,
            codeId: it.codeId,
            nama: it.namaLengkap,
            nomorHp: it.nomorHandPhone || '-',
            isSent: false,
          }))
        : [
            {
              id: `rec-${Date.now()}`,
              identitasId: targetType === 'identitas' ? targetId : undefined,
              codeId: targetDetail.replace('ID: ', '') || (targetType === 'identitas' ? '00031' : undefined),
              nama: targetNama || 'Penerima',
              nomorHp: targetHp || '-',
              isSent: false,
            },
          ];

    const resolvedDetailRows: ListPMDetailRow[] = resolvedRecipients.map((rec, idx) => ({
      id: `dr-${Date.now()}-${idx}`,
      deadline: deadline || '-',
      identitasId: rec.identitasId,
      codeId: rec.codeId,
      nama: rec.nama,
      nomorHp: rec.nomorHp,
      avatarInitial: (rec.nama || 'A').charAt(0).toUpperCase(),
      avatarBg: 'bg-[#008d91]',
      proyekSapa: primaryProyekSapa,
      proyekKode: primaryKode,
      templateName: templateName || initialProject?.proyekSapa || 'Template A',
      templateContent: templateName ? `Template: ${templateName}` : 'Pesan PM Proyek SAPA',
      itemTitle: selectedItem || initialProject?.itemTitle || 'Jalan Menuju Kemahatahuan',
      itemSubtitle: selectedItem ? `Item: ${selectedItem}` : 'Item Proyek SAPA',
      itemStock: 'Stok: 100',
      status: 'pending',
    }));

    // Primary item
    const newPrimaryItem: ListPMItem = {
      id: primaryId,
      proyekSapa: primaryProyekSapa,
      proyekKode: primaryKode,
      iconType: primaryIcon,
      targetType: resolvedRecipients.length > 1 ? 'multiple' : 'single',
      targetCount: resolvedRecipients.length,
      singleTarget:
        resolvedRecipients.length === 1
          ? {
              identitasId: resolvedRecipients[0].identitasId,
              codeId: resolvedRecipients[0].codeId || (targetType === 'identitas' ? '00031' : undefined),
              nama: resolvedRecipients[0].nama,
              nomorHp: resolvedRecipients[0].nomorHp,
              avatarInitial: resolvedRecipients[0].nama ? resolvedRecipients[0].nama.charAt(0).toUpperCase() : 'T',
              avatarBg: 'bg-[#008d91]',
            }
          : undefined,
      deadline: deadline || '-',
      deadlineColor: 'teal',
      templatePesan: initialProject?.templatePesan || (templateName ? `Template: ${templateName}` : 'Pesan PM Proyek SAPA'),
      progressPercent: initialProject?.progressPercent || 0,
      itemTitle: selectedItem || initialProject?.itemTitle,
      dihubungiOleh: dihubungiNama || initialProject?.dihubungiOleh || 'Call Center SAPA',
      dihubungiOlehType: dihubungiType || initialProject?.dihubungiOlehType || 'call_center',
      targetSourceType: targetType || undefined,
      targetSourceName: targetNama,
      targetPhone: targetHp,
      tanggalMulaiDihubungi: tanggalMulaiDihubungi || formatToIndonesianDate(new Date()),
      tanggalMulaiPM: tanggalMulaiDihubungi || formatToIndonesianDate(new Date()),
      statusBisaPM: isTanggalMulaiPMDue(tanggalMulaiDihubungi || formatToIndonesianDate(new Date())) ? 'sudah' : 'belum',
      tabType: activeTab,
      createdAt: initialProject?.createdAt || new Date().toISOString(),
      recipients: resolvedRecipients,
      detailRows: resolvedDetailRows,
      detailBadge: initialProject?.detailBadge || {
        label: primaryProyekSapa,
        countText: resolvedRecipients.length > 1 ? `${resolvedRecipients.length} Orang` : '1 buah',
      },
      pmLanjutanList: pmLanjutanList
        .filter((l) => l.jedaValue && parseInt(l.jedaValue, 10) > 0)
        .map((l) => ({
          id: l.id,
          jedaUnit: l.jedaUnit,
          jedaValue: parseInt(l.jedaValue, 10) || 1,
          templateId: l.templateId,
          templateName: l.templateName,
          itemTitle: l.itemTitle,
        })),
    };

    // Build PM Lanjutan items if configured with Jeda
    // Rule from user: "Jeda adalah rentang PM sebelumnya bisa dikirim dengan PM setelahnya.
    // Jika belum waktunya, data tidak akan muncul di 'List PM'."
    const secondaryItems: ListPMItem[] = [];

    pmLanjutanList.forEach((lanjutan, idx) => {
      const jedaNum = parseInt(lanjutan.jedaValue, 10);
      if (jedaNum > 0) {
        // Calculate future availability date
        const targetDate = new Date();
        if (lanjutan.jedaUnit === 'bulan') {
          targetDate.setMonth(targetDate.getMonth() + jedaNum);
        } else {
          targetDate.setDate(targetDate.getDate() + jedaNum);
        }

        const dateFormatted = targetDate.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        const lanjutanTitle =
          lanjutan.templateName ||
          (lanjutan.itemTitle ? `Follow-up ${lanjutan.itemTitle}` : `PM Lanjutan #${idx + 1}`);

        const lanjutanItem: ListPMItem = {
          id: `pm-lanjutan-${primaryId}-${idx + 1}`,
          parentPmId: primaryId,
          proyekSapa: lanjutanTitle,
          proyekKode: 'MAD',
          iconType: 'package',
          targetType: targetType === 'funneling' ? 'multiple' : 'single',
          targetCount: targetType === 'funneling' ? 50 : 1,
          singleTarget: newPrimaryItem.singleTarget,
          deadline: dateFormatted,
          deadlineColor: 'amber',
          templatePesan: lanjutan.templateName
            ? `Template Lanjutan: ${lanjutan.templateName}`
            : 'Pesan PM Lanjutan Proyek SAPA',
          progressPercent: 0,
          itemTitle: lanjutan.itemTitle || selectedItem,
          dihubungiOleh: dihubungiNama || 'Call Center SAPA',
          dihubungiOlehType: dihubungiType || 'call_center',
          targetSourceType: targetType || undefined,
          targetSourceName: targetNama,
          targetPhone: targetHp,
          tanggalMulaiDihubungi: tanggalMulaiDihubungi || formatToIndonesianDate(new Date()),
          tabType: activeTab,
          isWaitingJeda: true, // Marked as waiting for jeda
          jedaUnit: lanjutan.jedaUnit,
          jedaValue: jedaNum,
          availableDate: targetDate.toISOString(),
          createdAt: new Date().toISOString(),
          detailBadge: {
            label: `Lanjutan (Jeda ${jedaNum} ${lanjutan.jedaUnit})`,
            countText: '1 buah',
          },
        };

        secondaryItems.push(lanjutanItem);
      }
    });

    onSave(newPrimaryItem, secondaryItems);
    if (onShowToast) {
      onShowToast(
        `Form List PM berhasil disimpan!${
          secondaryItems.length > 0
            ? ` (${secondaryItems.length} PM Lanjutan dijadwalkan dengan jeda)`
            : ''
        }`
      );
    }
  };

  // Helper for Rutin Berkala day of week
  const getNextDayOfWeek = (dayName: string): Date => {
    const daysMap: Record<string, number> = {
      minggu: 0,
      senin: 1,
      selasa: 2,
      rabu: 3,
      kamis: 4,
      jumat: 5,
      sabtu: 6,
    };
    const targetDay = daysMap[dayName.toLowerCase()] ?? 1;
    const now = new Date();
    const currentDay = now.getDay();
    let diff = targetDay - currentDay;
    if (diff <= 0) diff += 7;
    const targetDate = new Date(now.getTime() + diff * 86400000);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate;
  };

  // Helper for Rutin Berkala date of month
  const getNextDateOfMonth = (dateNum: number): Date => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), dateNum, 0, 0, 0);
    if (targetDate.getTime() <= now.getTime()) {
      targetDate.setMonth(targetDate.getMonth() + 1);
    }
    return targetDate;
  };

  // Rutin Form Submission
  // Rule: "Jika dikirim berkala, nanti akan muncul di List PM sesuai dengan durasi yang dipilih.
  // Jika sebelum durasi yang dipilih, jangan munculkan di List PM."
  const handleSaveRutinForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetNama && !targetId) {
      if (onShowToast) onShowToast('Mohon pilih ID Identitas terlebih dahulu');
      return;
    }

    // Determine target available date based on the chosen duration
    let availableTargetDate = new Date();
    let durasiText = '';

    if (berkalaMode === 'setiap') {
      const days = parseInt(setiapHariValue, 10) || 7;
      durasiText = `${days} Hari`;
      availableTargetDate = new Date(Date.now() + days * 86400000);
    } else if (berkalaMode === 'setiap_hari') {
      const dayName = setiapHariPilihan || 'Senin';
      durasiText = `Setiap Hari ${dayName}`;
      availableTargetDate = getNextDayOfWeek(dayName);
    } else if (berkalaMode === 'setiap_tanggal') {
      const dateNum = parseInt(setiapTanggalPilihan.replace(/\D/g, ''), 10) || 1;
      durasiText = `Setiap Tanggal ${dateNum}`;
      availableTargetDate = getNextDateOfMonth(dateNum);
    }

    const deadlineFormatted = availableTargetDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const primaryProyekSapa =
      templateName || (selectedItem ? `Kirim ${selectedItem}` : 'PM Rutin');
    const primaryId = `pm-rutin-${Date.now()}`;

    const newRutinItem: ListPMItem = {
      id: primaryId,
      proyekSapa: primaryProyekSapa,
      proyekKode: 'MAD',
      iconType: 'package',
      targetType: targetType === 'funneling' ? 'multiple' : 'single',
      targetCount: targetType === 'funneling' ? 50 : 1,
      singleTarget:
        targetType !== 'funneling'
          ? {
              identitasId: targetType === 'identitas' ? targetId : undefined,
              codeId: targetDetail.replace('ID: ', ''),
              nama: targetNama,
              nomorHp: targetHp,
              avatarInitial: targetNama ? targetNama.charAt(0).toUpperCase() : 'T',
              avatarBg: 'bg-[#008d91]',
            }
          : undefined,
      deadline: deadlineFormatted,
      deadlineColor: 'amber',
      templatePesan: templateName ? `Template: ${templateName}` : 'Pesan PM Rutin Proyek SAPA',
      progressPercent: 0,
      itemTitle: selectedItem,
      dihubungiOleh: dihubungiNama || 'Call Center SAPA',
      dihubungiOlehType: dihubungiType || 'call_center',
      targetSourceType: targetType || undefined,
      targetSourceName: targetNama,
      targetPhone: targetHp,
      tanggalMulaiDihubungi: tanggalMulaiDihubungi || formatToIndonesianDate(new Date()),
      tanggalMulaiPM: tanggalMulaiDihubungi || formatToIndonesianDate(new Date()),
      statusBisaPM: isTanggalMulaiPMDue(tanggalMulaiDihubungi || formatToIndonesianDate(new Date())) ? 'sudah' : 'belum',
      tabType: 'rutin',
      berkalaMode,
      berkalaValue: durasiText,
      tanggalBerakhir: tanggalBerakhir || undefined,
      durasiLabel: durasiText,
      isWaitingJeda: true, // "Jika sebelum durasi yang dipilih, jangan munculkan di List PM"
      availableDate: availableTargetDate.toISOString(),
      createdAt: new Date().toISOString(),
      recipients: [
        {
          id: `rec-${Date.now()}`,
          nama: targetNama || 'Penerima',
          nomorHp: targetHp || '-',
          isSent: false,
        },
      ],
      detailBadge: {
        label: `Rutin (${durasiText})`,
        countText: '1 buah',
      },
    };

    onSave(newRutinItem);
    if (onShowToast) {
      onShowToast(
        `List PM Rutin berhasil dijadwalkan (${durasiText}). Sesuai aturan berkala: data akan muncul di List PM pada ${deadlineFormatted}`
      );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-6">
      {/* Tab Controls: Non-rutin vs Rutin */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('non-rutin')}
          className={`px-8 py-2.5 rounded-full font-semibold text-sm transition-all shadow-xs cursor-pointer ${
            activeTab === 'non-rutin'
              ? 'bg-[#00897b] text-white'
              : 'bg-[#9e9e9e] text-white hover:bg-[#8e8e8e]'
          }`}
        >
          Non-rutin
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rutin')}
          className={`px-8 py-2.5 rounded-full font-semibold text-sm transition-all shadow-xs cursor-pointer ${
            activeTab === 'rutin'
              ? 'bg-[#00897b] text-white'
              : 'bg-[#9e9e9e] text-white hover:bg-[#8e8e8e]'
          }`}
        >
          Rutin
        </button>
      </div>

      {/* Non-rutin Form View */}
      {activeTab === 'non-rutin' && (
        <form onSubmit={handleSaveForm} className="space-y-6">
          {/* Main Form Fields Container */}
          <div className="space-y-5">
            {/* Field: Deadline */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="sm:w-52 text-slate-600 text-base font-normal">
                Deadline
              </label>
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Input Date..."
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onClick={() => setIsNonRutinRangePickerOpen(true)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00897b] pr-12 shadow-2xs cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setIsNonRutinRangePickerOpen(!isNonRutinRangePickerOpen)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00897b] hover:text-[#00796b] cursor-pointer"
                  title="Pilih Rentang Tanggal"
                >
                  <Calendar className="w-5 h-5" />
                </button>

                <DateRangePickerPopover
                  isOpen={isNonRutinRangePickerOpen}
                  onClose={() => setIsNonRutinRangePickerOpen(false)}
                  startDate={tanggalMulaiDihubungi}
                  endDate={deadline}
                  onSelectRange={(start, end) => {
                    setTanggalMulaiDihubungi(start);
                    setDeadline(end || start);
                  }}
                />

                {/* Date Picker Popover */}
                {showDatePicker && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-40">
                    <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      Pilih Tanggal Deadline
                    </div>
                    <div className="space-y-1.5">
                      {['16 Nov 2021', '26 Nov 2021', '30 Nov 2021', '10 Des 2021'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDeadline(d);
                            setShowDatePicker(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                            deadline === d
                              ? 'bg-teal-50 text-[#00897b]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{d}</span>
                          {deadline === d && <Check className="w-4 h-4 text-[#00897b]" />}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
                      <input
                        type="date"
                        onChange={(e) => {
                          if (e.target.value) {
                            const dateObj = new Date(e.target.value);
                            const formatted = dateObj.toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            });
                            setDeadline(formatted);
                            setShowDatePicker(false);
                          }
                        }}
                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Field: Tanggal mulai dihubungi */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="sm:w-52 text-slate-600 text-base font-normal">
                Tanggal mulai dihubungi
              </label>
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Input Date..."
                  value={tanggalMulaiDihubungi}
                  onChange={(e) => setTanggalMulaiDihubungi(e.target.value)}
                  onClick={() => setIsNonRutinRangePickerOpen(true)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00897b] pr-12 shadow-2xs cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setIsNonRutinRangePickerOpen(!isNonRutinRangePickerOpen)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00897b] hover:text-[#00796b] cursor-pointer"
                  title="Pilih Tanggal Mulai Dihubungi"
                >
                  <Calendar className="w-5 h-5" />
                </button>

                {/* Date Picker Popover */}
                {showTanggalMulaiPickerNonRutin && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowTanggalMulaiPickerNonRutin(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-40">
                      <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        Pilih Tanggal Mulai Dihubungi
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { label: 'Hari Ini', date: formatToIndonesianDate(new Date()) },
                          { label: 'Besok', date: getOffsetDateFormatted(1) },
                          { label: '3 Hari Lagi', date: getOffsetDateFormatted(3) },
                          { label: '7 Hari Lagi', date: getOffsetDateFormatted(7) },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setTanggalMulaiDihubungi(item.date);
                              setShowTanggalMulaiPickerNonRutin(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                              tanggalMulaiDihubungi === item.date
                                ? 'bg-teal-50 text-[#00897b]'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{item.label} ({item.date})</span>
                            {tanggalMulaiDihubungi === item.date && (
                              <Check className="w-4 h-4 text-[#00897b]" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
                        <input
                          type="date"
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                              setTanggalMulaiDihubungi(formatToIndonesianDate(dateObj));
                              setShowTanggalMulaiPickerNonRutin(false);
                            }
                          }}
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Field: Target */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="sm:w-52 text-slate-600 text-base font-normal">
                Target
              </label>
              <div className="relative w-full max-w-md">
                <div
                  onClick={() => setShowTargetModal(true)}
                  className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-colors"
                >
                  <span className={targetNama ? 'font-medium text-slate-800 truncate' : 'text-slate-400'}>
                    {targetNama
                      ? targetHp && targetHp !== '-'
                        ? `${targetNama} (${targetHp})`
                        : targetNama
                      : 'Search...'}
                  </span>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {/* Chevron Circle Button */}
                    <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>

                    {/* Clear Button */}
                    {targetNama && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetNama('');
                          setTargetId('');
                          setTargetHp('');
                          setTargetDetail('');
                          setTargetType(null);
                        }}
                        className="text-[#00897b] hover:text-[#00796b] p-0.5 cursor-pointer"
                        title="Hapus Target"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Plus Circle Button */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTargetModal(true);
                      }}
                      className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center cursor-pointer hover:bg-[#00796b]"
                      title="Pilih atau Tambah Target"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Field: Dihubungi oleh */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="sm:w-52 text-slate-600 text-base font-normal">
                Dihubungi oleh
              </label>
              <div className="relative w-full max-w-md">
                <div
                  onClick={() => setShowDihubungiModal(true)}
                  className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-colors"
                >
                  <span className={dihubungiNama ? 'font-medium text-slate-800 truncate' : 'text-slate-400'}>
                    {dihubungiNama || 'Search...'}
                  </span>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {/* Chevron Circle Button */}
                    <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>

                    {/* Clear Button */}
                    {dihubungiNama && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDihubungiNama('');
                          setDihubungiId('');
                          setDihubungiType(null);
                        }}
                        className="text-[#00897b] hover:text-[#00796b] p-0.5 cursor-pointer"
                        title="Hapus Dihubungi Oleh"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Plus Circle Button */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDihubungiModal(true);
                      }}
                      className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center cursor-pointer hover:bg-[#00796b]"
                      title="Pilih Pengirim PM"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Field: Template PM */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="sm:w-52 text-slate-600 text-base font-normal">
                Template PM
              </label>
              <div className="relative w-full max-w-md">
                <div
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-colors"
                >
                  <span className={templateName ? 'font-medium text-slate-800 truncate' : 'text-slate-400'}>
                    {templateName || 'Search...'}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center shrink-0 ml-2">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>

                {/* Template PM Dropdown */}
                {showTemplateDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-40 max-h-60 overflow-y-auto">
                    <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                      Pilih Template PM
                    </div>
                    {allTemplates.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        Belum ada template PM.
                      </div>
                    ) : (
                      allTemplates.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTemplate(t)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                            templateId === t.id
                              ? 'bg-teal-50 text-[#00897b]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-800">{t.namaTemplate}</div>
                            {t.itemTerkait && (
                              <div className="text-[10px] text-slate-400">Item: {t.itemTerkait}</div>
                            )}
                          </div>
                          {templateId === t.id && <Check className="w-4 h-4 text-[#00897b]" />}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Field: Item */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="sm:w-52 text-slate-600 text-base font-normal">
                Item
              </label>
              <div className="relative w-full max-w-md">
                <div
                  onClick={() => setShowItemDropdown(!showItemDropdown)}
                  className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-colors"
                >
                  <span className={selectedItem ? 'font-medium text-slate-800 truncate' : 'text-slate-400'}>
                    {selectedItem || 'Search...'}
                  </span>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {/* Chevron Circle Button */}
                    <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>

                    {/* Clear Button */}
                    {selectedItem && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem('');
                        }}
                        className="text-[#00897b] hover:text-[#00796b] p-0.5 cursor-pointer"
                        title="Hapus Item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Plus Circle Button */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowItemDropdown(true);
                      }}
                      className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center cursor-pointer hover:bg-[#00796b]"
                      title="Pilih Item"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* Item Dropdown */}
                {showItemDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-40 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Cari item..."
                        value={itemSearchQuery}
                        onChange={(e) => setItemSearchQuery(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-[#00897b]"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredItemList.map((it) => (
                        <button
                          key={it.id}
                          type="button"
                          onClick={() => {
                            setSelectedItem(it.title);
                            setShowItemDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                            selectedItem === it.title
                              ? 'bg-teal-50 text-[#00897b] font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{it.title}</span>
                          {selectedItem === it.title && <Check className="w-3.5 h-3.5 text-[#00897b]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Tambah PM Lanjutan & Jeda */}
          <div className="pt-2 space-y-4">
            {pmLanjutanList.map((lanjutan, index) => (
              <div key={lanjutan.id} className="space-y-3">
                {/* Red cross circle with "Tambah PM Lanjutan" header/remove */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemovePmLanjutan(lanjutan.id)}
                    className="flex items-center gap-2 text-red-500 font-semibold text-sm cursor-pointer hover:opacity-80 transition-opacity"
                    title="Hapus PM Lanjutan ini"
                  >
                    <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Tambah PM Lanjutan</span>
                  </button>
                </div>

                {/* Light Blue Card matching exact design in image.png */}
                <div className="bg-[#f0f4f8] rounded-2xl p-6 sm:p-7 space-y-4">
                  {/* Row: Jeda */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="sm:w-52 text-slate-600 text-base font-normal">
                      Jeda
                    </label>
                    <div className="flex items-center gap-3 w-full max-w-md">
                      {/* Jeda Unit Select */}
                      <div className="relative flex-1">
                        <div
                          onClick={() =>
                            setActiveLanjutanJedaDropdown(
                              activeLanjutanJedaDropdown === lanjutan.id ? null : lanjutan.id
                            )
                          }
                          className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b]"
                        >
                          <span className="capitalize text-slate-700">
                            {lanjutan.jedaUnit ? `${lanjutan.jedaUnit}` : 'Search...'}
                          </span>
                          <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center shrink-0 ml-2">
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        </div>

                        {activeLanjutanJedaDropdown === lanjutan.id && (
                          <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 z-40">
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdatePmLanjutan(lanjutan.id, 'jedaUnit', 'hari');
                                setActiveLanjutanJedaDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                                lanjutan.jedaUnit === 'hari'
                                  ? 'bg-teal-50 text-[#00897b]'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              Hari
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdatePmLanjutan(lanjutan.id, 'jedaUnit', 'bulan');
                                setActiveLanjutanJedaDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                                lanjutan.jedaUnit === 'bulan'
                                  ? 'bg-teal-50 text-[#00897b]'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              Bulan
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Jeda Number Input */}
                      <div className="flex-1">
                        <input
                          type="number"
                          min={1}
                          placeholder="Input Jumlah..."
                          value={lanjutan.jedaValue}
                          onChange={(e) =>
                            handleUpdatePmLanjutan(lanjutan.id, 'jedaValue', e.target.value)
                          }
                          className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00897b] shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row: Template PM */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="sm:w-52 text-slate-600 text-base font-normal">
                      Template PM
                    </label>
                    <div className="relative w-full max-w-md">
                      <div
                        onClick={() =>
                          setActiveLanjutanTemplateDropdown(
                            activeLanjutanTemplateDropdown === lanjutan.id ? null : lanjutan.id
                          )
                        }
                        className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b]"
                      >
                        <span
                          className={
                            lanjutan.templateName
                              ? 'font-medium text-slate-800 truncate'
                              : 'text-slate-400'
                          }
                        >
                          {lanjutan.templateName || 'Search...'}
                        </span>
                        <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center shrink-0 ml-2">
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>

                      {activeLanjutanTemplateDropdown === lanjutan.id && (
                        <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200/80 p-2 z-40 max-h-56 overflow-y-auto">
                          <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase">
                            Pilih Template PM
                          </div>
                          {allTemplates.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                handleUpdatePmLanjutan(lanjutan.id, 'templateId', t.id);
                                handleUpdatePmLanjutan(lanjutan.id, 'templateName', t.namaTemplate);
                                if (t.itemTerkait && !lanjutan.itemTitle) {
                                  handleUpdatePmLanjutan(lanjutan.id, 'itemTitle', t.itemTerkait);
                                }
                                setActiveLanjutanTemplateDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                                lanjutan.templateId === t.id
                                  ? 'bg-teal-50 text-[#00897b] font-bold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{t.namaTemplate}</span>
                              {lanjutan.templateId === t.id && (
                                <Check className="w-3.5 h-3.5 text-[#00897b]" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row: Item */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="sm:w-52 text-slate-600 text-base font-normal">
                      Item
                    </label>
                    <div className="relative w-full max-w-md">
                      <div
                        onClick={() =>
                          setActiveLanjutanItemDropdown(
                            activeLanjutanItemDropdown === lanjutan.id ? null : lanjutan.id
                          )
                        }
                        className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b]"
                      >
                        <span
                          className={
                            lanjutan.itemTitle
                              ? 'font-medium text-slate-800 truncate'
                              : 'text-slate-400'
                          }
                        >
                          {lanjutan.itemTitle || 'Search...'}
                        </span>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {/* Chevron Circle Button */}
                          <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center">
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>

                          {/* Clear Button */}
                          {lanjutan.itemTitle && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdatePmLanjutan(lanjutan.id, 'itemTitle', '');
                              }}
                              className="text-[#00897b] hover:text-[#00796b] p-0.5 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          {/* Plus Circle Button */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLanjutanItemDropdown(lanjutan.id);
                            }}
                            className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center cursor-pointer hover:bg-[#00796b]"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        </div>
                      </div>

                      {activeLanjutanItemDropdown === lanjutan.id && (
                        <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200/80 p-2 z-40 max-h-56 overflow-y-auto">
                          <input
                            type="text"
                            placeholder="Cari item..."
                            value={lanjutanItemSearchQuery}
                            onChange={(e) => setLanjutanItemSearchQuery(e.target.value)}
                            className="w-full mb-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            autoFocus
                          />
                          {filteredLanjutanItemList.map((it) => (
                            <button
                              key={it.id}
                              type="button"
                              onClick={() => {
                                handleUpdatePmLanjutan(lanjutan.id, 'itemTitle', it.title);
                                setActiveLanjutanItemDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                                lanjutan.itemTitle === it.title
                                  ? 'bg-teal-50 text-[#00897b] font-bold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="truncate">{it.title}</span>
                              {lanjutan.itemTitle === it.title && (
                                <Check className="w-3.5 h-3.5 text-[#00897b]" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Plus button: "Tambah PM Lanjutan" */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddPmLanjutan}
                className="flex items-center gap-2 text-[#00897b] font-semibold text-sm cursor-pointer hover:text-[#00796b] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Tambah PM Lanjutan</span>
              </button>
            </div>
          </div>

          {/* Bottom Action Buttons: Cancel and Save */}
          <div className="pt-8 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-10 py-2.5 rounded-full border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-12 py-2.5 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white font-medium text-sm transition-colors shadow-xs cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Rutin Tab View (matching image.png) */}
      {activeTab === 'rutin' && (
        <form onSubmit={handleSaveRutinForm} className="space-y-6">
          {/* Kirim Berkala Header */}
          <div
            onClick={() => setKirimBerkalaExpanded(!kirimBerkalaExpanded)}
            className="flex items-center gap-1.5 cursor-pointer select-none"
          >
            <span
              className={`text-[#00897b] text-xs transition-transform duration-150 ${
                kirimBerkalaExpanded ? '' : '-rotate-90'
              }`}
            >
              ▼
            </span>
            <span className="text-[#00897b] font-medium text-base">Kirim Berkala</span>
          </div>

          {/* Kirim Berkala Cards: Left & Right side by side */}
          {kirimBerkalaExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 max-w-4xl">
              {/* Left Card: Radio buttons & Tanggal Berakhir label */}
              <div className="md:col-span-5 bg-[#f0f4f8] rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-2xs">
                {/* Setiap */}
                <label
                  onClick={() => setBerkalaMode('setiap')}
                  className="flex items-center gap-3.5 cursor-pointer select-none text-slate-700 text-base"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      berkalaMode === 'setiap'
                        ? 'border-[#00897b] bg-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {berkalaMode === 'setiap' && (
                      <div className="w-2 h-2 rounded-full bg-[#00897b]" />
                    )}
                  </div>
                  <span>Setiap</span>
                </label>

                {/* Setiap Hari */}
                <label
                  onClick={() => setBerkalaMode('setiap_hari')}
                  className="flex items-center gap-3.5 cursor-pointer select-none text-slate-700 text-base"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      berkalaMode === 'setiap_hari'
                        ? 'border-[#00897b] bg-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {berkalaMode === 'setiap_hari' && (
                      <div className="w-2 h-2 rounded-full bg-[#00897b]" />
                    )}
                  </div>
                  <span>Setiap Hari</span>
                </label>

                {/* Setiap Tanggal */}
                <label
                  onClick={() => setBerkalaMode('setiap_tanggal')}
                  className="flex items-center gap-3.5 cursor-pointer select-none text-slate-700 text-base"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      berkalaMode === 'setiap_tanggal'
                        ? 'border-[#00897b] bg-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {berkalaMode === 'setiap_tanggal' && (
                      <div className="w-2 h-2 rounded-full bg-[#00897b]" />
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
                        setBerkalaMode('setiap');
                        setShowSetiapDropdown(!showSetiapDropdown);
                        setShowSetiapHariDropdown(false);
                        setShowSetiapTanggalDropdown(false);
                        setShowTanggalBerakhirPicker(false);
                      }}
                      className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-all"
                    >
                      <span
                        className={
                          setiapHariValue ? 'text-slate-700 font-medium' : 'text-slate-400'
                        }
                      >
                        {setiapHariValue || 'Search...'}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center shrink-0 ml-2">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {showSetiapDropdown && (
                      <div className="absolute left-0 mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                        <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                          Pilih Durasi Hari
                        </div>
                        {['1', '3', '7', '14', '30'].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              setSetiapHariValue(d);
                              setBerkalaMode('setiap');
                              setShowSetiapDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                          >
                            <span>{d} Hari</span>
                            {setiapHariValue === d && (
                              <Check className="w-3.5 h-3.5 text-[#00897b]" />
                            )}
                          </button>
                        ))}
                        <div className="pt-2 border-t border-slate-100 mt-1 px-2">
                          <input
                            type="number"
                            min="1"
                            placeholder="Kustom (hari)..."
                            value={setiapHariValue}
                            onChange={(e) => {
                              setSetiapHariValue(e.target.value);
                              setBerkalaMode('setiap');
                            }}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
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
                      setBerkalaMode('setiap_hari');
                      setShowSetiapHariDropdown(!showSetiapHariDropdown);
                      setShowSetiapDropdown(false);
                      setShowSetiapTanggalDropdown(false);
                      setShowTanggalBerakhirPicker(false);
                    }}
                    className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-all"
                  >
                    <span
                      className={
                        setiapHariPilihan ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }
                    >
                      {setiapHariPilihan || 'Search...'}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center shrink-0 ml-2">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  {showSetiapHariDropdown && (
                    <div className="absolute left-0 mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                      <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                        Pilih Hari Mingguan
                      </div>
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(
                        (day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setSetiapHariPilihan(day);
                              setBerkalaMode('setiap_hari');
                              setShowSetiapHariDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                          >
                            <span>{day}</span>
                            {setiapHariPilihan === day && (
                              <Check className="w-3.5 h-3.5 text-[#00897b]" />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Row 3: Setiap Tanggal [Pilihan Tanggal] */}
                <div className="relative flex-1 max-w-[240px]">
                  <div
                    onClick={() => {
                      setBerkalaMode('setiap_tanggal');
                      setShowSetiapTanggalDropdown(!showSetiapTanggalDropdown);
                      setShowSetiapDropdown(false);
                      setShowSetiapHariDropdown(false);
                      setShowTanggalBerakhirPicker(false);
                    }}
                    className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-all"
                  >
                    <span
                      className={
                        setiapTanggalPilihan ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }
                    >
                      {setiapTanggalPilihan || 'Search...'}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center shrink-0 ml-2">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  {showSetiapTanggalDropdown && (
                    <div className="absolute left-0 mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
                      <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                        Pilih Tanggal Bulanan
                      </div>
                      {[
                        'Tanggal 1',
                        'Tanggal 5',
                        'Tanggal 10',
                        'Tanggal 15',
                        'Tanggal 20',
                        'Tanggal 25',
                        'Tanggal 30',
                      ].map((tgl) => (
                        <button
                          key={tgl}
                          type="button"
                          onClick={() => {
                            setSetiapTanggalPilihan(tgl);
                            setBerkalaMode('setiap_tanggal');
                            setShowSetiapTanggalDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        >
                          <span>{tgl}</span>
                          {setiapTanggalPilihan === tgl && (
                            <Check className="w-3.5 h-3.5 text-[#00897b]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Row 4: Tanggal Berakhir */}
                <div className="relative w-full max-w-md">
                  <div
                    onClick={() => {
                      setIsRutinRangePickerOpen(true);
                      setShowSetiapDropdown(false);
                      setShowSetiapHariDropdown(false);
                      setShowSetiapTanggalDropdown(false);
                    }}
                    className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-all"
                  >
                    <span
                      className={
                        tanggalBerakhir ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }
                    >
                      {tanggalBerakhir || 'Input Date...'}
                    </span>
                    <div className="shrink-0 ml-2 text-[#00897b]">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>

                  <DateRangePickerPopover
                    isOpen={isRutinRangePickerOpen}
                    onClose={() => setIsRutinRangePickerOpen(false)}
                    startDate={tanggalMulaiDihubungi}
                    endDate={tanggalBerakhir}
                    onSelectRange={(start, end) => {
                      setTanggalMulaiDihubungi(start);
                      setTanggalBerakhir(end || start);
                    }}
                  />

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
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs mb-2"
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
                          className="px-2 py-1.5 text-[11px] bg-slate-50 hover:bg-teal-50 hover:text-[#00897b] rounded-lg text-slate-600 font-medium text-center"
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
                          className="px-2 py-1.5 text-[11px] bg-slate-50 hover:bg-teal-50 hover:text-[#00897b] rounded-lg text-slate-600 font-medium text-center"
                        >
                          +3 Bulan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setFullYear(d.getFullYear() + 1);
                            setTanggalBerakhir(d.toISOString().slice(0, 10));
                            setShowTanggalBerakhirPicker(false);
                          }}
                          className="px-2 py-1.5 text-[11px] bg-slate-50 hover:bg-teal-50 hover:text-[#00897b] rounded-lg text-slate-600 font-medium text-center"
                        >
                          +1 Tahun
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTanggalBerakhir('');
                            setShowTanggalBerakhirPicker(false);
                          }}
                          className="px-2 py-1.5 text-[11px] bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-500 font-medium text-center"
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

          {/* Form Fields matching screenshot below Kirim Berkala:
              1. ID Identitas (Search... (v) (x) (+))
              2. Template (Search... (v))
              3. Dihubungi oleh (Search... (v) (x) (+))
              4. Item (Search... (v) (x) (+))
          */}
          <div className="space-y-4 pt-4 max-w-4xl">
            {/* Tanggal mulai dihubungi */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="w-48 text-slate-600 text-base font-normal mb-1 sm:mb-0">
                Tanggal mulai dihubungi
              </label>
              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Input Date..."
                  value={tanggalMulaiDihubungi}
                  onChange={(e) => setTanggalMulaiDihubungi(e.target.value)}
                  onClick={() => setIsRutinRangePickerOpen(true)}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00897b] pr-12 shadow-2xs transition-all cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setIsRutinRangePickerOpen(!isRutinRangePickerOpen)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00897b] hover:text-[#00796b] cursor-pointer"
                  title="Pilih Tanggal Mulai Dihubungi"
                >
                  <Calendar className="w-5 h-5" />
                </button>

                {/* Date Picker Popover */}
                {showTanggalMulaiPickerRutin && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowTanggalMulaiPickerRutin(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-40">
                      <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        Pilih Tanggal Mulai Dihubungi
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { label: 'Hari Ini', date: formatToIndonesianDate(new Date()) },
                          { label: 'Besok', date: getOffsetDateFormatted(1) },
                          { label: '3 Hari Lagi', date: getOffsetDateFormatted(3) },
                          { label: '7 Hari Lagi', date: getOffsetDateFormatted(7) },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setTanggalMulaiDihubungi(item.date);
                              setShowTanggalMulaiPickerRutin(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                              tanggalMulaiDihubungi === item.date
                                ? 'bg-teal-50 text-[#00897b]'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{item.label} ({item.date})</span>
                            {tanggalMulaiDihubungi === item.date && (
                              <Check className="w-4 h-4 text-[#00897b]" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
                        <input
                          type="date"
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                              setTanggalMulaiDihubungi(formatToIndonesianDate(dateObj));
                              setShowTanggalMulaiPickerRutin(false);
                            }
                          }}
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 1. ID Identitas */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="w-48 text-slate-600 text-base font-normal mb-1 sm:mb-0">
                ID Identitas
              </label>
              <div className="relative max-w-md w-full">
                <div
                  onClick={() => setShowTargetModal(true)}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-all"
                >
                  <span className={targetNama ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    {targetNama
                      ? targetHp && targetHp !== '-'
                        ? `${targetNama} (${targetHp})`
                        : targetNama
                      : 'Search...'}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    {targetNama && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetNama('');
                          setTargetHp('');
                          setTargetId('');
                          setTargetDetail('');
                        }}
                        className="text-[#00897b] hover:text-[#00796b] p-0.5 cursor-pointer"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTargetModal(true);
                      }}
                      className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center cursor-pointer hover:bg-[#00796b]"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Template (only (v) as shown in image.png) */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="w-48 text-slate-600 text-base font-normal mb-1 sm:mb-0">
                Template
              </label>
              <div className="relative max-w-md w-full">
                <div
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-all"
                >
                  <span className={templateName ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    {templateName || 'Search...'}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center shrink-0 ml-2">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>

                {showTemplateDropdown && (
                  <div className="absolute left-0 mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
                    <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                      Pilih Template PM
                    </div>
                    {allTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setTemplateId(tpl.id);
                          setTemplateName(tpl.nama);
                          setShowTemplateDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                      >
                        <span>{tpl.nama}</span>
                        {templateId === tpl.id && <Check className="w-3.5 h-3.5 text-[#00897b]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Dihubungi oleh */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="w-48 text-slate-600 text-base font-normal mb-1 sm:mb-0">
                Dihubungi oleh
              </label>
              <div className="relative max-w-md w-full">
                <div
                  onClick={() => setShowDihubungiModal(true)}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-all"
                >
                  <span className={dihubungiNama ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    {dihubungiNama || 'Search...'}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    {dihubungiNama && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDihubungiNama('');
                          setDihubungiId('');
                        }}
                        className="text-[#00897b] hover:text-[#00796b] p-0.5 cursor-pointer"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDihubungiModal(true);
                      }}
                      className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center cursor-pointer hover:bg-[#00796b]"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Item */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="w-48 text-slate-600 text-base font-normal mb-1 sm:mb-0">
                Item
              </label>
              <div className="relative max-w-md w-full">
                <div
                  onClick={() => setShowItemDropdown(!showItemDropdown)}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#00897b] transition-all"
                >
                  <span className={selectedItem ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    {selectedItem || 'Search...'}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <div className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    {selectedItem && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem('');
                        }}
                        className="text-[#00897b] hover:text-[#00796b] p-0.5 cursor-pointer"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowItemDropdown(!showItemDropdown);
                      }}
                      className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center cursor-pointer hover:bg-[#00796b]"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {showItemDropdown && (
                  <div className="absolute left-0 mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
                    <div className="p-1 mb-1">
                      <input
                        type="text"
                        placeholder="Cari Item..."
                        value={itemSearchQuery}
                        onChange={(e) => setItemSearchQuery(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    {filteredItemList.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => {
                          setSelectedItem(it.title);
                          setShowItemDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                      >
                        <span>{it.title}</span>
                        {selectedItem === it.title && (
                          <Check className="w-3.5 h-3.5 text-[#00897b]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons matching screenshot at bottom right: Cancel & Save */}
          <div className="pt-8 flex items-center justify-end gap-4 max-w-4xl">
            <button
              type="button"
              onClick={onCancel}
              className="px-10 py-2.5 rounded-full border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-12 py-2.5 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white font-medium text-sm transition-colors shadow-xs cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Target Modal: Identitas ID, Organisasi ID, List group funneling */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pilih Target yang Ingin Dihubungi</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan nama dan nomor HP dari Identitas, Organisasi, atau Group Funneling
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Category Tabs */}
            <div className="px-5 pt-3 pb-2 flex items-center gap-2 border-b border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setTargetModalTab('identitas')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  targetModalTab === 'identitas'
                    ? 'bg-[#00897b] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Identitas ID</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetModalTab('organisasi')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  targetModalTab === 'organisasi'
                    ? 'bg-[#00897b] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Organisasi ID</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetModalTab('funneling')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  targetModalTab === 'funneling'
                    ? 'bg-[#00897b] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>List Group Funneling</span>
              </button>
            </div>

            {/* Search input in modal */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Cari dalam ${
                    targetModalTab === 'identitas'
                      ? 'Identitas ID (Nama, No. HP, Kode)...'
                      : targetModalTab === 'organisasi'
                      ? 'Organisasi ID (Nama Org, PIC, No. HP)...'
                      : 'List Group Funneling...'
                  }`}
                  value={targetSearchQuery}
                  onChange={(e) => setTargetSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00897b]"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Body List */}
            <div className="overflow-y-auto p-3 divide-y divide-slate-100 flex-1">
              {targetModalTab === 'identitas' && (
                filteredIdentitas.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Tidak ada Identitas ditemukan.
                  </div>
                ) : (
                  filteredIdentitas.map((it) => (
                    <div
                      key={it.id}
                      onClick={() => handleSelectIdentitas(it)}
                      className="p-3 hover:bg-teal-50/50 rounded-xl cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#00897b] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {it.avatarInitial || it.namaLengkap.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-[#00897b]">
                            {it.namaLengkap}
                            {it.codeId && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-mono">
                                {it.codeId}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{it.nomorHandPhone || 'Tidak ada no. HP'}</span>
                            {it.pic && (
                              <span className="ml-2 text-slate-400">• PIC: {it.pic}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-[#00897b] group-hover:underline">
                          Pilih Target &gt;
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}

              {targetModalTab === 'organisasi' && (
                filteredOrganisasi.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Tidak ada Organisasi ditemukan.
                  </div>
                ) : (
                  filteredOrganisasi.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => handleSelectOrganisasi(org)}
                      className="p-3 hover:bg-teal-50/50 rounded-xl cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#00897b] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {org.avatarInitial || org.namaOrg.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-[#00897b]">
                            {org.namaOrg}
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-normal">
                              {org.jenisOrg}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{org.hp || 'Tidak ada no. HP'}</span>
                            {org.picOrgNama && (
                              <span className="ml-2 text-slate-400">• PIC: {org.picOrgNama}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-[#00897b] group-hover:underline">
                          Pilih Target &gt;
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}

              {targetModalTab === 'funneling' && (
                filteredFunneling.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Tidak ada Group Funneling ditemukan.
                  </div>
                ) : (
                  filteredFunneling.map((fg) => (
                    <div
                      key={fg.id}
                      onClick={() => handleSelectFunneling(fg)}
                      className="p-3 hover:bg-teal-50/50 rounded-xl cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2295d8] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-[#00897b]">
                            {fg.name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>{fg.countLabel || `${fg.count} orang terdaftar`}</span>
                            {fg.jenisGroup && (
                              <span className="ml-2 text-slate-400">• {fg.jenisGroup}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-[#00897b] group-hover:underline">
                          Pilih Group &gt;
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dihubungi Oleh Modal: Call Center, PIC YPPLN, or ID Karyawan tertentu */}
      {showDihubungiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pilih Siapa yang Menghubungi</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Call Center, PIC YPPLN (sesuai target), atau Karyawan tertentu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDihubungiModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Option 1: Call Center */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  1. Layanan Call Center
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDihubungiType('call_center');
                    setDihubungiNama('Call Center SAPA (+62 812-3456-7898)');
                    setDihubungiId('cc-1');
                    setShowDihubungiModal(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                    dihubungiType === 'call_center'
                      ? 'border-[#00897b] bg-teal-50/60 text-[#00897b]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#00897b] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      CC
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Call Center SAPA</div>
                      <div className="text-[11px] text-slate-500">+62 812-3456-7898 (Official CS)</div>
                    </div>
                  </div>
                  {dihubungiType === 'call_center' && <Check className="w-4 h-4 text-[#00897b]" />}
                </button>
              </div>

              {/* Option 2: PIC YPPLN */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  2. PIC YPPLN (Sesuai ID Identitas / Organisasi)
                </div>
                <div className="space-y-2">
                  {targetDetail.includes('PIC:') ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDihubungiType('pic_yppln');
                        setDihubungiNama(targetDetail.replace('PIC: ', 'PIC YPPLN: '));
                        setShowDihubungiModal(false);
                      }}
                      className="w-full p-3 rounded-2xl border border-teal-200 bg-teal-50/40 text-left flex items-center justify-between cursor-pointer hover:bg-teal-50"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {targetDetail.replace('PIC: ', 'PIC YPPLN Target: ')}
                        </div>
                        <div className="text-[11px] text-[#00897b]">Sesuai data target yang dipilih</div>
                      </div>
                      <span className="text-xs font-bold text-[#00897b]">Pilih &gt;</span>
                    </button>
                  ) : null}

                  {/* General PIC YPPLN options */}
                  <button
                    type="button"
                    onClick={() => {
                      setDihubungiType('pic_yppln');
                      setDihubungiNama('PIC YPPLN: Bhadra Ksanti (00800)');
                      setShowDihubungiModal(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                      dihubungiNama.includes('Bhadra Ksanti')
                        ? 'border-[#00897b] bg-teal-50/60 text-[#00897b]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-800">
                      PIC YPPLN: Bhadra Ksanti (00800)
                    </span>
                    {dihubungiNama.includes('Bhadra Ksanti') && (
                      <Check className="w-3.5 h-3.5 text-[#00897b]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDihubungiType('pic_yppln');
                      setDihubungiNama('PIC YPPLN: Cindy Budiman (00019)');
                      setShowDihubungiModal(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                      dihubungiNama.includes('Cindy Budiman')
                        ? 'border-[#00897b] bg-teal-50/60 text-[#00897b]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-800">
                      PIC YPPLN: Cindy Budiman (00019)
                    </span>
                    {dihubungiNama.includes('Cindy Budiman') && (
                      <Check className="w-3.5 h-3.5 text-[#00897b]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Option 3: ID Karyawan tertentu */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  3. ID Karyawan Tertentu
                </div>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari karyawan..."
                    value={karyawanSearchQuery}
                    onChange={(e) => setKaryawanSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-[#00897b]"
                  />
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {filteredKaryawan.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => {
                        setDihubungiType('karyawan');
                        setDihubungiId(k.id);
                        setDihubungiNama(`${k.kodeKaryawan} ${k.namaLengkap}`);
                        setShowDihubungiModal(false);
                      }}
                      className={`w-full p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                        dihubungiId === k.id
                          ? 'border-[#00897b] bg-teal-50/60 text-[#00897b]'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-mono">
                          {k.kodeKaryawan}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{k.namaLengkap}</span>
                        <span className="text-[10px] text-slate-400">({k.divisi})</span>
                      </div>
                      {dihubungiId === k.id && <Check className="w-3.5 h-3.5 text-[#00897b]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
