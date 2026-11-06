import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TableToolbar } from './components/TableToolbar';
import { ProjectTable } from './components/ProjectTable';
import { FormProyekSapa } from './components/FormProyekSapa';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { JenisProyekTable } from './components/JenisProyekTable';
import { AddJenisProyekModal } from './components/AddJenisProyekModal';
import { ReportProyek } from './components/ReportProyek';
import { HomeView } from './components/HomeView';
import { Sidebar } from './components/Sidebar';
import { TransaksiSalurDashboard } from './components/TransaksiSalurDashboard';
import { PosKasirTransaksiSalur } from './components/PosKasirTransaksiSalur';
import { FormTransaksiSalur } from './components/FormTransaksiSalur';
import { FormTransaksiSalurHadiah } from './components/FormTransaksiSalurHadiah';
import { ItemSalurView } from './components/ItemSalurView';
import { OngoingCreateItemSalurView } from './components/OngoingCreateItemSalurView';
import { ModalItemSalurView } from './components/ModalItemSalurView';
import { StokItemSalurView } from './components/StokItemSalurView';
import { LokasiStokItemSalurView } from './components/LokasiStokItemSalurView';
import { StockInOutSalurView } from './components/StockInOutSalurView';
import { FormStockInOutSalurView } from './components/FormStockInOutSalurView';
import { NamaPercetakanStockSalurView } from './components/NamaPercetakanStockSalurView';
import {
  syncStockInOutFromSalurOrder,
  getStoredStokSalurItems,
  saveStoredStokSalurItems,
  StokSalurItem,
  isMatchingSalurItem,
} from './stokSalurData';
import { JenisPerubahanStockSalurView } from './components/JenisPerubahanStockSalurView';
import { FormItemSalur } from './components/FormItemSalur';
import { IdentitasDashboard } from './components/IdentitasDashboard';
import { FormIdentitas } from './components/FormIdentitas';
import { EditIdentitasView } from './components/EditIdentitasView';
import { MergeDuplicatesView } from './components/MergeDuplicatesView';
import { OrganisasiDashboard } from './components/OrganisasiDashboard';
import { FormOrganisasi } from './components/FormOrganisasi';
import { JenisPanggilanTable } from './components/JenisPanggilanTable';
import { TriyanaTable } from './components/TriyanaTable';
import { PekerjaanTable } from './components/PekerjaanTable';
import { MengenalYpplnTable } from './components/MengenalYpplnTable';
import { DivisiTable } from './components/DivisiTable';
import {
  DivisiItem,
  getDivisiFromStorage,
  saveDivisiToStorage,
} from './divisiData';
import { AddJenisPanggilanModal } from './components/AddJenisPanggilanModal';
import { AddMasterItemModal } from './components/AddMasterItemModal';
import { JenisItemSalurTable } from './components/JenisItemSalurTable';
import { SubJenisItemSalurTable } from './components/SubJenisItemSalurTable';
import { KategoriItemSalurTable } from './components/KategoriItemSalurTable';
import { JenisKategoriItemSalurTable } from './components/JenisKategoriItemSalurTable';
import { AddEditJenisItemSalurModal } from './components/AddEditJenisItemSalurModal';
import { AddEditSubJenisItemSalurModal } from './components/AddEditSubJenisItemSalurModal';
import { AddEditKategoriItemSalurModal } from './components/AddEditKategoriItemSalurModal';
import { AddEditJenisKategoriItemSalurModal } from './components/AddEditJenisKategoriItemSalurModal';
import { MutasiTable } from './components/MutasiTable';
import { AddEditMutasiModal } from './components/AddEditMutasiModal';
import { RekeningDashboard } from './components/RekeningDashboard';
import { AddEditRekeningModal } from './components/AddEditRekeningModal';
import { PosKeuanganTable } from './components/PosKeuanganTable';
import { AddEditPosKeuanganModal } from './components/AddEditPosKeuanganModal';
import {
  PosKeuanganItem,
  PosKeuanganCardLogoConfig,
  getPosKeuanganFromStorage,
  savePosKeuanganToStorage,
  getPosKeuanganCardLogoFromStorage,
  savePosKeuanganCardLogoToStorage,
} from './posKeuanganData';
import { reconcilePosKeuanganList } from './posKeuanganReconciliation';
import { PosPemasukanTable } from './components/PosPemasukanTable';
import { AddEditPosPemasukanModal } from './components/AddEditPosPemasukanModal';
import {
  PosPemasukanGroup,
  PosPemasukanCardLogoConfig,
  getPosPemasukanFromStorage,
  savePosPemasukanToStorage,
  getPosPemasukanCardLogoFromStorage,
  savePosPemasukanCardLogoToStorage,
} from './posPemasukanData';
import { PosPemasukanSubJenisTable } from './components/PosPemasukanSubJenisTable';
import { AddEditPosPemasukanSubJenisModal } from './components/AddEditPosPemasukanSubJenisModal';
import {
  PosPemasukanSubJenisMapping,
  getPosPemasukanSubJenisFromStorage,
  savePosPemasukanSubJenisToStorage,
} from './posPemasukanSubJenisData';
import { PengeluaranTable } from './components/PengeluaranTable';
import { AddEditPengeluaranModal } from './components/AddEditPengeluaranModal';
import { PosPengeluaranTable } from './components/PosPengeluaranTable';
import { AddEditPosPengeluaranModal } from './components/AddEditPosPengeluaranModal';
import {
  PosPengeluaranGroup,
  PosPengeluaranCardLogoConfig,
  getPosPengeluaranFromStorage,
  savePosPengeluaranToStorage,
  getPosPengeluaranCardLogoFromStorage,
  savePosPengeluaranCardLogoToStorage,
} from './posPengeluaranData';
import { KelompokBiayaCoaTable } from './components/KelompokBiayaCoaTable';
import {
  KelompokBiayaCoaItem,
  getKelompokBiayaCoaFromStorage,
  saveKelompokBiayaCoaToStorage,
} from './kelompokBiayaCoaData';
import { KebutuhanPengeluaranTable } from './components/KebutuhanPengeluaranTable';
import {
  KebutuhanPengeluaranItem,
  getKebutuhanPengeluaranFromStorage,
  saveKebutuhanPengeluaranToStorage,
} from './kebutuhanPengeluaranData';
import {
  autoCreateCoaForKebutuhan,
  autoDeleteCoaForKebutuhan,
  relinkKebutuhanCoaOnKelompokChange,
  syncAllKebutuhanPengeluaranWithCoa,
} from './kebutuhanPengeluaranCoaHelper';
import { FormPengeluaranView } from './components/FormPengeluaranView';
import { KumpulanRekeningTable } from './components/KumpulanRekeningTable';
import { AddEditKumpulanRekeningModal } from './components/AddEditKumpulanRekeningModal';
import {
  KumpulanRekeningItem,
  getKumpulanRekeningFromStorage,
  saveKumpulanRekeningToStorage,
} from './kumpulanRekeningData';
import { LaporanKeuanganView } from './components/LaporanKeuanganView';
import { CoaManagementView } from './components/CoaManagementView';
import { CoaAccount, loadCoaList, saveCoaList } from './accountingData';
import {
  syncAllSalurItemsWithCoa,
  autoCreateCoaForSalurItem,
  autoDeleteCoaForSalurItem,
  isNonBukuItemSalur,
} from './salurCoaHelper';
import {
  syncAllJenisProyekWithCoa,
  autoCreateCoaForJenisProyek,
  autoDeleteCoaForJenisProyek,
} from './jenisProyekCoaHelper';
import { RincianMutasiView } from './components/RincianMutasiView';
import {
  getPengeluaranFromStorage,
  savePengeluaranToStorage,
} from './pengeluaranData';
import { PengeluaranItem } from './types';
import { DharmaPatronRutinTable } from './components/DharmaPatronRutinTable';
import { AddEditDharmaPatronModal } from './components/AddEditDharmaPatronModal';
import { FormListDharmaPatronRutin } from './components/FormListDharmaPatronRutin';
import {
  getDharmaPatronFromStorage,
  saveDharmaPatronToStorage,
} from './dharmaPatronRutinData';
import {
  DharmaPatronRutinItem,
  JenisPerubahanDharmaPatronItem,
  VolunteerSSebarItem,
  VolunteerAJarItem,
  JobAdvanceMasterItem,
  StatusJobAdvanceMasterItem,
  ListPMItem,
  TemplatePMItem,
  KaryawanItem,
  KontenPromosiItem,
} from './types';
import { KontenPromosiView } from './components/KontenPromosiView';
import {
  getKontenPromosiFromStorage,
  saveKontenPromosiToStorage,
} from './kontenPromosiData';
import { TemplatePMView } from './components/TemplatePMView';
import { FormTemplatePM } from './components/FormTemplatePM';
import { TemplateTandaTerimaDonasiView } from './components/TemplateTandaTerimaDonasiView';
import { TimelinePMView } from './components/TimelinePMView';
import {
  loadTemplatePM,
  saveTemplatePM,
} from './templatePMData';
import { KaryawanView } from './components/KaryawanView';
import {
  loadKaryawan,
  saveKaryawan,
  INITIAL_KARYAWAN,
} from './karyawanData';
import { FormCutiKaryawanView } from './components/FormCutiKaryawanView';
import { RekapAbsensiKaryawanView } from './components/RekapAbsensiKaryawanView';
import {
  CutiKaryawanItem,
  CutiStatus,
  loadCutiKaryawanList,
  saveCutiKaryawanList,
} from './cutiKaryawanData';
import { ListAccountView } from './components/ListAccountView';
import { FormListAccount } from './components/FormListAccount';
import {
  AccountItem,
  loadAccountList,
  saveAccountList,
} from './accountData';
import { QuickReplyView } from './components/QuickReplyView';
import { FormQuickReply } from './components/FormQuickReply';
import {
  QuickReplyItem,
  loadQuickReplyList,
  saveQuickReplyList,
} from './quickReplyData';
import { ListFaqView } from './components/ListFaqView';
import { TentangListFaqView } from './components/TentangListFaqView';
import { FormListFaq } from './components/FormListFaq';
import {
  FaqItem,
  TentangFaqItem,
  loadFaqList,
  saveFaqList,
  loadTentangFaqList,
  saveTentangFaqList,
} from './faqData';
import { JenisPerubahanDharmaPatronTable } from './components/JenisPerubahanDharmaPatronTable';
import { ListDatabaseAAjakAllView } from './components/ListDatabaseAAjakAllView';
import { ListDatabaseAAjakItemSSebarView } from './components/ListDatabaseAAjakItemSSebarView';
import { FormListDatabaseAAjakItemSSebar } from './components/FormListDatabaseAAjakItemSSebar';
import { JobAdvanceFormListDatabaseAAjakItemSSebarTable } from './components/JobAdvanceFormListDatabaseAAjakItemSSebarTable';
import { StatusJobAdvanceFormListDatabaseAAjakItemSSebarTable } from './components/StatusJobAdvanceFormListDatabaseAAjakItemSSebarTable';
import { ListPMView } from './components/ListPMView';
import { RincianListPMView } from './components/RincianListPMView';
import { PipelineListPMView } from './components/PipelineListPMView';
import { AutoInputListPMSalurView } from './components/AutoInputListPMSalurView';
import { FormListPM, FormListPMInitialTarget } from './components/FormListPM';
import {
  loadAutoInputSalurRules,
  executeAutoInputSalurRules,
  loadAutoInputSalurLogs,
  saveAutoInputSalurLogs,
  mergeListPMItemsByProyekSapa,
  consolidateListPMByProyekSapa,
} from './autoInputSalurRulesData';
import { ListGroupFunnelingView } from './components/ListGroupFunnelingView';
import { ListNamaGroupFunnelingView } from './components/ListNamaGroupFunnelingView';
import { FormListGroupFunneling } from './components/FormListGroupFunneling';
import { JenisGroupFunnelingTable } from './components/JenisGroupFunnelingTable';
import { AddEditJenisGroupFunnelingModal } from './components/AddEditJenisGroupFunnelingModal';
import { ModalTambahKeGroupFunnelingExisting, TargetMemberItem } from './components/ModalTambahKeGroupFunnelingExisting';
import {
  loadJenisGroupFunneling,
  saveJenisGroupFunneling,
  JenisGroupFunnelingItem,
} from './funnelingData';
import {
  loadVolunteerSSebar,
  saveVolunteerSSebar,
} from './volunteerSSebarData';
import { ListDatabaseAAjakAJarView } from './components/ListDatabaseAAjakAJarView';
import {
  loadVolunteerAJar,
  saveVolunteerAJar,
} from './volunteerAJarData';
import {
  loadJobAdvanceMaster,
  saveJobAdvanceMaster,
  loadStatusJobAdvanceMaster,
  saveStatusJobAdvanceMaster,
} from './jobAdvanceMasterData';
import {
  loadListPM,
  saveListPM,
} from './listPMData';
import {
  loadJenisPerubahanDPR,
  saveJenisPerubahanDPR,
} from './jenisPerubahanDharmaPatronData';
import { TransaksiDonasiDashboard } from './components/TransaksiDonasiDashboard';
import { ReportNamaPelimpahanJasaDonasiView } from './components/ReportNamaPelimpahanJasaDonasiView';
import { ListPromoSalurDashboard } from './components/ListPromoSalurDashboard';
import { FormListPromoSalur } from './components/FormListPromoSalur';
import { ResiDashboard } from './components/ResiDashboard';
import { AgenResiDashboard } from './components/AgenResiDashboard';
import { loadAgenResiItems, saveAgenResiItems, AgenResiItem } from './agenResiData';
import { ReportCustomerSalurDashboard } from './components/ReportCustomerSalurDashboard';
import { ReportBepItemSalurView } from './components/ReportBepItemSalurView';
import { loadPromoSalur, savePromoSalur, PromoSalurItem } from './promoSalurData';
import { FormTransaksiDonasi } from './components/FormTransaksiDonasi';
import { ViaTransaksiSalurTable } from './components/ViaTransaksiSalurTable';
import { JenisViaTransaksiSalurTable } from './components/JenisViaTransaksiSalurTable';
import { AddEditViaTransaksiSalurModal } from './components/AddEditViaTransaksiSalurModal';
import { AddEditJenisViaTransaksiSalurModal } from './components/AddEditJenisViaTransaksiSalurModal';
import { ViaTransaksiDonasiTable } from './components/ViaTransaksiDonasiTable';
import { JenisViaTransaksiDonasiTable } from './components/JenisViaTransaksiDonasiTable';
import { AddEditViaTransaksiDonasiModal } from './components/AddEditViaTransaksiDonasiModal';
import { AddEditJenisViaTransaksiDonasiModal } from './components/AddEditJenisViaTransaksiDonasiModal';
import { ViaTransaksiAjarTable } from './components/ViaTransaksiAjarTable';
import { JenisViaTransaksiAjarTable } from './components/JenisViaTransaksiAjarTable';
import { AddEditViaTransaksiAjarModal } from './components/AddEditViaTransaksiAjarModal';
import { AddEditJenisViaTransaksiAjarModal } from './components/AddEditJenisViaTransaksiAjarModal';
import {
  ViaTransaksiAjarItem,
  JenisViaAjarItem,
  getViaAjarFromStorage,
  saveViaAjarToStorage,
  getJenisViaAjarFromStorage,
  saveJenisViaAjarToStorage,
} from './viaAjarData';
import { ItemDonasiView } from './components/ItemDonasiView';
import { ItemAjarView } from './components/ItemAjarView';
import { TransaksiAjarDashboard } from './components/TransaksiAjarDashboard';
import { FormTransaksiAjar } from './components/FormTransaksiAjar';
import {
  TransaksiAjarItem,
  INITIAL_TRANSAKSI_AJAR_LIST,
} from './transaksiAjarData';
import { FormItemAjar } from './components/FormItemAjar';
import { ItemAjarEvent, INITIAL_ITEM_AJAR_EVENTS } from './itemAjarData';
import { SubJenisItemAjarTable } from './components/SubJenisItemAjarTable';
import { AddEditSubJenisItemAjarModal } from './components/AddEditSubJenisItemAjarModal';
import {
  SubJenisItemAjarItem,
  getSubJenisAjarFromStorage,
  saveSubJenisAjarToStorage,
} from './subJenisAjarData';
import { JenisAcaraItemAjarTable } from './components/JenisAcaraItemAjarTable';
import { AddEditJenisAcaraAjarModal } from './components/AddEditJenisAcaraAjarModal';
import {
  JenisAcaraItemAjarItem,
  getJenisAcaraAjarFromStorage,
  saveJenisAcaraAjarToStorage,
} from './jenisAcaraAjarData';
import { PengisiAcaraItemAjarTable } from './components/PengisiAcaraItemAjarTable';
import { AddEditPengisiAcaraAjarModal } from './components/AddEditPengisiAcaraAjarModal';
import {
  PengisiAcaraItemAjarItem,
  getPengisiAcaraAjarFromStorage,
  savePengisiAcaraAjarToStorage,
} from './pengisiAcaraAjarData';
import { FormItemDonasi } from './components/FormItemDonasi';
import { SubJenisItemDonasiTable } from './components/SubJenisItemDonasiTable';
import { AddEditSubJenisItemDonasiModal } from './components/AddEditSubJenisItemDonasiModal';
import {
  ItemDonasiEvent,
  ItemDonasiChild,
  INITIAL_ITEM_DONASI_EVENTS,
} from './itemDonasiData';
import { AlokasiDonasiSalurView } from './components/AlokasiDonasiSalurView';
import {
  SubJenisItemDonasiItem,
  getSubJenisDonasiFromStorage,
  saveSubJenisDonasiToStorage,
} from './subJenisDonasiData';
import {
  INITIAL_VIA_TRANSAKSI_DONASI,
  INITIAL_JENIS_VIA_DONASI,
  ViaTransaksiDonasiItem,
  JenisViaDonasiItem,
} from './viaDonasiData';
import { calculateAllDivisionRevenues } from './utils/divisionRevenue';
import { FormTodoList } from './components/FormTodoList';
import { TodoListDashboard } from './components/TodoListDashboard';
import { CalendarTodoList } from './components/CalendarTodoList';
import { HariKhususCalendarTodoListView } from './components/HariKhususCalendarTodoListView';
import { JenisNonProyekTodoListTable } from './components/JenisNonProyekTodoListTable';
import {
  HariKhususItem,
  loadHariKhususList,
  saveHariKhususList,
} from './hariKhususData';
import {
  getJenisNonProyekFromStorage,
  saveJenisNonProyekToStorage,
} from './jenisNonProyekData';
import { ProyekSapaTimelineView } from './components/ProyekSapaTimelineView';
import {
  getAllProjectTodos,
  getTodosForProject,
  saveTodosForProject,
} from './todoListData';
import {
  getPapanTrelloCardsFromStorage,
  savePapanTrelloCardsToStorage,
} from './papanTrelloData';
import { checkAndGenerateNextRutinTasks } from './utils/todoRutinGenerator';
import { TodoTaskItem } from './types';
import { INITIAL_DONASI_ORDERS, DonasiOrder } from './donasiData';
import {
  ProjectItem,
  ColumnVisibility,
  JenisProyekItem,
  JenisNonProyekItem,
  AppView,
  JenisPanggilanItem,
  TriyanaItem,
  PekerjaanItem,
  MengenalYpplnItem,
  IdentitasChangeLog,
  DuplicatePair,
  OrganisasiItem,
  JenisItemSalurItem,
  SubJenisItemSalurItem,
  JenisKategoriItemSalurItem,
  KategoriItemSalurItem,
  MutasiItem,
  RekeningItem,
  ViaTransaksiSalurItem,
  JenisViaSalurItem,
  ComplaintItem,
} from './types';
import { ComplaintView } from './components/ComplaintView';
import { FormComplaint } from './components/FormComplaint';
import { getComplaintsFromStorage, saveComplaintsToStorage } from './complaintData';
import { INITIAL_PROJECTS, INITIAL_JENIS_PROYEK } from './data';
import {
  INITIAL_SALUR_ORDERS,
  SalurOrder,
  INITIAL_BOOKS,
  CROSS_SELLING_BOOKS,
  ALL_DEFAULT_SALUR_ITEMS,
  SalurProduct,
  generateSalurOrderNumber,
} from './salurData';
import {
  generateKodeTransaksi,
  getUrutanTransaksiPerTahun,
  normalizeVia,
} from './utils/kodeTransaksiHelper';
import {
  INITIAL_JENIS_ITEM_SALUR,
  INITIAL_SUB_JENIS_ITEM_SALUR,
  INITIAL_JENIS_KATEGORI_ITEM_SALUR,
  INITIAL_KATEGORI_ITEM_SALUR,
} from './salurMasterData';
import {
  INITIAL_VIA_TRANSAKSI_SALUR,
  INITIAL_JENIS_VIA_SALUR,
} from './viaSalurData';
import { INITIAL_ORGANISASI } from './organisasiData';
import { INITIAL_MUTASI_ITEMS } from './mutasiData';
import { INITIAL_REKENING_ITEMS } from './rekeningData';
import {
  INITIAL_IDENTITAS,
  IdentitasItem,
  INITIAL_CHANGE_LOGS,
} from './identitasData';
import {
  findDuplicatePairs,
  getDuplicateRecordsCount,
} from './utils/duplicateDetector';
import {
  INITIAL_JENIS_PANGGILAN,
  INITIAL_TRIYANA,
  INITIAL_PEKERJAAN,
  INITIAL_MENGENAL_YPPLN,
} from './masterIdentitasData';

const STORAGE_KEY = 'proyek_sapa_data_v1';
const JENIS_PROYEK_STORAGE_KEY = 'proyek_sapa_jenis_proyek_v1';
const SALUR_ORDERS_STORAGE_KEY = 'transaksi_salur_orders_v1';
const IDENTITAS_STORAGE_KEY = 'identitas_data_v1';
const ORGANISASI_STORAGE_KEY = 'organisasi_data_v1';
const JENIS_PANGGILAN_STORAGE_KEY = 'master_jenis_panggilan_v1';
const TRIYANA_STORAGE_KEY = 'master_triyana_v1';
const PEKERJAAN_STORAGE_KEY = 'master_pekerjaan_v1';
const MENGENAL_YPPLN_STORAGE_KEY = 'master_mengenal_yppln_v1';
const IDENTITAS_CHANGE_LOGS_STORAGE_KEY = 'identitas_change_logs_v1';
const DISMISSED_DUPLICATES_STORAGE_KEY = 'dismissed_duplicate_pairs_v1';
const SALUR_ITEMS_STORAGE_KEY = 'salur_items_data_v1';
const JENIS_ITEM_SALUR_STORAGE_KEY = 'master_jenis_item_salur_v1';
const SUB_JENIS_ITEM_SALUR_STORAGE_KEY = 'master_sub_jenis_item_salur_v1';
const JENIS_KATEGORI_SALUR_STORAGE_KEY = 'master_jenis_kategori_salur_v1';
const KATEGORI_ITEM_SALUR_STORAGE_KEY = 'master_kategori_item_salur_v1';
const MUTASI_STORAGE_KEY = 'mutasi_items_data_v1';
const REKENING_STORAGE_KEY = 'proyek_sapa_rekening_list_v1';
const DONASI_ORDERS_STORAGE_KEY = 'transaksi_donasi_orders_v1';
const VIA_TRANSAKSI_SALUR_STORAGE_KEY = 'master_via_transaksi_salur_v1';
const JENIS_VIA_SALUR_STORAGE_KEY = 'master_jenis_via_salur_v1';
const VIA_TRANSAKSI_DONASI_STORAGE_KEY = 'master_via_transaksi_donasi_v1';
const JENIS_VIA_DONASI_STORAGE_KEY = 'master_jenis_via_donasi_v1';

export default function App() {
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load projects from localStorage', e);
    }
    return INITIAL_PROJECTS;
  });

  const [jenisProyekList, setJenisProyekList] = useState<JenisProyekItem[]>(() => {
    try {
      const saved = localStorage.getItem(JENIS_PROYEK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const initialMap = new Map(INITIAL_JENIS_PROYEK.map((jp) => [jp.id, jp]));
          return parsed.map((item: any) => {
            const initial =
              initialMap.get(item.id) ||
              INITIAL_JENIS_PROYEK.find(
                (ijp) => ijp.jenisKegiatan.toLowerCase() === (item.jenisKegiatan || '').toLowerCase()
              );
            let resolvedCode = item.coaCode;
            let resolvedName = item.coaName;
            if (resolvedCode === '10100 - 10299' || (!resolvedCode && (item.isCoa || initial?.isCoa))) {
              resolvedCode = initial?.coaCode || resolvedCode;
              resolvedName = initial?.coaName || resolvedName;
            }
            return {
              ...item,
              isCoa: item.isCoa !== undefined ? item.isCoa : initial?.isCoa,
              coaCode: resolvedCode || initial?.coaCode,
              coaName: resolvedName || initial?.coaName,
              templateTodoList:
                item.templateTodoList && item.templateTodoList.length > 0
                  ? item.templateTodoList
                  : initial?.templateTodoList || [],
            };
          });
        }
      }
    } catch (e) {
      console.error('Failed to load jenis proyek from localStorage', e);
    }
    return INITIAL_JENIS_PROYEK;
  });

  const [salurOrders, setSalurOrders] = useState<SalurOrder[]>(() => {
    try {
      const saved = localStorage.getItem(SALUR_ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const initialMap = new Map(INITIAL_SALUR_ORDERS.map((o) => [o.id, o]));
          const existingIds = new Set(parsed.map((o: any) => o.id));
          const missingInitials = INITIAL_SALUR_ORDERS.filter((o) => !existingIds.has(o.id));
          const combined = [...parsed, ...missingInitials];

          const mapped = combined.map((ord: SalurOrder) => {
            const init = initialMap.get(ord.id);
            let badgeDate = ord.alamat?.badgeDate;
            if (ord.printStatusBadge?.text === 'Belum diprint') {
              badgeDate = undefined;
            } else if ((ord.id === 'order-1' || ord.id === 'order-2') && badgeDate === '14 Nov 2021') {
              badgeDate = undefined;
            }

            const isNonZero = (str?: string) => {
              if (!str || !str.trim()) return false;
              const digits = str.replace(/\D/g, '');
              return digits !== '' && Number(digits) > 0;
            };
            const rawCb = ord.costBreakdown || init?.costBreakdown;
            const cleanedCostBreakdown = rawCb
              ? {
                  ongkir: isNonZero(rawCb.ongkir) ? rawCb.ongkir : undefined,
                  donasi: isNonZero(rawCb.donasi) ? rawCb.donasi : undefined,
                  kodeUnik: isNonZero(rawCb.kodeUnik) ? rawCb.kodeUnik : undefined,
                }
              : undefined;

            if (init) {
              return {
                ...ord,
                costBreakdown: cleanedCostBreakdown,
                items: ord.id === 'order-3' && ord.items.length < 3 ? init.items : ord.items,
                alamat: {
                  ...ord.alamat,
                  badgeDate,
                },
              };
            }
            return {
              ...ord,
              costBreakdown: cleanedCostBreakdown,
              alamat: {
                ...ord.alamat,
                badgeDate,
              },
            };
          });

          return mapped;
        }
      }

    } catch (e) {
      console.error('Failed to load salur orders from localStorage', e);
    }
    return INITIAL_SALUR_ORDERS;
  });

  const [salurItems, setSalurItems] = useState<SalurProduct[]>(() => {
    try {
      const saved = localStorage.getItem(SALUR_ITEMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const initialMap = new Map(ALL_DEFAULT_SALUR_ITEMS.map((b) => [b.id, b]));
          const mapped = parsed.map((item: SalurProduct) => {
            const initial = initialMap.get(item.id);
            const baseItem: SalurProduct = initial
              ? {
                  ...initial,
                  ...item,
                  detailedInfo: item.detailedInfo || initial.detailedInfo,
                  categories: item.categories || initial.categories,
                  subtitle: item.subtitle || initial.subtitle,
                  author: item.author || initial.author,
                  publisher: item.publisher || initial.publisher,
                  printedCount: item.printedCount || initial.printedCount,
                  pageCount: item.pageCount || initial.pageCount,
                  coverType: item.coverType || initial.coverType,
                }
              : item;

            // Map non-book items to COA 49999 Pendapatan Lain-Lain
            if (isNonBukuItemSalur(baseItem)) {
              return {
                ...baseItem,
                coaNoAkun: '49999',
                coaNamaAkun: 'Pendapatan Lain-Lain',
              };
            }
            return baseItem;
          });
          const existingIds = new Set(mapped.map((p: SalurProduct) => p.id));
          const existingTitles = new Set(
            mapped.map((p: SalurProduct) => (p.title || '').toLowerCase().replace(/[\u2018\u2019`']/g, "'").trim())
          );
          for (const def of ALL_DEFAULT_SALUR_ITEMS) {
            const normDef = (def.title || '').toLowerCase().replace(/[\u2018\u2019`']/g, "'").trim();
            if (!existingIds.has(def.id) && !existingTitles.has(normDef)) {
              mapped.push(def);
            }
          }
          return mapped;
        }
      }
    } catch (e) {
      console.error('Failed to load salur items from localStorage', e);
    }
    return ALL_DEFAULT_SALUR_ITEMS;
  });

  const [identitasList, setIdentitasList] = useState<IdentitasItem[]>(() => {
    try {
      const saved = localStorage.getItem(IDENTITAS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seenIds = new Set<string>();
          const seenCodes = new Set<string>();
          const deduped: IdentitasItem[] = [];

          parsed.forEach((it: IdentitasItem) => {
            if (it && it.id && !seenIds.has(it.id)) {
              seenIds.add(it.id);
              if (it.codeId) seenCodes.add(it.codeId);
              deduped.push(it);
            }
          });

          INITIAL_IDENTITAS.forEach((it) => {
            if (!seenIds.has(it.id) && (!it.codeId || !seenCodes.has(it.codeId))) {
              seenIds.add(it.id);
              if (it.codeId) seenCodes.add(it.codeId);
              deduped.push(it);
            }
          });

          return deduped;
        }
      }
    } catch (e) {
      console.error('Failed to load identitas from localStorage', e);
    }
    return INITIAL_IDENTITAS;
  });

  const [organisasiList, setOrganisasiList] = useState<OrganisasiItem[]>(() => {
    try {
      const saved = localStorage.getItem(ORGANISASI_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((it: OrganisasiItem) => it.id));
          const missing = INITIAL_ORGANISASI.filter((it) => !existingIds.has(it.id));
          return [...parsed, ...missing];
        }
      }
    } catch (e) {
      console.error('Failed to load organisasi from localStorage', e);
    }
    return INITIAL_ORGANISASI;
  });

  const [editingOrganisasi, setEditingOrganisasi] = useState<OrganisasiItem | null>(null);

  const [jenisPanggilanList, setJenisPanggilanList] = useState<JenisPanggilanItem[]>(() => {
    try {
      const saved = localStorage.getItem(JENIS_PANGGILAN_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load jenis panggilan from localStorage', e);
    }
    return INITIAL_JENIS_PANGGILAN;
  });

  const [triyanaList, setTriyanaList] = useState<TriyanaItem[]>(() => {
    try {
      const saved = localStorage.getItem(TRIYANA_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load triyana from localStorage', e);
    }
    return INITIAL_TRIYANA;
  });

  const [pekerjaanList, setPekerjaanList] = useState<PekerjaanItem[]>(() => {
    try {
      const saved = localStorage.getItem(PEKERJAAN_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load pekerjaan from localStorage', e);
    }
    return INITIAL_PEKERJAAN;
  });

  const [mengenalYpplnList, setMengenalYpplnList] = useState<MengenalYpplnItem[]>(() => {
    try {
      const saved = localStorage.getItem(MENGENAL_YPPLN_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load mengenal yppln from localStorage', e);
    }
    return INITIAL_MENGENAL_YPPLN;
  });

  const [divisiList, setDivisiList] = useState<DivisiItem[]>(() => {
    return getDivisiFromStorage();
  });

  // S-SALUR Master Data States
  const [jenisItemList, setJenisItemList] = useState<JenisItemSalurItem[]>(() => {
    try {
      const saved = localStorage.getItem(JENIS_ITEM_SALUR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load jenis item salur from localStorage', e);
    }
    return INITIAL_JENIS_ITEM_SALUR;
  });

  const [subJenisItemList, setSubJenisItemList] = useState<SubJenisItemSalurItem[]>(() => {
    try {
      const saved = localStorage.getItem(SUB_JENIS_ITEM_SALUR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load sub-jenis item salur from localStorage', e);
    }
    return INITIAL_SUB_JENIS_ITEM_SALUR;
  });

  const [jenisKategoriList, setJenisKategoriList] = useState<JenisKategoriItemSalurItem[]>(() => {
    try {
      const saved = localStorage.getItem(JENIS_KATEGORI_SALUR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load jenis kategori salur from localStorage', e);
    }
    return INITIAL_JENIS_KATEGORI_ITEM_SALUR;
  });

  const [kategoriItemList, setKategoriItemList] = useState<KategoriItemSalurItem[]>(() => {
    try {
      const saved = localStorage.getItem(KATEGORI_ITEM_SALUR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load kategori item salur from localStorage', e);
    }
    return INITIAL_KATEGORI_ITEM_SALUR;
  });

  const [viaSalurList, setViaSalurList] = useState<ViaTransaksiSalurItem[]>(() => {
    try {
      const saved = localStorage.getItem(VIA_TRANSAKSI_SALUR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load via transaksi salur from localStorage', e);
    }
    return INITIAL_VIA_TRANSAKSI_SALUR;
  });

  const [jenisViaSalurList, setJenisViaSalurList] = useState<JenisViaSalurItem[]>(() => {
    try {
      const saved = localStorage.getItem(JENIS_VIA_SALUR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load jenis via salur from localStorage', e);
    }
    return INITIAL_JENIS_VIA_SALUR;
  });

  const [viaDonasiList, setViaDonasiList] = useState<ViaTransaksiDonasiItem[]>(() => {
    try {
      const saved = localStorage.getItem(VIA_TRANSAKSI_DONASI_STORAGE_KEY);
      if (saved) {
        const parsed: ViaTransaksiDonasiItem[] = JSON.parse(saved);
        return parsed.map((item, idx) => {
          if (item.kirimResi === undefined) {
            const initialMatch = INITIAL_VIA_TRANSAKSI_DONASI.find((x) => x.id === item.id);
            return {
              ...item,
              kirimResi: initialMatch?.kirimResi ?? idx % 2 === 0,
            };
          }
          return item;
        });
      }
    } catch (e) {
      console.error('Failed to load via transaksi donasi from localStorage', e);
    }
    return INITIAL_VIA_TRANSAKSI_DONASI;
  });

  const [jenisViaDonasiList, setJenisViaDonasiList] = useState<JenisViaDonasiItem[]>(() => {
    try {
      const saved = localStorage.getItem(JENIS_VIA_DONASI_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load jenis via donasi from localStorage', e);
    }
    return INITIAL_JENIS_VIA_DONASI;
  });

  // A-AJAR Master Data States: Via & Jenis Via Transaksi A-AJAR
  const [viaAjarList, setViaAjarList] = useState<ViaTransaksiAjarItem[]>(() => {
    return getViaAjarFromStorage();
  });

  const [jenisViaAjarList, setJenisViaAjarList] = useState<JenisViaAjarItem[]>(() => {
    return getJenisViaAjarFromStorage();
  });

  const [mutasiItems, setMutasiItems] = useState<MutasiItem[]>(() => {
    try {
      const saved = localStorage.getItem(MUTASI_STORAGE_KEY);
      if (saved) {
        const parsed: MutasiItem[] = JSON.parse(saved);
        const merged = parsed.map((item) => {
          if (!item.linkedTransactions || item.linkedTransactions.length === 0) {
            const initMatch = INITIAL_MUTASI_ITEMS.find((it) => it.id === item.id);
            return {
              ...item,
              linkedTransactions: initMatch?.linkedTransactions || [],
            };
          }
          return item;
        });

        INITIAL_MUTASI_ITEMS.forEach((initItem) => {
          if (!merged.some((m) => m.id === initItem.id)) {
            merged.push(initItem);
          }
        });

        return merged;
      }
    } catch (e) {
      console.error('Failed to load mutasi items from localStorage', e);
    }
    return INITIAL_MUTASI_ITEMS;
  });

  const [rekeningList, setRekeningList] = useState<RekeningItem[]>(() => {
    try {
      const saved = localStorage.getItem(REKENING_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load rekening from localStorage', e);
    }
    return INITIAL_REKENING_ITEMS;
  });

  const [donasiOrders, setDonasiOrders] = useState<DonasiOrder[]>(() => {
    try {
      const saved = localStorage.getItem(DONASI_ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed];
          INITIAL_DONASI_ORDERS.forEach((initOrder) => {
            if (!merged.some((o) => o.id === initOrder.id || o.orderNumber === initOrder.orderNumber)) {
              merged.push(initOrder);
            }
          });
          return merged;
        }
      }
    } catch (e) {
      console.error('Failed to load donasi orders from localStorage', e);
    }
    return INITIAL_DONASI_ORDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(MUTASI_STORAGE_KEY, JSON.stringify(mutasiItems));
    } catch (e) {
      console.error('Failed to save mutasi items to localStorage', e);
    }
  }, [mutasiItems]);

  useEffect(() => {
    try {
      localStorage.setItem(DONASI_ORDERS_STORAGE_KEY, JSON.stringify(donasiOrders));
    } catch (e) {
      console.error('Failed to save donasi orders to localStorage', e);
    }
  }, [donasiOrders]);

  const [isAddRekeningOpen, setIsAddRekeningOpen] = useState(false);
  const [editingRekening, setEditingRekening] = useState<RekeningItem | null>(null);

  // Hari Khusus Calendar To-Do List state (terkoneksi dua arah)
  const [hariKhususList, setHariKhususList] = useState<HariKhususItem[]>(() => {
    return loadHariKhususList();
  });

  const handleSaveHariKhususItem = (item: HariKhususItem) => {
    setHariKhususList((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.id === item.id || it.tanggal === item.tanggal
      );
      let updated: HariKhususItem[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = item;
      } else {
        updated = [...prev, item];
      }
      saveHariKhususList(updated);
      return updated;
    });
    showToast(`Hari Khusus "${item.nama}" berhasil disimpan`);
  };

  const handleDeleteHariKhususItem = (id: string) => {
    setHariKhususList((prev) => {
      const updated = prev.filter((it) => it.id !== id);
      saveHariKhususList(updated);
      return updated;
    });
  };

  const handleToggleLiburHariKhusus = (item: HariKhususItem) => {
    const newLibur = !item.isLibur;
    setHariKhususList((prev) => {
      const updated = prev.map((it) =>
        it.id === item.id ? { ...it, isLibur: newLibur } : it
      );
      saveHariKhususList(updated);
      return updated;
    });
    showToast(
      `Status Libur "${item.nama}": ${newLibur ? 'Checklist (Libur & Merah)' : 'Tidak Libur'}`
    );
  };

  // Jenis Non-Proyek To-do List state & handlers
  const [jenisNonProyekList, setJenisNonProyekList] = useState<JenisNonProyekItem[]>(() => {
    return getJenisNonProyekFromStorage();
  });

  const handleSaveJenisNonProyekItem = (item: JenisNonProyekItem) => {
    setJenisNonProyekList((prev) => {
      const idx = prev.findIndex((it) => it.id === item.id);
      let updated: JenisNonProyekItem[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = item;
      } else {
        updated = [...prev, item];
      }
      saveJenisNonProyekToStorage(updated);
      return updated;
    });
    showToast(`Jenis Non-Proyek "${item.nama}" berhasil disimpan`);
  };

  const handleDeleteJenisNonProyekItem = (id: string) => {
    setJenisNonProyekList((prev) => {
      const updated = prev.filter((it) => it.id !== id);
      saveJenisNonProyekToStorage(updated);
      return updated;
    });
    showToast('Jenis Non-Proyek berhasil dihapus');
  };

  const [editingIdentitas, setEditingIdentitas] = useState<IdentitasItem | null>(null);

  // Change logs for Identitas audit trail
  const [changeLogs, setChangeLogs] = useState<IdentitasChangeLog[]>(() => {
    try {
      const saved = localStorage.getItem(IDENTITAS_CHANGE_LOGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load change logs from localStorage', e);
    }
    return INITIAL_CHANGE_LOGS;
  });

  // Dismissed duplicate pair IDs
  const [dismissedPairIds, setDismissedPairIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_DUPLICATES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load dismissed duplicates from localStorage', e);
    }
    return [];
  });

  // Calculate duplicate pairs and total duplicate records count
  const duplicatePairs = React.useMemo(
    () => findDuplicatePairs(identitasList, dismissedPairIds),
    [identitasList, dismissedPairIds]
  );

  const totalDuplicateRecordsCount = React.useMemo(
    () => getDuplicateRecordsCount(duplicatePairs),
    [duplicatePairs]
  );

  // Master Modals & Editing states
  const [isAddJenisPanggilanOpen, setIsAddJenisPanggilanOpen] = useState(false);
  const [editingJenisPanggilan, setEditingJenisPanggilan] = useState<JenisPanggilanItem | null>(null);

  const [isAddTriyanaOpen, setIsAddTriyanaOpen] = useState(false);
  const [editingTriyana, setEditingTriyana] = useState<TriyanaItem | null>(null);

  const [isAddPekerjaanOpen, setIsAddPekerjaanOpen] = useState(false);
  const [editingPekerjaan, setEditingPekerjaan] = useState<PekerjaanItem | null>(null);

  const [isAddMengenalYpplnOpen, setIsAddMengenalYpplnOpen] = useState(false);
  const [editingMengenalYppln, setEditingMengenalYppln] = useState<MengenalYpplnItem | null>(null);

  const [isAddDivisiOpen, setIsAddDivisiOpen] = useState(false);
  const [editingDivisi, setEditingDivisi] = useState<DivisiItem | null>(null);

  // S-SALUR Master Modal states
  const [isAddJenisItemOpen, setIsAddJenisItemOpen] = useState(false);
  const [editingJenisItem, setEditingJenisItem] = useState<JenisItemSalurItem | null>(null);

  const [isAddSubJenisItemOpen, setIsAddSubJenisItemOpen] = useState(false);
  const [editingSubJenisItem, setEditingSubJenisItem] = useState<SubJenisItemSalurItem | null>(null);

  const [isAddJenisKategoriOpen, setIsAddJenisKategoriOpen] = useState(false);
  const [editingJenisKategori, setEditingJenisKategori] = useState<JenisKategoriItemSalurItem | null>(null);

  const [isAddKategoriItemOpen, setIsAddKategoriItemOpen] = useState(false);
  const [editingKategoriItem, setEditingKategoriItem] = useState<KategoriItemSalurItem | null>(null);

  const [isAddViaSalurOpen, setIsAddViaSalurOpen] = useState(false);
  const [editingViaSalur, setEditingViaSalur] = useState<ViaTransaksiSalurItem | null>(null);

  const [isAddJenisViaSalurOpen, setIsAddJenisViaSalurOpen] = useState(false);
  const [editingJenisViaSalur, setEditingJenisViaSalur] = useState<JenisViaSalurItem | null>(null);

  const [isAddViaDonasiOpen, setIsAddViaDonasiOpen] = useState(false);
  const [editingViaDonasi, setEditingViaDonasi] = useState<ViaTransaksiDonasiItem | null>(null);

  const [isAddJenisViaDonasiOpen, setIsAddJenisViaDonasiOpen] = useState(false);
  const [editingJenisViaDonasi, setEditingJenisViaDonasi] = useState<JenisViaDonasiItem | null>(null);

  const [isAddViaAjarOpen, setIsAddViaAjarOpen] = useState(false);
  const [editingViaAjar, setEditingViaAjar] = useState<ViaTransaksiAjarItem | null>(null);

  const [isAddJenisViaAjarOpen, setIsAddJenisViaAjarOpen] = useState(false);
  const [editingJenisViaAjar, setEditingJenisViaAjar] = useState<JenisViaAjarItem | null>(null);

  const [editingPromoSalurItem, setEditingPromoSalurItem] = useState<PromoSalurItem | null>(null);

  // Sub-Jenis Item D-DONASI State & Handlers
  const [subJenisDonasiList, setSubJenisDonasiList] = useState<SubJenisItemDonasiItem[]>(() => {
    return getSubJenisDonasiFromStorage();
  });
  const [isAddEditSubJenisDonasiOpen, setIsAddEditSubJenisDonasiOpen] = useState(false);
  const [editingSubJenisDonasiItem, setEditingSubJenisDonasiItem] = useState<SubJenisItemDonasiItem | null>(null);

  const handleSaveSubJenisDonasi = (savedItem: SubJenisItemDonasiItem) => {
    let updated: SubJenisItemDonasiItem[];
    if (editingSubJenisDonasiItem) {
      updated = subJenisDonasiList.map((it) => (it.id === savedItem.id ? savedItem : it));
      showToast('Sub-Jenis Item D-DONASI berhasil diperbarui');
    } else {
      updated = [savedItem, ...subJenisDonasiList];
      showToast('Sub-Jenis Item D-DONASI berhasil ditambahkan');
    }
    setSubJenisDonasiList(updated);
    saveSubJenisDonasiToStorage(updated);
  };

  const handleDeleteSubJenisDonasi = (id: string) => {
    const updated = subJenisDonasiList.filter((it) => it.id !== id);
    setSubJenisDonasiList(updated);
    saveSubJenisDonasiToStorage(updated);
    showToast('Sub-Jenis Item D-DONASI berhasil dihapus');
  };

  // Sub-Jenis Item A-AJAR State & Handlers
  const [subJenisAjarList, setSubJenisAjarList] = useState<SubJenisItemAjarItem[]>(() => {
    return getSubJenisAjarFromStorage();
  });
  const [isAddEditSubJenisAjarOpen, setIsAddEditSubJenisAjarOpen] = useState(false);
  const [editingSubJenisAjarItem, setEditingSubJenisAjarItem] = useState<SubJenisItemAjarItem | null>(null);

  const handleSaveSubJenisAjar = (savedItem: SubJenisItemAjarItem) => {
    let updated: SubJenisItemAjarItem[];
    if (editingSubJenisAjarItem) {
      updated = subJenisAjarList.map((it) => (it.id === savedItem.id ? savedItem : it));
      showToast('Sub-Jenis Item A-AJAR berhasil diperbarui');
    } else {
      updated = [savedItem, ...subJenisAjarList];
      showToast('Sub-Jenis Item A-AJAR berhasil ditambahkan');
    }
    setSubJenisAjarList(updated);
    saveSubJenisAjarToStorage(updated);
  };

  const handleDeleteSubJenisAjar = (id: string) => {
    const updated = subJenisAjarList.filter((it) => it.id !== id);
    setSubJenisAjarList(updated);
    saveSubJenisAjarToStorage(updated);
    showToast('Sub-Jenis Item A-AJAR berhasil dihapus');
  };

  // Jenis Acara Item A-AJAR State & Handlers
  const [jenisAcaraAjarList, setJenisAcaraAjarList] = useState<JenisAcaraItemAjarItem[]>(() => {
    return getJenisAcaraAjarFromStorage();
  });
  const [isAddEditJenisAcaraAjarOpen, setIsAddEditJenisAcaraAjarOpen] = useState(false);
  const [editingJenisAcaraAjarItem, setEditingJenisAcaraAjarItem] = useState<JenisAcaraItemAjarItem | null>(null);

  const handleSaveJenisAcaraAjar = (savedItem: JenisAcaraItemAjarItem) => {
    let updated: JenisAcaraItemAjarItem[];
    if (editingJenisAcaraAjarItem) {
      updated = jenisAcaraAjarList.map((it) => (it.id === savedItem.id ? savedItem : it));
      showToast('Jenis Acara Item A-AJAR berhasil diperbarui');
    } else {
      updated = [savedItem, ...jenisAcaraAjarList];
      showToast('Jenis Acara Item A-AJAR berhasil ditambahkan');
    }
    setJenisAcaraAjarList(updated);
    saveJenisAcaraAjarToStorage(updated);
  };

  const handleDeleteJenisAcaraAjar = (id: string) => {
    const updated = jenisAcaraAjarList.filter((it) => it.id !== id);
    setJenisAcaraAjarList(updated);
    saveJenisAcaraAjarToStorage(updated);
    showToast('Jenis Acara Item A-AJAR berhasil dihapus');
  };

  // Pengisi Acara Item A-AJAR State & Handlers
  const [pengisiAcaraAjarList, setPengisiAcaraAjarList] = useState<PengisiAcaraItemAjarItem[]>(() => {
    return getPengisiAcaraAjarFromStorage();
  });
  const [isAddEditPengisiAcaraAjarOpen, setIsAddEditPengisiAcaraAjarOpen] = useState(false);
  const [editingPengisiAcaraAjarItem, setEditingPengisiAcaraAjarItem] = useState<PengisiAcaraItemAjarItem | null>(null);

  const handleSavePengisiAcaraAjar = (savedItem: PengisiAcaraItemAjarItem) => {
    let updated: PengisiAcaraItemAjarItem[];
    if (editingPengisiAcaraAjarItem) {
      updated = pengisiAcaraAjarList.map((it) => (it.id === savedItem.id ? savedItem : it));
      showToast('Pengisi Acara Item A-AJAR berhasil diperbarui');
    } else {
      updated = [savedItem, ...pengisiAcaraAjarList];
      showToast('Pengisi Acara Item A-AJAR berhasil ditambahkan');
    }
    setPengisiAcaraAjarList(updated);
    savePengisiAcaraAjarToStorage(updated);
  };

  const handleDeletePengisiAcaraAjar = (id: string) => {
    const updated = pengisiAcaraAjarList.filter((it) => it.id !== id);
    setPengisiAcaraAjarList(updated);
    savePengisiAcaraAjarToStorage(updated);
    showToast('Pengisi Acara Item A-AJAR berhasil dihapus');
  };

  // Pos Keuangan State & Handlers
  const [posKeuanganList, setPosKeuanganList] = useState<PosKeuanganItem[]>(() => {
    return getPosKeuanganFromStorage();
  });
  const [posKeuanganCardLogo, setPosKeuanganCardLogo] = useState<PosKeuanganCardLogoConfig>(() => {
    return getPosKeuanganCardLogoFromStorage();
  });
  const [isAddEditPosKeuanganOpen, setIsAddEditPosKeuanganOpen] = useState(false);
  const [editingPosKeuanganItem, setEditingPosKeuanganItem] = useState<PosKeuanganItem | null>(null);

  const handleUpdatePosKeuanganCardLogo = (newConfig: PosKeuanganCardLogoConfig) => {
    setPosKeuanganCardLogo(newConfig);
    savePosKeuanganCardLogoToStorage(newConfig);
  };

  const handleSavePosKeuangan = (savedItem: PosKeuanganItem) => {
    let updated: PosKeuanganItem[];
    if (editingPosKeuanganItem) {
      updated = posKeuanganList.map((it) => (it.id === savedItem.id ? savedItem : it));
      showToast('Pos Keuangan berhasil diperbarui');
    } else {
      updated = [savedItem, ...posKeuanganList];
      showToast('Pos Keuangan berhasil ditambahkan');
    }
    setPosKeuanganList(updated);
    savePosKeuanganToStorage(updated);
  };

  const handleDeletePosKeuangan = (id: string) => {
    const updated = posKeuanganList.filter((it) => it.id !== id);
    setPosKeuanganList(updated);
    savePosKeuanganToStorage(updated);
    showToast('Pos Keuangan berhasil dihapus');
  };

  // Jenis Group Funneling State & Handlers
  const [jenisGroupList, setJenisGroupList] = useState<JenisGroupFunnelingItem[]>(() => {
    return loadJenisGroupFunneling();
  });
  const [isAddEditJenisGroupModalOpen, setIsAddEditJenisGroupModalOpen] = useState(false);
  const [editingJenisGroupItem, setEditingJenisGroupItem] = useState<JenisGroupFunnelingItem | null>(null);
  const [previousFunnelingView, setPreviousFunnelingView] = useState<AppView>('listGroupFunneling');

  const handleSaveJenisGroup = (savedItem: JenisGroupFunnelingItem) => {
    let updated: JenisGroupFunnelingItem[];
    if (editingJenisGroupItem) {
      updated = jenisGroupList.map((item) => (item.id === savedItem.id ? savedItem : item));
      showToast('Jenis Group Funneling berhasil diperbarui');
    } else {
      updated = [savedItem, ...jenisGroupList];
      showToast('Jenis Group Funneling baru berhasil ditambahkan');
    }
    setJenisGroupList(updated);
    saveJenisGroupFunneling(updated);
    setIsAddEditJenisGroupModalOpen(false);
    setEditingJenisGroupItem(null);
  };

  const handleDeleteJenisGroup = (id: string) => {
    const updated = jenisGroupList.filter((item) => item.id !== id);
    setJenisGroupList(updated);
    saveJenisGroupFunneling(updated);
    showToast('Jenis Group Funneling berhasil dihapus');
  };

  const handleToggleAktifJenisGroup = (id: string) => {
    const updated = jenisGroupList.map((item) => {
      if (item.id === id) {
        const newAktif = !item.aktif;
        showToast(
          `Status "${item.namaJenisGroup}" diubah menjadi ${newAktif ? 'Aktif' : 'Tidak Aktif'}`
        );
        return { ...item, aktif: newAktif };
      }
      return item;
    });
    setJenisGroupList(updated);
    saveJenisGroupFunneling(updated);
  };

  const handleToggleUniqueIdJenisGroup = (id: string) => {
    const updated = jenisGroupList.map((item) => {
      if (item.id === id) {
        const newUnique = !item.uniqueId;
        showToast(
          `Unique ID untuk "${item.namaJenisGroup}" diubah menjadi ${newUnique ? 'Yes' : 'No'}`
        );
        return { ...item, uniqueId: newUnique };
      }
      return item;
    });
    setJenisGroupList(updated);
    saveJenisGroupFunneling(updated);
  };

  // Transaksi A-AJAR State
  const [transaksiAjarList, setTransaksiAjarList] = useState<TransaksiAjarItem[]>(() => {
    try {
      const saved = localStorage.getItem('yppln_transaksi_ajar_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((a: any) => a.id));
          const missingInitials = INITIAL_TRANSAKSI_AJAR_LIST.filter((a) => !existingIds.has(a.id));
          return [...parsed, ...missingInitials];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRANSAKSI_AJAR_LIST;
  });

  const handleUpdateTransaksiAjar = (updated: TransaksiAjarItem[]) => {
    setTransaksiAjarList(updated);
    try {
      localStorage.setItem('yppln_transaksi_ajar_list', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const [editingTransaksiAjar, setEditingTransaksiAjar] = useState<TransaksiAjarItem | null>(null);

  // Pos Pemasukan State & Handlers
  const [posPemasukanList, setPosPemasukanList] = useState<PosPemasukanGroup[]>(() => {
    return getPosPemasukanFromStorage();
  });
  const [posPemasukanCardLogo, setPosPemasukanCardLogo] = useState<PosPemasukanCardLogoConfig>(() => {
    return getPosPemasukanCardLogoFromStorage();
  });
  const [isAddEditPosPemasukanOpen, setIsAddEditPosPemasukanOpen] = useState(false);
  const [editingPosPemasukanGroup, setEditingPosPemasukanGroup] = useState<PosPemasukanGroup | null>(null);

  const handleUpdatePosPemasukanCardLogo = (newConfig: PosPemasukanCardLogoConfig) => {
    setPosPemasukanCardLogo(newConfig);
    savePosPemasukanCardLogoToStorage(newConfig);
  };

  const handleSavePosPemasukan = (savedGroup: PosPemasukanGroup) => {
    let updated: PosPemasukanGroup[];
    if (editingPosPemasukanGroup) {
      updated = posPemasukanList.map((g) => (g.id === savedGroup.id ? savedGroup : g));
      showToast('Pos Pemasukan berhasil diperbarui');
    } else {
      updated = [savedGroup, ...posPemasukanList];
      showToast('Pos Pemasukan berhasil ditambahkan');
    }
    setPosPemasukanList(updated);
    savePosPemasukanToStorage(updated);
  };

  const handleDeletePosPemasukan = (id: string) => {
    const updated = posPemasukanList.filter((g) => g.id !== id);
    setPosPemasukanList(updated);
    savePosPemasukanToStorage(updated);
    showToast('Pos Pemasukan berhasil dihapus');
  };

  const handleDeletePosPemasukanAllocation = (groupId: string, allocId: string) => {
    const updated = posPemasukanList.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          allocations: g.allocations.filter((a) => a.id !== allocId),
        };
      }
      return g;
    });
    setPosPemasukanList(updated);
    savePosPemasukanToStorage(updated);
    showToast('Baris alokasi Pos Keuangan dihapus');
  };

  // Pos Pemasukan per Sub-Jenis Item State & Handlers
  const [posPemasukanSubJenisList, setPosPemasukanSubJenisList] = useState<PosPemasukanSubJenisMapping[]>(() => {
    return getPosPemasukanSubJenisFromStorage();
  });
  const [isAddEditPosPemasukanSubJenisOpen, setIsAddEditPosPemasukanSubJenisOpen] = useState(false);
  const [editingPosPemasukanSubJenisItem, setEditingPosPemasukanSubJenisItem] = useState<PosPemasukanSubJenisMapping | null>(null);

  const handleSavePosPemasukanSubJenis = (savedMapping: PosPemasukanSubJenisMapping) => {
    let updated: PosPemasukanSubJenisMapping[];
    if (editingPosPemasukanSubJenisItem) {
      updated = posPemasukanSubJenisList.map((m) => (m.id === savedMapping.id ? savedMapping : m));
      showToast('Pemetaan Sub-Jenis Item berhasil diperbarui');
    } else {
      updated = [savedMapping, ...posPemasukanSubJenisList];
      showToast('Pemetaan Sub-Jenis Item berhasil ditambahkan');
    }
    setPosPemasukanSubJenisList(updated);
    savePosPemasukanSubJenisToStorage(updated);
  };

  const handleDeletePosPemasukanSubJenis = (id: string) => {
    const updated = posPemasukanSubJenisList.filter((m) => m.id !== id);
    setPosPemasukanSubJenisList(updated);
    savePosPemasukanSubJenisToStorage(updated);
    showToast('Pemetaan Sub-Jenis Item berhasil dihapus');
  };

  // Pos Pengeluaran State & Handlers
  const [posPengeluaranList, setPosPengeluaranList] = useState<PosPengeluaranGroup[]>(() => {
    return getPosPengeluaranFromStorage();
  });
  const [posPengeluaranCardLogo, setPosPengeluaranCardLogo] = useState<PosPengeluaranCardLogoConfig>(() => {
    return getPosPengeluaranCardLogoFromStorage();
  });
  const [isAddEditPosPengeluaranOpen, setIsAddEditPosPengeluaranOpen] = useState(false);
  const [editingPosPengeluaranGroup, setEditingPosPengeluaranGroup] = useState<PosPengeluaranGroup | null>(null);

  const handleUpdatePosPengeluaranCardLogo = (newConfig: PosPengeluaranCardLogoConfig) => {
    setPosPengeluaranCardLogo(newConfig);
    savePosPengeluaranCardLogoToStorage(newConfig);
  };

  const handleSavePosPengeluaran = (savedGroup: PosPengeluaranGroup) => {
    let updated: PosPengeluaranGroup[];
    if (editingPosPengeluaranGroup) {
      updated = posPengeluaranList.map((g) => (g.id === savedGroup.id ? savedGroup : g));
      showToast('Pos Pengeluaran berhasil diperbarui');
    } else {
      updated = [savedGroup, ...posPengeluaranList];
      showToast('Pos Pengeluaran berhasil ditambahkan');
    }
    setPosPengeluaranList(updated);
    savePosPengeluaranToStorage(updated);
  };

  const handleDeletePosPengeluaran = (id: string) => {
    const updated = posPengeluaranList.filter((g) => g.id !== id);
    setPosPengeluaranList(updated);
    savePosPengeluaranToStorage(updated);
    showToast('Pos Pengeluaran berhasil dihapus');
  };

  const handleDeletePosPengeluaranAllocation = (groupId: string, allocId: string) => {
    const updated = posPengeluaranList.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          allocations: g.allocations.filter((a) => a.id !== allocId),
        };
      }
      return g;
    });
    setPosPengeluaranList(updated);
    savePosPengeluaranToStorage(updated);
    showToast('Baris alokasi Pos Keuangan dihapus');
  };

  // Kelompok Biaya COA State & Handlers
  const [kelompokBiayaCoaList, setKelompokBiayaCoaList] = useState<KelompokBiayaCoaItem[]>(() => {
    return getKelompokBiayaCoaFromStorage();
  });

  const handleSaveKelompokBiayaCoa = (item: KelompokBiayaCoaItem) => {
    let updated: KelompokBiayaCoaItem[];
    const idx = kelompokBiayaCoaList.findIndex((it) => it.id === item.id);
    const oldKelompok = idx >= 0 ? kelompokBiayaCoaList[idx] : undefined;

    if (idx >= 0) {
      updated = [...kelompokBiayaCoaList];
      updated[idx] = item;
    } else {
      updated = [item, ...kelompokBiayaCoaList];
    }
    setKelompokBiayaCoaList(updated);
    saveKelompokBiayaCoaToStorage(updated);

    // If existing kelompok range or name changed, automatically relink and renumber all affected Kebutuhan Pengeluaran and COA accounts
    if (oldKelompok && (oldKelompok.rangeCoa !== item.rangeCoa || oldKelompok.kelompokBiaya !== item.kelompokBiaya)) {
      const { updatedKebutuhanList, updatedCoaList, changedCount } = relinkKebutuhanCoaOnKelompokChange(
        item,
        updated,
        kebutuhanPengeluaranList,
        coaList,
        oldKelompok
      );

      if (changedCount > 0) {
        setKebutuhanPengeluaranList(updatedKebutuhanList);
        saveKebutuhanPengeluaranToStorage(updatedKebutuhanList);
        handleUpdateCoaList(updatedCoaList);
        showToast(
          `Kelompok Biaya diperbarui & ${changedCount} Akun COA Kebutuhan Pengeluaran otomatis disesuaikan`
        );
        return;
      }
    }

    if (idx >= 0) {
      showToast('Kelompok Biaya COA berhasil diperbarui');
    } else {
      showToast('Kelompok Biaya COA berhasil ditambahkan');
    }
  };

  const handleDeleteKelompokBiayaCoa = (id: string) => {
    const updated = kelompokBiayaCoaList.filter((it) => it.id !== id);
    setKelompokBiayaCoaList(updated);
    saveKelompokBiayaCoaToStorage(updated);
    showToast('Kelompok Biaya COA berhasil dihapus');
  };

  // Kebutuhan Pengeluaran State & Handlers
  const [kebutuhanPengeluaranList, setKebutuhanPengeluaranList] = useState<KebutuhanPengeluaranItem[]>(() => {
    return getKebutuhanPengeluaranFromStorage();
  });

  const handleSaveKebutuhanPengeluaran = (item: KebutuhanPengeluaranItem) => {
    // Auto-create or assign dedicated COA account strictly matching kelompok biaya range
    const { updatedItem, newCoaAccount, updatedCoaList } = autoCreateCoaForKebutuhan(
      item,
      kelompokBiayaCoaList,
      coaList,
      kebutuhanPengeluaranList
    );

    if (updatedCoaList !== coaList) {
      handleUpdateCoaList(updatedCoaList);
    }

    let updated: KebutuhanPengeluaranItem[];
    const idx = kebutuhanPengeluaranList.findIndex((it) => it.id === item.id);
    if (idx >= 0) {
      updated = [...kebutuhanPengeluaranList];
      updated[idx] = updatedItem;
      showToast(
        `Kebutuhan Pengeluaran diperbarui & terhubung ke COA ${updatedItem.noAkunCoa} - ${updatedItem.namaAkunCoa}`
      );
    } else {
      updated = [updatedItem, ...kebutuhanPengeluaranList];
      showToast(
        `Kebutuhan Pengeluaran ditambahkan & otomatis dibuat Akun COA ${updatedItem.noAkunCoa} - ${updatedItem.namaAkunCoa}`
      );
    }
    setKebutuhanPengeluaranList(updated);
    saveKebutuhanPengeluaranToStorage(updated);
  };

  const handleDeleteKebutuhanPengeluaran = (id: string) => {
    // Auto-delete the corresponding COA account from Master COA
    const { deletedCoaAccount, updatedCoaList } = autoDeleteCoaForKebutuhan(
      id,
      kebutuhanPengeluaranList,
      coaList
    );

    if (updatedCoaList !== coaList) {
      handleUpdateCoaList(updatedCoaList);
    }

    const updated = kebutuhanPengeluaranList.filter((it) => it.id !== id);
    setKebutuhanPengeluaranList(updated);
    saveKebutuhanPengeluaranToStorage(updated);

    if (deletedCoaAccount) {
      showToast(
        `Kebutuhan Pengeluaran & Akun COA ${deletedCoaAccount.noAkun} (${deletedCoaAccount.namaAkun}) berhasil dihapus`
      );
    } else {
      showToast('Kebutuhan Pengeluaran berhasil dihapus');
    }
  };

  // Kumpulan Rekening State & Handlers
  const [kumpulanRekeningList, setKumpulanRekeningList] = useState<KumpulanRekeningItem[]>(() => {
    return getKumpulanRekeningFromStorage();
  });
  const [isAddEditKumpulanRekeningOpen, setIsAddEditKumpulanRekeningOpen] = useState(false);
  const [editingKumpulanRekeningItem, setEditingKumpulanRekeningItem] = useState<KumpulanRekeningItem | null>(null);

  const handleSaveKumpulanRekening = (item: KumpulanRekeningItem) => {
    let updated: KumpulanRekeningItem[];
    const idx = kumpulanRekeningList.findIndex((it) => it.id === item.id);
    if (idx >= 0) {
      updated = [...kumpulanRekeningList];
      updated[idx] = item;
      showToast(`Rekening ${item.bank} - ${item.nomorRekening} berhasil diperbarui`);
    } else {
      updated = [item, ...kumpulanRekeningList];
      showToast(`Rekening ${item.bank} - ${item.nomorRekening} berhasil ditambahkan`);
    }
    setKumpulanRekeningList(updated);
    saveKumpulanRekeningToStorage(updated);
    setIsAddEditKumpulanRekeningOpen(false);
    setEditingKumpulanRekeningItem(null);
  };

  const handleDeleteKumpulanRekening = (id: string) => {
    const target = kumpulanRekeningList.find((it) => it.id === id);
    const updated = kumpulanRekeningList.filter((it) => it.id !== id);
    setKumpulanRekeningList(updated);
    saveKumpulanRekeningToStorage(updated);
    showToast(`Rekening ${target?.bank || ''} - ${target?.nomorRekening || ''} berhasil dihapus`);
  };

  // Pengeluaran State & Handlers
  const [pengeluaranList, setPengeluaranList] = useState<PengeluaranItem[]>(() => {
    return getPengeluaranFromStorage();
  });
  const [isAddEditPengeluaranOpen, setIsAddEditPengeluaranOpen] = useState(false);
  const [editingPengeluaranItem, setEditingPengeluaranItem] = useState<PengeluaranItem | null>(null);
  const [selectedPersonForPengeluaran, setSelectedPersonForPengeluaran] = useState<IdentitasItem | null>(null);
  const [pengeluaranReturnView, setPengeluaranReturnView] = useState<AppView>('pengeluaran');

  const handleOpenFormPengeluaranForPerson = (person: IdentitasItem) => {
    setSelectedPersonForPengeluaran(person);
    setPengeluaranReturnView('identitas');
    setEditingPengeluaranItem(null);
    setCurrentView('formPengeluaran');
  };

  const handleOpenFormPengeluaranForPersonName = (personName: string) => {
    const found = identitasList.find(
      (i) =>
        i.namaLengkap.toLowerCase().trim() === personName.toLowerCase().trim() ||
        i.namaLengkap.toLowerCase().includes(personName.toLowerCase().trim()) ||
        personName.toLowerCase().includes(i.namaLengkap.toLowerCase().trim()) ||
        (i.namaPanggilan && personName.toLowerCase().includes(i.namaPanggilan.toLowerCase().trim()))
    );
    if (found) {
      setSelectedPersonForPengeluaran(found);
    } else {
      setSelectedPersonForPengeluaran({
        id: `person-${Date.now()}`,
        namaLengkap: personName,
        namaPanggilan: personName,
        jenisKelamin: 'L',
        tanggalLahir: '-',
        bhanteLay: 'Lay',
        organisasi: 'UMM',
        nomorHandPhone: '-',
        status: 'Aktif',
        customerStatus: '-',
        lastContacted: '-',
        pic: '-',
        avatarInitial: personName.charAt(0).toUpperCase() || 'P',
        avatarBg: 'bg-[#008d91]',
      });
    }
    setPengeluaranReturnView('pengeluaran');
    setEditingPengeluaranItem(null);
    setCurrentView('formPengeluaran');
  };

  const handleSavePengeluaran = (savedItem: PengeluaranItem) => {
    let updated: PengeluaranItem[];
    if (editingPengeluaranItem) {
      updated = pengeluaranList.map((item) => (item.id === savedItem.id ? savedItem : item));
      showToast(`Pengeluaran No. ${savedItem.no} berhasil diperbarui`);
    } else {
      updated = [savedItem, ...pengeluaranList];
      showToast(`Pengeluaran No. ${savedItem.no} berhasil ditambahkan`);
    }
    setPengeluaranList(updated);
    savePengeluaranToStorage(updated);
  };

  const handleDeletePengeluaran = (id: string) => {
    const target = pengeluaranList.find((it) => it.id === id);
    const updated = pengeluaranList.filter((it) => it.id !== id);
    setPengeluaranList(updated);
    savePengeluaranToStorage(updated);
    showToast(`Pengeluaran No. ${target?.no || ''} berhasil dihapus`);
  };

  const handleDuplicatePengeluaran = (item: PengeluaranItem) => {
    const numbers = pengeluaranList
      .map((it) => parseInt(it.no, 10))
      .filter((n) => !isNaN(n));
    const nextNo = (numbers.length > 0 ? Math.max(...numbers) + 1 : 196).toString();
    const duplicated: PengeluaranItem = {
      ...item,
      id: `pengeluaran-${Date.now()}`,
      no: nextNo,
      keterangan: `${item.keterangan} (Salinan)`,
      createdAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...pengeluaranList];
    setPengeluaranList(updated);
    savePengeluaranToStorage(updated);
    showToast(`Pengeluaran berhasil disalin ke No. ${nextNo}`);
  };

  // Saldo Pos Keuangan merekap & terkonfigurasi secara dinamis dengan Mutasi, Pos Pemasukan, dan Pos Pemasukan per Sub-Jenis Item
  const reconciledPosKeuanganList = useMemo(() => {
    return reconcilePosKeuanganList(
      posKeuanganList,
      mutasiItems,
      posPemasukanList,
      posPemasukanSubJenisList,
      pengeluaranList,
      salurOrders,
      transaksiAjarList,
      donasiOrders
    );
  }, [
    posKeuanganList,
    mutasiItems,
    posPemasukanList,
    posPemasukanSubJenisList,
    pengeluaranList,
    salurOrders,
    transaksiAjarList,
    donasiOrders,
  ]);

  // Master COA (Chart of Accounts) State - interconnected with Menu COA & Laporan Keuangan
  const [coaList, setCoaList] = useState<CoaAccount[]>(() => {
    return loadCoaList();
  });

  const handleUpdateCoaList = (newList: CoaAccount[]) => {
    setCoaList(newList);
    saveCoaList(newList);
  };

  // Dharma Patron Rutin State & Handlers
  const [dharmaPatronList, setDharmaPatronList] = useState<DharmaPatronRutinItem[]>(() => {
    return getDharmaPatronFromStorage();
  });
  const [isAddEditDharmaPatronOpen, setIsAddEditDharmaPatronOpen] = useState(false);
  const [editingDharmaPatronItem, setEditingDharmaPatronItem] = useState<DharmaPatronRutinItem | null>(null);

  const handleSaveDharmaPatron = (savedItem: DharmaPatronRutinItem) => {
    let updated: DharmaPatronRutinItem[];
    const isExisting = dharmaPatronList.some((item) => item.id === savedItem.id);
    if (editingDharmaPatronItem || isExisting) {
      updated = dharmaPatronList.map((item) => (item.id === savedItem.id ? savedItem : item));
      showToast(`Data Donatur ${savedItem.namaDonatur} berhasil diperbarui`);
    } else {
      updated = [savedItem, ...dharmaPatronList];
      showToast(`Donatur ${savedItem.namaDonatur} berhasil ditambahkan`);
    }
    setDharmaPatronList(updated);
    saveDharmaPatronToStorage(updated);
    setIsAddEditDharmaPatronOpen(false);
    setEditingDharmaPatronItem(null);
    setCurrentView('listDharmaPatronRutin');
  };

  const handleDeleteDharmaPatron = (id: string) => {
    const target = dharmaPatronList.find((it) => it.id === id);
    const updated = dharmaPatronList.filter((it) => it.id !== id);
    setDharmaPatronList(updated);
    saveDharmaPatronToStorage(updated);
    showToast(`Donatur ${target?.namaDonatur || ''} berhasil dihapus`);
  };

  const handleDuplicateDharmaPatron = (item: DharmaPatronRutinItem) => {
    const numbers = dharmaPatronList
      .map((it) => parseInt(it.noDonatur.replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    const nextNo = ((numbers.length > 0 ? Math.max(...numbers) + 1 : 36)).toString().padStart(5, '0');
    const duplicated: DharmaPatronRutinItem = {
      ...item,
      id: `dpr-${Date.now()}`,
      noDonatur: nextNo,
      namaDonatur: `${item.namaDonatur} (Salinan)`,
      createdAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...dharmaPatronList];
    setDharmaPatronList(updated);
    saveDharmaPatronToStorage(updated);
    showToast(`Data donatur berhasil disalin ke No. ${nextNo}`);
  };

  // Jenis Perubahan Edit Donasi/bulan Dharma Patron Rutin State & Handlers
  const [jenisPerubahanList, setJenisPerubahanList] = useState<JenisPerubahanDharmaPatronItem[]>(() => {
    return loadJenisPerubahanDPR();
  });

  const handleSaveJenisPerubahan = (savedItem: JenisPerubahanDharmaPatronItem) => {
    let updated: JenisPerubahanDharmaPatronItem[];
    const isExisting = jenisPerubahanList.some((item) => item.id === savedItem.id);
    if (isExisting) {
      updated = jenisPerubahanList.map((item) => (item.id === savedItem.id ? savedItem : item));
    } else {
      updated = [...jenisPerubahanList, savedItem];
    }
    setJenisPerubahanList(updated);
    saveJenisPerubahanDPR(updated);
  };

  const handleDeleteJenisPerubahan = (id: string) => {
    const updated = jenisPerubahanList.filter((item) => item.id !== id);
    setJenisPerubahanList(updated);
    saveJenisPerubahanDPR(updated);
  };

  // Volunteer A-AJAK Item S-SEBAR State & Handlers
  const [volunteerSSebarList, setVolunteerSSebarList] = useState<VolunteerSSebarItem[]>(() => {
    return loadVolunteerSSebar();
  });

  const handleSaveVolunteerSSebar = (savedItem: VolunteerSSebarItem) => {
    let updated: VolunteerSSebarItem[];
    const isExisting = volunteerSSebarList.some((item) => item.id === savedItem.id);
    if (isExisting) {
      updated = volunteerSSebarList.map((item) => (item.id === savedItem.id ? savedItem : item));
    } else {
      updated = [savedItem, ...volunteerSSebarList];
    }
    setVolunteerSSebarList(updated);
    saveVolunteerSSebar(updated);
  };

  const handleDeleteVolunteerSSebar = (id: string) => {
    const updated = volunteerSSebarList.filter((item) => item.id !== id);
    setVolunteerSSebarList(updated);
    saveVolunteerSSebar(updated);
  };

  const handleDuplicateVolunteerSSebar = (item: VolunteerSSebarItem) => {
    const nextNum = String(volunteerSSebarList.length + 1).padStart(5, '0');
    const copy: VolunteerSSebarItem = {
      ...item,
      id: `vol-${Date.now()}`,
      kode: nextNum,
      nama: `${item.nama} (Salinan)`,
      createdAt: new Date().toISOString(),
    };
    const updated = [copy, ...volunteerSSebarList];
    setVolunteerSSebarList(updated);
    saveVolunteerSSebar(updated);
    showToast(`Volunteer ${item.nama} berhasil diduplikasi ke No. ${nextNum}`);
  };

  const [editingVolunteerSSebarItem, setEditingVolunteerSSebarItem] = useState<VolunteerSSebarItem | null>(null);

  // Volunteer A-AJAK A-JAR State & Handlers
  const [volunteerAJarList, setVolunteerAJarList] = useState<VolunteerAJarItem[]>(() => {
    return loadVolunteerAJar();
  });

  const handleSaveVolunteerAJar = (savedItem: VolunteerAJarItem) => {
    let updated: VolunteerAJarItem[];
    const isExisting = volunteerAJarList.some((item) => item.id === savedItem.id);
    if (isExisting) {
      updated = volunteerAJarList.map((item) => (item.id === savedItem.id ? savedItem : item));
    } else {
      updated = [savedItem, ...volunteerAJarList];
    }
    setVolunteerAJarList(updated);
    saveVolunteerAJar(updated);
  };

  const handleDeleteVolunteerAJar = (id: string) => {
    const updated = volunteerAJarList.filter((item) => item.id !== id);
    setVolunteerAJarList(updated);
    saveVolunteerAJar(updated);
  };

  const handleDuplicateVolunteerAJar = (item: VolunteerAJarItem) => {
    const nextNum = String(volunteerAJarList.length + 1).padStart(5, '0');
    const copy: VolunteerAJarItem = {
      ...item,
      id: `vol-ajar-${Date.now()}`,
      kode: nextNum,
      nama: `${item.nama} (Salinan)`,
      createdAt: new Date().toISOString(),
    };
    const updated = [copy, ...volunteerAJarList];
    setVolunteerAJarList(updated);
    saveVolunteerAJar(updated);
    showToast(`Volunteer ${item.nama} berhasil diduplikasi ke No. ${nextNum}`);
  };

  // Job Advance Master Table state & handlers
  const [jobAdvanceMasterList, setJobAdvanceMasterList] = useState<JobAdvanceMasterItem[]>(() => {
    return loadJobAdvanceMaster();
  });

  const handleSaveJobAdvanceMaster = (savedItem: JobAdvanceMasterItem) => {
    let updated: JobAdvanceMasterItem[];
    const exists = jobAdvanceMasterList.some((item) => item.id === savedItem.id);
    if (exists) {
      updated = jobAdvanceMasterList.map((item) => (item.id === savedItem.id ? savedItem : item));
      showToast(`Job Advance "${savedItem.nama}" berhasil diperbarui`);
    } else {
      updated = [...jobAdvanceMasterList, savedItem];
      showToast(`Job Advance "${savedItem.nama}" berhasil ditambahkan`);
    }
    setJobAdvanceMasterList(updated);
    saveJobAdvanceMaster(updated);
  };

  const handleDeleteJobAdvanceMaster = (id: string) => {
    const target = jobAdvanceMasterList.find((it) => it.id === id);
    const updated = jobAdvanceMasterList.filter((it) => it.id !== id);
    setJobAdvanceMasterList(updated);
    saveJobAdvanceMaster(updated);
    showToast(`Job Advance "${target?.nama || ''}" berhasil dihapus`);
  };

  // Status Job Advance Master Table state & handlers
  const [statusJobAdvanceMasterList, setStatusJobAdvanceMasterList] = useState<StatusJobAdvanceMasterItem[]>(() => {
    return loadStatusJobAdvanceMaster();
  });

  const handleSaveStatusJobAdvanceMaster = (savedItem: StatusJobAdvanceMasterItem) => {
    let updated: StatusJobAdvanceMasterItem[];
    const exists = statusJobAdvanceMasterList.some((item) => item.id === savedItem.id);
    if (exists) {
      updated = statusJobAdvanceMasterList.map((item) => (item.id === savedItem.id ? savedItem : item));
      showToast(`Status "${savedItem.nama}" berhasil diperbarui`);
    } else {
      updated = [...statusJobAdvanceMasterList, savedItem];
      showToast(`Status "${savedItem.nama}" berhasil ditambahkan`);
    }
    setStatusJobAdvanceMasterList(updated);
    saveStatusJobAdvanceMaster(updated);
  };

  const handleDeleteStatusJobAdvanceMaster = (id: string) => {
    const target = statusJobAdvanceMasterList.find((it) => it.id === id);
    const updated = statusJobAdvanceMasterList.filter((it) => it.id !== id);
    setStatusJobAdvanceMasterList(updated);
    saveStatusJobAdvanceMaster(updated);
    showToast(`Status "${target?.nama || ''}" berhasil dihapus`);
  };

  // Konten Promosi State & Handlers
  const [kontenPromosiList, setKontenPromosiList] = useState<KontenPromosiItem[]>(() => {
    return getKontenPromosiFromStorage();
  });

  const handleSaveKontenPromosiItem = (savedItem: KontenPromosiItem) => {
    let updated: KontenPromosiItem[];
    const exists = kontenPromosiList.some((item) => item.id === savedItem.id);
    if (exists) {
      updated = kontenPromosiList.map((item) => (item.id === savedItem.id ? savedItem : item));
    } else {
      updated = [savedItem, ...kontenPromosiList];
    }
    setKontenPromosiList(updated);
    saveKontenPromosiToStorage(updated);
  };

  const handleDeleteKontenPromosiItem = (id: string) => {
    const updated = kontenPromosiList.filter((item) => item.id !== id);
    setKontenPromosiList(updated);
    saveKontenPromosiToStorage(updated);
  };

  // List PM State & Handlers
  const [listPMList, setListPMList] = useState<ListPMItem[]>(() => {
    return consolidateListPMByProyekSapa(loadListPM());
  });

  const handleSaveListPMItem = (savedItem: ListPMItem) => {
    let updated: ListPMItem[];
    const exists = listPMList.some((item) => item.id === savedItem.id);
    if (exists) {
      updated = listPMList.map((item) => (item.id === savedItem.id ? savedItem : item));
    } else {
      updated = mergeListPMItemsByProyekSapa(listPMList, [savedItem]);
    }
    setListPMList(updated);
    saveListPM(updated);
  };

  const handleDeleteListPMItem = (id: string) => {
    const target = listPMList.find((it) => it.id === id);
    const updated = listPMList.filter((it) => it.id !== id);
    setListPMList(updated);
    saveListPM(updated);
    showToast(`List PM "${target?.proyekSapa || ''}" berhasil dihapus`);
  };

  const handleBulkDeleteListPMItems = (ids: string[]) => {
    const idSet = new Set(ids);
    const updated = listPMList.filter((it) => !idSet.has(it.id));
    setListPMList(updated);
    saveListPM(updated);
    showToast(`${ids.length} proyek List PM berhasil dihapus`);
  };

  const handleBulkSaveListPMItems = (itemsToUpdate: ListPMItem[]) => {
    const updateMap = new Map(itemsToUpdate.map((it) => [it.id, it]));
    const updated = listPMList.map((it) => updateMap.get(it.id) || it);
    setListPMList(updated);
    saveListPM(updated);
  };

  const [formListPMInitialTarget, setFormListPMInitialTarget] = useState<FormListPMInitialTarget | null>(null);
  const [formListPMInitialProject, setFormListPMInitialProject] = useState<ListPMItem | null>(null);

  const handleKirimPMToForm = (
    targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]
  ) => {
    if (!targets || targets.length === 0) return;
    setFormListPMInitialProject(null);
    if (targets.length === 1) {
      const t = targets[0];
      setFormListPMInitialTarget({
        type: 'identitas',
        id: t.identitasId || t.id,
        nama: t.nama,
        hp: t.nomorHp || '',
        items: [{ id: t.identitasId || t.id, nama: t.nama, nomorHp: t.nomorHp || '', codeId: t.codeId }],
      });
    } else {
      const items = targets.map((t) => ({
        id: t.identitasId || t.id,
        nama: t.nama,
        nomorHp: t.nomorHp || '',
        codeId: t.codeId,
      }));
      setFormListPMInitialTarget({
        type: 'identitas',
        id: items[0].id,
        nama: `${items.length} Target Terpilih`,
        hp: items[0].nomorHp,
        identitasIds: items.map((i) => i.id),
        items,
      });
    }
    setCurrentView('formListPM');
  };

  const handleSaveFormListPM = (primaryItem: ListPMItem, lanjutanItems?: ListPMItem[]) => {
    const itemsToAdd = [primaryItem, ...(lanjutanItems || [])];
    const updated = mergeListPMItemsByProyekSapa(listPMList, itemsToAdd);
    setListPMList(updated);
    saveListPM(updated);
    setFormListPMInitialTarget(null);
    setFormListPMInitialProject(null);
    setCurrentView('listPM');
    showToast(`List PM "${primaryItem.proyekSapa}" berhasil diperbarui`);
  };

  const handleAddListPMItems = (newItems: ListPMItem[]) => {
    const updated = mergeListPMItemsByProyekSapa(listPMList, newItems);
    setListPMList(updated);
    saveListPM(updated);
  };

  const handleAutoInputOnResiSaved = (order: SalurOrder, resi: string) => {
    const currentRules = loadAutoInputSalurRules();
    const result = executeAutoInputSalurRules(order, resi, currentRules, templatePMList, new Date());
    if (result.items.length > 0) {
      const updatedListPM = mergeListPMItemsByProyekSapa(listPMList, result.items);
      setListPMList(updatedListPM);
      saveListPM(updatedListPM);

      const existingLogs = loadAutoInputSalurLogs();
      const updatedLogs = [...result.logs, ...existingLogs];
      saveAutoInputSalurLogs(updatedLogs);

      const ruleNames = result.items.map((it) => it.proyekSapa).join(', ');
      showToast(`Otomatis masuk ke List PM (${result.items.length} pesan: ${ruleNames})`);
    }
  };

  // Template PM State & Handlers
  const [templatePMList, setTemplatePMList] = useState<TemplatePMItem[]>(() => {
    return loadTemplatePM();
  });
  const [editingTemplatePMItem, setEditingTemplatePMItem] = useState<TemplatePMItem | null>(null);

  const handleSaveTemplatePMItem = (savedItem: TemplatePMItem) => {
    let updated: TemplatePMItem[];
    const exists = templatePMList.some((item) => item.id === savedItem.id);
    if (exists) {
      updated = templatePMList.map((item) => (item.id === savedItem.id ? savedItem : item));
    } else {
      updated = [savedItem, ...templatePMList];
    }
    setTemplatePMList(updated);
    saveTemplatePM(updated);
  };

  const handleDeleteTemplatePMItem = (id: string) => {
    const target = templatePMList.find((it) => it.id === id);
    const updated = templatePMList.filter((it) => it.id !== id);
    setTemplatePMList(updated);
    saveTemplatePM(updated);
    showToast(`Template PM "${target?.namaTemplate || ''}" berhasil dihapus`);
  };

  const handleToggleAktifTemplatePM = (id: string) => {
    const updated = templatePMList.map((it) => {
      if (it.id === id) {
        return { ...it, aktif: !it.aktif };
      }
      return it;
    });
    setTemplatePMList(updated);
    saveTemplatePM(updated);
    const target = updated.find((it) => it.id === id);
    showToast(`Template "${target?.namaTemplate}" status: ${target?.aktif ? 'Aktif (Yes)' : 'Tidak Aktif (No)'}`);
  };

  // Karyawan State & Handlers
  const [karyawanList, setKaryawanList] = useState<KaryawanItem[]>(() => {
    return loadKaryawan();
  });

  // Agen Resi State & Handlers
  const [agenResiList, setAgenResiList] = useState<AgenResiItem[]>(() => {
    return loadAgenResiItems();
  });

  const handleSaveKaryawanItem = (savedItem: KaryawanItem) => {
    let updated: KaryawanItem[];
    const exists = karyawanList.some((item) => item.id === savedItem.id);
    if (exists) {
      updated = karyawanList.map((item) => (item.id === savedItem.id ? savedItem : item));
    } else {
      updated = [savedItem, ...karyawanList];
    }
    setKaryawanList(updated);
    saveKaryawan(updated);
  };

  const handleDeleteKaryawanItem = (id: string) => {
    const target = karyawanList.find((it) => it.id === id);
    const updated = karyawanList.filter((it) => it.id !== id);
    setKaryawanList(updated);
    saveKaryawan(updated);
    showToast(`Karyawan "${target?.namaLengkap || ''}" berhasil dihapus`);
  };

  // Form Cuti Karyawan State & Handlers
  const [cutiKaryawanList, setCutiKaryawanList] = useState<CutiKaryawanItem[]>(() => {
    return loadCutiKaryawanList();
  });

  const handleSaveCutiKaryawanItem = (savedItem: CutiKaryawanItem) => {
    let updated: CutiKaryawanItem[];
    const exists = cutiKaryawanList.some((item) => item.id === savedItem.id);
    if (exists) {
      updated = cutiKaryawanList.map((item) =>
        item.id === savedItem.id ? savedItem : item
      );
    } else {
      updated = [savedItem, ...cutiKaryawanList];
    }
    setCutiKaryawanList(updated);
    saveCutiKaryawanList(updated);
  };

  const handleDeleteCutiKaryawanItem = (id: string) => {
    const target = cutiKaryawanList.find((it) => it.id === id);
    const updated = cutiKaryawanList.filter((it) => it.id !== id);
    setCutiKaryawanList(updated);
    saveCutiKaryawanList(updated);
    showToast(`Data cuti untuk "${target?.namaKaryawan || ''}" berhasil dihapus`);
  };

  const handleUpdateCutiStatus = (id: string, newStatus: CutiStatus) => {
    const updated = cutiKaryawanList.map((it) => {
      if (it.id === id) {
        return {
          ...it,
          status: newStatus,
          disetujuiOleh: newStatus === 'Disetujui' ? 'Ko Agus (UMM)' : undefined,
        };
      }
      return it;
    });
    setCutiKaryawanList(updated);
    saveCutiKaryawanList(updated);
  };

  // List Account State & Handlers
  const [accountList, setAccountList] = useState<AccountItem[]>(() => {
    return loadAccountList();
  });
  const [editingAccountItem, setEditingAccountItem] = useState<AccountItem | null>(null);

  const handleSaveAccountItem = (savedItem: AccountItem) => {
    let updated: AccountItem[];
    const exists = accountList.some((item) => item.id === savedItem.id);
    if (exists) {
      updated = accountList.map((item) => (item.id === savedItem.id ? savedItem : item));
    } else {
      updated = [savedItem, ...accountList];
    }
    setAccountList(updated);
    saveAccountList(updated);
    setCurrentView('listAccount');
  };

  const handleDeleteAccountItem = (id: string) => {
    const target = accountList.find((it) => it.id === id);
    const updated = accountList.filter((it) => it.id !== id);
    setAccountList(updated);
    saveAccountList(updated);
    showToast(`Akun "${target?.namaAccount || ''}" berhasil dihapus`);
  };

  const handleToggleAccountStatus = (item: AccountItem) => {
    const updated = accountList.map((it) => {
      if (it.id === item.id) {
        return { ...it, aktif: !it.aktif };
      }
      return it;
    });
    setAccountList(updated);
    saveAccountList(updated);
    showToast(`Status akun "${item.namaAccount}" diubah menjadi: ${!item.aktif ? 'Aktif' : 'Tidak Aktif'}`);
  };

  // Quick Reply State & Handlers
  const [quickReplyList, setQuickReplyList] = useState<QuickReplyItem[]>(() => {
    return loadQuickReplyList();
  });
  const [editingQuickReplyItem, setEditingQuickReplyItem] = useState<QuickReplyItem | null>(null);

  const handleSaveQuickReplyItem = (savedItem: QuickReplyItem) => {
    let updated: QuickReplyItem[];
    const exists = quickReplyList.some((item) => item.id === savedItem.id);
    if (exists) {
      updated = quickReplyList.map((item) => (item.id === savedItem.id ? savedItem : item));
    } else {
      updated = [savedItem, ...quickReplyList];
    }
    setQuickReplyList(updated);
    saveQuickReplyList(updated);
    setCurrentView('quickReply');
  };

  const handleDeleteQuickReplyItem = (id: string) => {
    const target = quickReplyList.find((it) => it.id === id);
    const updated = quickReplyList.filter((it) => it.id !== id);
    setQuickReplyList(updated);
    saveQuickReplyList(updated);
    showToast(`Quick Reply "${target?.quickReply || ''}" berhasil dihapus`);
  };

  // List FAQ & Tentang FAQ State & Handlers
  const [faqList, setFaqList] = useState<FaqItem[]>(() => {
    return loadFaqList();
  });
  const [tentangFaqList, setTentangFaqList] = useState<TentangFaqItem[]>(() => {
    return loadTentangFaqList();
  });
  const [editingFaqItem, setEditingFaqItem] = useState<FaqItem | null>(null);

  const handleSaveFaqItems = (itemsToSave: FaqItem[]) => {
    let updated = [...faqList];
    itemsToSave.forEach((item) => {
      const existsIndex = updated.findIndex((it) => it.id === item.id);
      if (existsIndex >= 0) {
        updated[existsIndex] = item;
      } else {
        updated = [item, ...updated];
      }
    });
    setFaqList(updated);
    saveFaqList(updated);
    setCurrentView('listFaq');
  };

  const handleDeleteFaqItem = (id: string) => {
    const target = faqList.find((it) => it.id === id);
    const updated = faqList.filter((it) => it.id !== id);
    setFaqList(updated);
    saveFaqList(updated);
    showToast(`FAQ "${target?.pertanyaan || ''}" berhasil dihapus`);
  };

  const handleSaveTentangFaqItem = (itemToSave: TentangFaqItem) => {
    let updated: TentangFaqItem[];
    const exists = tentangFaqList.some((t) => t.id === itemToSave.id);
    if (exists) {
      updated = tentangFaqList.map((t) => (t.id === itemToSave.id ? itemToSave : t));
    } else {
      updated = [...tentangFaqList, itemToSave];
    }
    setTentangFaqList(updated);
    saveTentangFaqList(updated);
  };

  const handleDeleteTentangFaqItem = (id: string) => {
    const target = tentangFaqList.find((t) => t.id === id);
    const updated = tentangFaqList.filter((t) => t.id !== id);
    setTentangFaqList(updated);
    saveTentangFaqList(updated);
    showToast(`Tentang FAQ "${target?.tentang || ''}" berhasil dihapus`);
  };

  // Complaint State & Handlers
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => {
    return getComplaintsFromStorage();
  });

  const handleAddComplaint = (item: ComplaintItem) => {
    const updated = [item, ...complaints];
    setComplaints(updated);
    saveComplaintsToStorage(updated);
  };

  const handleUpdateComplaint = (item: ComplaintItem) => {
    const updated = complaints.map((c) => (c.id === item.id ? item : c));
    setComplaints(updated);
    saveComplaintsToStorage(updated);
  };

  const handleDeleteComplaint = (id: string) => {
    const target = complaints.find((c) => c.id === id);
    const updated = complaints.filter((c) => c.id !== id);
    setComplaints(updated);
    saveComplaintsToStorage(updated);
    showToast(`Komplain "${target?.nama || ''}" berhasil dihapus`);
  };

  const [editingComplaintItem, setEditingComplaintItem] = useState<ComplaintItem | null>(null);

  const handleSaveComplaintFromForm = (item: ComplaintItem) => {
    let updated: ComplaintItem[];
    const exists = complaints.some((c) => c.id === item.id);
    if (exists) {
      updated = complaints.map((c) => (c.id === item.id ? item : c));
    } else {
      updated = [item, ...complaints];
    }
    setComplaints(updated);
    saveComplaintsToStorage(updated);
  };

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    tanggal: true,
    dateRangePersiapan: true,
    namaKegiatan: true,
    jenisProyek: true,
    divisi: true,
    lokasi: true,
    status: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // View state: 'table' | 'form' | 'jenisProyek' | 'report' | 'transaksiSalur' | 'formTransaksiSalur'
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Current logged in user & division for Home customization (default: Agustino Ong, 00031, MAD)
  const [currentUser, setCurrentUser] = useState<KaryawanItem>(() => {
    try {
      const saved = localStorage.getItem('sapa_current_login_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    const list = loadKaryawan();
    return (
      list.find((k) => k.kodeKaryawan === '00031' || k.namaLengkap.toLowerCase().includes('agustino')) ||
      list[0] ||
      INITIAL_KARYAWAN[0]
    );
  });
  const [currentDivisi, setCurrentDivisi] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('sapa_current_login_divisi');
      if (saved) return saved;
    } catch {}
    return 'MAD';
  });

  const handleUpdateCurrentUser = (user: KaryawanItem, divisi: string) => {
    setCurrentUser(user);
    setCurrentDivisi(divisi);
    try {
      localStorage.setItem('sapa_current_login_user', JSON.stringify(user));
      localStorage.setItem('sapa_current_login_divisi', divisi);
    } catch {}
  };
  const [returnViewAfterAdd, setReturnViewAfterAdd] = useState<AppView | null>(null);
  const [projectFormReturnView, setProjectFormReturnView] = useState<'table' | 'timelineProyekSapa'>('table');
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [viewingProject, setViewingProject] = useState<ProjectItem | null>(null);
  const [reportingProject, setReportingProject] = useState<ProjectItem | null>(null);
  const [todoProject, setTodoProject] = useState<ProjectItem | null>(null);
  const [selectedHadiahProject, setSelectedHadiahProject] = useState<ProjectItem | null>(null);
  const [projectTodos, setProjectTodos] = useState<Record<string, TodoTaskItem[]>>(() => {
    const all = getAllProjectTodos();
    const evaluated: Record<string, TodoTaskItem[]> = {};
    for (const [pId, tasks] of Object.entries(all)) {
      const { updatedTasks, hasNewGenerated } = checkAndGenerateNextRutinTasks(tasks);
      evaluated[pId] = updatedTasks;
      if (hasNewGenerated) {
        saveTodosForProject(pId, updatedTasks);
      }
    }
    return evaluated;
  });
  const [isAddJenisProyekOpen, setIsAddJenisProyekOpen] = useState(false);
  const [editingJenisProyek, setEditingJenisProyek] = useState<JenisProyekItem | null>(null);
  const [isAddMutasiOpen, setIsAddMutasiOpen] = useState(false);
  const [editingMutasi, setEditingMutasi] = useState<MutasiItem | null>(null);
  const [editingSalurOrder, setEditingSalurOrder] = useState<SalurOrder | null>(null);
  const [activeMutasiBank, setActiveMutasiBank] = useState<string>('BCA 888');
  const [activeStokSalurGudangFilter, setActiveStokSalurGudangFilter] = useState<string | undefined>(undefined);
  const [activeStockInOutFilter, setActiveStockInOutFilter] = useState<string | undefined>(undefined);
  const [previousStockView, setPreviousStockView] = useState<'stockInOutSalur' | 'stokItemSalur' | 'namaPercetakanStockSalur'>('stockInOutSalur');
  const [selectedFormPercetakan, setSelectedFormPercetakan] = useState<string>('');
  const [selectedItemDonasiForAlokasi, setSelectedItemDonasiForAlokasi] = useState<ItemDonasiEvent | null>(null);
  const [selectedChildForAlokasi, setSelectedChildForAlokasi] = useState<ItemDonasiChild | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [modalTambahExistingOpen, setModalTambahExistingOpen] = useState(false);
  const [modalTambahExistingTargets, setModalTambahExistingTargets] = useState<TargetMemberItem[]>([]);
  const [funnelingInitialIdentitasIds, setFunnelingInitialIdentitasIds] = useState<string[]>([]);

  const handleNavigateToCreateGroupFunneling = (identitasIds: string[], sourceView?: AppView) => {
    setFunnelingInitialIdentitasIds(identitasIds);
    if (sourceView) {
      setPreviousFunnelingView(sourceView);
    }
    setCurrentView('formListGroupFunneling');
  };

  const handleOpenTambahKeGroupFunnelingExisting = (targets: TargetMemberItem[]) => {
    setModalTambahExistingTargets(targets);
    setModalTambahExistingOpen(true);
  };

  // Sync projects with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
    }
  }, [projects]);

  // Sync jenis proyek with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(JENIS_PROYEK_STORAGE_KEY, JSON.stringify(jenisProyekList));
    } catch (e) {
      console.error('Failed to save jenis proyek to localStorage', e);
    }
  }, [jenisProyekList]);

  // Sync salur orders with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SALUR_ORDERS_STORAGE_KEY, JSON.stringify(salurOrders));
    } catch (e) {
      console.error('Failed to save salur orders to localStorage', e);
    }
  }, [salurOrders]);

  // Sync salur items with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SALUR_ITEMS_STORAGE_KEY, JSON.stringify(salurItems));
    } catch (e) {
      console.error('Failed to save salur items to localStorage', e);
    }
  }, [salurItems]);

  // Synchronize salurItems stock with realtime Stok Item S-SALUR
  useEffect(() => {
    const syncRealtimeStock = () => {
      try {
        const storedStok = getStoredStokSalurItems();
        setSalurItems((prev) => {
          let hasDiff = false;
          const next = prev.map((item) => {
            const match = storedStok.find(
              (si) =>
                si.productId === item.id ||
                isMatchingSalurItem(si.namaItem, item.title) ||
                (item.code && si.subtitle && si.subtitle.includes(item.code))
            );
            if (match) {
              const realStock =
                match.containers && match.containers.length > 0
                  ? match.containers.reduce((acc, c) => acc + (Number(c.stok) || 0), 0)
                  : Number(match.stok) || 0;
              if (item.stock !== realStock) {
                hasDiff = true;
                return { ...item, stock: realStock };
              }
            }
            return item;
          });
          return hasDiff ? next : prev;
        });
      } catch (e) {
        console.error('Failed to sync realtime stock with salurItems', e);
      }
    };

    syncRealtimeStock();
    window.addEventListener('storage', syncRealtimeStock);
    window.addEventListener('stok_salur_updated', syncRealtimeStock);
    window.addEventListener('stock_in_out_updated', syncRealtimeStock);
    window.addEventListener('focus', syncRealtimeStock);
    return () => {
      window.removeEventListener('storage', syncRealtimeStock);
      window.removeEventListener('stok_salur_updated', syncRealtimeStock);
      window.removeEventListener('stock_in_out_updated', syncRealtimeStock);
      window.removeEventListener('focus', syncRealtimeStock);
    };
  }, []);

  // Synchronize Item S-SALUR with Chart of Accounts (COA 40002 - 49990)
  useEffect(() => {
    try {
      const { syncedItems, syncedCoaList, addedAccountsCount } = syncAllSalurItemsWithCoa(salurItems, coaList);
      const itemsChanged = JSON.stringify(syncedItems.map(i => ({ id: i.id, no: i.coaNoAkun }))) !==
                           JSON.stringify(salurItems.map(i => ({ id: i.id, no: i.coaNoAkun })));
      if (addedAccountsCount > 0 || itemsChanged) {
        setSalurItems(syncedItems);
        handleUpdateCoaList(syncedCoaList);
      }
    } catch (e) {
      console.error('Failed to sync Salur items with COA:', e);
    }
  }, []);

  // Synchronize Jenis Proyek with Chart of Accounts (COA 10101 - 10299)
  useEffect(() => {
    try {
      const { syncedItems, syncedCoaList, addedCount } = syncAllJenisProyekWithCoa(jenisProyekList, coaList);
      const itemsChanged = JSON.stringify(syncedItems.map(i => ({ id: i.id, code: i.coaCode, isCoa: i.isCoa }))) !==
                           JSON.stringify(jenisProyekList.map(i => ({ id: i.id, code: i.coaCode, isCoa: i.isCoa })));
      if (addedCount > 0 || itemsChanged) {
        setJenisProyekList(syncedItems);
        handleUpdateCoaList(syncedCoaList);
      }
    } catch (e) {
      console.error('Failed to sync Jenis Proyek with COA:', e);
    }
  }, []);

  // Synchronize Kebutuhan Pengeluaran with Chart of Accounts (COA based on Kelompok Biaya range)
  useEffect(() => {
    try {
      const { syncedKebutuhanList, syncedCoaList, addedCount } = syncAllKebutuhanPengeluaranWithCoa(
        kebutuhanPengeluaranList,
        kelompokBiayaCoaList,
        coaList
      );
      const itemsChanged =
        JSON.stringify(syncedKebutuhanList.map((i) => ({ id: i.id, no: i.noAkunCoa, name: i.namaAkunCoa }))) !==
        JSON.stringify(kebutuhanPengeluaranList.map((i) => ({ id: i.id, no: i.noAkunCoa, name: i.namaAkunCoa })));
      if (addedCount > 0 || itemsChanged) {
        setKebutuhanPengeluaranList(syncedKebutuhanList);
        saveKebutuhanPengeluaranToStorage(syncedKebutuhanList);
        handleUpdateCoaList(syncedCoaList);
      }
    } catch (e) {
      console.error('Failed to sync Kebutuhan Pengeluaran with COA:', e);
    }
  }, []);

  // Sync identitas with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(IDENTITAS_STORAGE_KEY, JSON.stringify(identitasList));
      window.dispatchEvent(new CustomEvent('identitas-updated'));
    } catch (e) {
      console.error('Failed to save identitas to localStorage', e);
    }
  }, [identitasList]);

  // Sync organisasi with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORGANISASI_STORAGE_KEY, JSON.stringify(organisasiList));
      window.dispatchEvent(new CustomEvent('organisasi-updated'));
    } catch (e) {
      console.error('Failed to save organisasi to localStorage', e);
    }
  }, [organisasiList]);

  // Global navigation listener for app views (e.g. from IdentitasIdSelector)
  useEffect(() => {
    const handleAppNavigate = (e: any) => {
      if (e?.detail) {
        if (
          currentView === 'formTransaksiAjar' ||
          currentView === 'formTransaksiSalur' ||
          currentView === 'formTransaksiDonasi' ||
          currentView === 'formListDharmaPatronRutin'
        ) {
          setReturnViewAfterAdd(currentView);
        }
        setCurrentView(e.detail);
      }
    };
    window.addEventListener('app-navigate-view', handleAppNavigate);
    return () => window.removeEventListener('app-navigate-view', handleAppNavigate);
  }, [currentView]);

  // Sync master identity tables with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(JENIS_PANGGILAN_STORAGE_KEY, JSON.stringify(jenisPanggilanList));
    } catch (e) {
      console.error('Failed to save jenis panggilan to localStorage', e);
    }
  }, [jenisPanggilanList]);

  useEffect(() => {
    try {
      localStorage.setItem(TRIYANA_STORAGE_KEY, JSON.stringify(triyanaList));
    } catch (e) {
      console.error('Failed to save triyana to localStorage', e);
    }
  }, [triyanaList]);

  useEffect(() => {
    try {
      localStorage.setItem(PEKERJAAN_STORAGE_KEY, JSON.stringify(pekerjaanList));
    } catch (e) {
      console.error('Failed to save pekerjaan to localStorage', e);
    }
  }, [pekerjaanList]);

  useEffect(() => {
    try {
      localStorage.setItem(MENGENAL_YPPLN_STORAGE_KEY, JSON.stringify(mengenalYpplnList));
    } catch (e) {
      console.error('Failed to save mengenal yppln to localStorage', e);
    }
  }, [mengenalYpplnList]);

  useEffect(() => {
    saveDivisiToStorage(divisiList);
  }, [divisiList]);

  // Sync S-SALUR master tables with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(JENIS_ITEM_SALUR_STORAGE_KEY, JSON.stringify(jenisItemList));
    } catch (e) {
      console.error('Failed to save jenis item salur to localStorage', e);
    }
  }, [jenisItemList]);

  useEffect(() => {
    try {
      localStorage.setItem(SUB_JENIS_ITEM_SALUR_STORAGE_KEY, JSON.stringify(subJenisItemList));
    } catch (e) {
      console.error('Failed to save sub-jenis item salur to localStorage', e);
    }
  }, [subJenisItemList]);

  useEffect(() => {
    try {
      localStorage.setItem(JENIS_KATEGORI_SALUR_STORAGE_KEY, JSON.stringify(jenisKategoriList));
    } catch (e) {
      console.error('Failed to save jenis kategori salur to localStorage', e);
    }
  }, [jenisKategoriList]);

  useEffect(() => {
    try {
      localStorage.setItem(KATEGORI_ITEM_SALUR_STORAGE_KEY, JSON.stringify(kategoriItemList));
    } catch (e) {
      console.error('Failed to save kategori item salur to localStorage', e);
    }
  }, [kategoriItemList]);

  useEffect(() => {
    try {
      localStorage.setItem(VIA_TRANSAKSI_SALUR_STORAGE_KEY, JSON.stringify(viaSalurList));
    } catch (e) {
      console.error('Failed to save via transaksi salur to localStorage', e);
    }
  }, [viaSalurList]);

  useEffect(() => {
    try {
      localStorage.setItem(JENIS_VIA_SALUR_STORAGE_KEY, JSON.stringify(jenisViaSalurList));
    } catch (e) {
      console.error('Failed to save jenis via salur to localStorage', e);
    }
  }, [jenisViaSalurList]);

  useEffect(() => {
    try {
      localStorage.setItem(VIA_TRANSAKSI_DONASI_STORAGE_KEY, JSON.stringify(viaDonasiList));
    } catch (e) {
      console.error('Failed to save via transaksi donasi to localStorage', e);
    }
  }, [viaDonasiList]);

  useEffect(() => {
    try {
      localStorage.setItem(JENIS_VIA_DONASI_STORAGE_KEY, JSON.stringify(jenisViaDonasiList));
    } catch (e) {
      console.error('Failed to save jenis via donasi to localStorage', e);
    }
  }, [jenisViaDonasiList]);

  // Sync Via and Jenis Via Transaksi A-AJAR with localStorage
  useEffect(() => {
    saveViaAjarToStorage(viaAjarList);
  }, [viaAjarList]);

  useEffect(() => {
    saveJenisViaAjarToStorage(jenisViaAjarList);
  }, [jenisViaAjarList]);

  // Sync change logs with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(IDENTITAS_CHANGE_LOGS_STORAGE_KEY, JSON.stringify(changeLogs));
    } catch (e) {
      console.error('Failed to save change logs to localStorage', e);
    }
  }, [changeLogs]);

  // Sync dismissed duplicate pairs with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DISMISSED_DUPLICATES_STORAGE_KEY, JSON.stringify(dismissedPairIds));
    } catch (e) {
      console.error('Failed to save dismissed duplicates to localStorage', e);
    }
  }, [dismissedPairIds]);

  // Sync mutasi items with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MUTASI_STORAGE_KEY, JSON.stringify(mutasiItems));
    } catch (e) {
      console.error('Failed to save mutasi items to localStorage', e);
    }
  }, [mutasiItems]);

  // Sync rekening items with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REKENING_STORAGE_KEY, JSON.stringify(rekeningList));
    } catch (e) {
      console.error('Failed to save rekening to localStorage', e);
    }
  }, [rekeningList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveTodoList = (projectId: string, tasks: TodoTaskItem[]) => {
    if (projectId === 'proj-non-proyek' || projectId.startsWith('non-proj')) {
      const existing = projectTodos[projectId] || [];
      const combined = [...existing, ...tasks];
      saveTodosForProject(projectId, combined);
      setProjectTodos((prev) => ({ ...prev, [projectId]: combined }));

      setProjects((prev) => {
        const found = prev.find((p) => p.id === projectId);
        if (found) {
          return prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  namaKegiatan: tasks[0]?.jenisNonProyekNama || p.namaKegiatan,
                  warnaKartu: tasks[0]?.warnaKartu || p.warnaKartu,
                }
              : p
          );
        }
        const nonProyekProject: ProjectItem = {
          id: projectId,
          tanggal: new Date().toISOString().slice(0, 10),
          dateRangePersiapan: '-',
          lokasi: 'Kantor',
          namaKegiatan: tasks[0]?.jenisNonProyekNama || 'Non Proyek',
          jenisProyek: 'Non Proyek',
          divisi: 'ALL',
          kategori: 'Non Proyek',
          status: 'Ongoing',
          deadline: '2026-12-31',
          deskripsi: 'Kegiatan to-do list non-proyek',
          progress: 0,
          warnaKartu: tasks[0]?.warnaKartu || '#9fa8da',
        };
        return [...prev, nonProyekProject];
      });
    } else {
      saveTodosForProject(projectId, tasks);
      setProjectTodos((prev) => ({ ...prev, [projectId]: tasks }));
    }
    showToast('To-Do List berhasil disimpan');
    setCurrentView(todoProject ? 'table' : 'todoList');
    setTodoProject(null);
  };

  const handleToggleTodoComplete = (
    projectId: string,
    taskId: string,
    subTaskId: string | null
  ) => {
    let nextStageForTrello: 'not_started_non_proyek' | 'not_started_proyek_sapa' | 'ongoing' | 'selesai_pending' = 'ongoing';
    let nextStatusForTrello: 'belum_mulai' | 'ongoing' | 'selesai' = 'ongoing';
    let isNonProyekTask = false;

    setProjectTodos((prev) => {
      const projectTasks = prev[projectId] || getTodosForProject(projectId);
      const isProjNonProyek =
        projectId.startsWith('non-proj') ||
        projectId === 'proj-non-proyek';

      const updatedTasks = projectTasks.map((t) => {
        if (t.id !== taskId) return t;
        const taskIsNonProyek = isProjNonProyek || !!t.isNonProyek;
        isNonProyekTask = taskIsNonProyek;

        if (subTaskId) {
          const updatedSubTasks = (t.subTasks || []).map((st) => {
            if (st.id === subTaskId) {
              const currentStatus: 'not_started' | 'ongoing' | 'completed' =
                st.status ||
                (st.completed ? 'completed' : (st.statusPengerjaan === 'ongoing' ? 'ongoing' : 'not_started'));

              let nextStatus: 'not_started' | 'ongoing' | 'completed' = 'ongoing';
              let nextCompleted = false;

              if (currentStatus === 'not_started') {
                nextStatus = 'ongoing';
                nextCompleted = false;
                nextStageForTrello = 'ongoing';
                nextStatusForTrello = 'ongoing';
              } else if (currentStatus === 'ongoing') {
                nextStatus = 'completed';
                nextCompleted = true;
                nextStageForTrello = 'selesai_pending';
                nextStatusForTrello = 'selesai';
              } else {
                nextStatus = 'not_started';
                nextCompleted = false;
                nextStageForTrello = taskIsNonProyek ? 'not_started_non_proyek' : 'not_started_proyek_sapa';
                nextStatusForTrello = 'belum_mulai';
              }

              return {
                ...st,
                status: nextStatus,
                statusPengerjaan: nextStatusForTrello,
                completed: nextCompleted,
              };
            }
            return st;
          });

          const allSubCompleted =
            updatedSubTasks.length > 0 && updatedSubTasks.every((st) => st.completed);
          return {
            ...t,
            subTasks: updatedSubTasks,
            completed: allSubCompleted,
            status: allSubCompleted ? 'completed' : updatedSubTasks.some((s) => s.status === 'ongoing') ? 'ongoing' : 'not_started',
          };
        } else {
          // Standalone task
          const currentStatus: 'not_started' | 'ongoing' | 'completed' =
            t.status ||
            (t.completed ? 'completed' : (t.statusPengerjaan === 'ongoing' ? 'ongoing' : 'not_started'));

          let nextStatus: 'not_started' | 'ongoing' | 'completed' = 'ongoing';
          let nextCompleted = false;

          if (currentStatus === 'not_started') {
            nextStatus = 'ongoing';
            nextCompleted = false;
            nextStageForTrello = 'ongoing';
            nextStatusForTrello = 'ongoing';
          } else if (currentStatus === 'ongoing') {
            nextStatus = 'completed';
            nextCompleted = true;
            nextStageForTrello = 'selesai_pending';
            nextStatusForTrello = 'selesai';
          } else {
            nextStatus = 'not_started';
            nextCompleted = false;
            nextStageForTrello = taskIsNonProyek ? 'not_started_non_proyek' : 'not_started_proyek_sapa';
            nextStatusForTrello = 'belum_mulai';
          }

          return {
            ...t,
            status: nextStatus,
            statusPengerjaan: nextStatusForTrello,
            completed: nextCompleted,
          };
        }
      });

      // Synchronize directly with Papan Trello cards in storage
      try {
        const trelloCards = getPapanTrelloCardsFromStorage();
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;
        let cardFound = false;

        const updatedCards = trelloCards.map((c) => {
          const match =
            (c.projectId === projectId && c.taskId === taskId && subTaskId && c.subTaskId === subTaskId) ||
            (c.taskId === taskId && subTaskId && c.subTaskId === subTaskId) ||
            (subTaskId && c.subTaskId === subTaskId) ||
            (!subTaskId && (c.taskId === taskId || (c.projectId === projectId && c.taskId === taskId)));

          if (!match) return c;
          cardFound = true;

          let tMulai = c.tanggalMulai;
          let tSelesai = c.tanggalSelesai;
          if (nextStageForTrello === 'ongoing' && !tMulai) {
            tMulai = dateStr;
          } else if (nextStageForTrello === 'selesai_pending') {
            if (!tMulai) tMulai = '20/10';
            if (!tSelesai) tSelesai = dateStr;
          }

          return {
            ...c,
            stage: nextStageForTrello,
            statusPengerjaan: nextStatusForTrello,
            tanggalMulai: tMulai,
            tanggalSelesai: tSelesai,
          };
        });

        if (!cardFound) {
          const targetTask = updatedTasks.find((t) => t.id === taskId);
          const targetSub = targetTask?.subTasks?.find((st) => st.id === subTaskId);
          const targetDeadline = targetSub?.deadline || targetTask?.deadline || '15/10';
          const targetDivisi = targetSub?.divisi || targetTask?.divisi || 'PNB';
          const targetEmployee = targetSub?.idKaryawanAssignJob || targetTask?.idKaryawanAssignJob || '00015';

          updatedCards.push({
            id: `pt-todo-${projectId}-${taskId}-${subTaskId || 'main'}`,
            projectId,
            taskId,
            subTaskId: subTaskId || undefined,
            stage: nextStageForTrello,
            deadline: targetDeadline.includes('/') ? targetDeadline : dateStr,
            taskName: targetTask?.task || 'Task',
            subTaskName: targetSub?.title || targetTask?.task || 'Sub-Task',
            idKaryawan: targetEmployee,
            karyawanInitial: 'S',
            isNonProyek: isNonProyekTask,
            proyekSapaOrJenisName: isNonProyekTask ? (targetTask?.jenisNonProyekNama || 'Jenis Non Rutin') : 'Proyek SAPA',
            divisi: targetDivisi,
            statusPengerjaan: nextStatusForTrello,
            tanggalMulai: nextStageForTrello === 'ongoing' ? dateStr : undefined,
            tanggalSelesai: nextStageForTrello === 'selesai_pending' ? dateStr : undefined,
            hasKendala: false,
          });
        }

        savePapanTrelloCardsToStorage(updatedCards);
      } catch (err) {
        console.error('Failed to sync to trello storage', err);
      }

      // Check if any routine task completed and generate next recurrence if due:
      // "To-Do List baru akan digenerate setelah tanggal To-Do List sebelumnya berakhir."
      const { updatedTasks: checkedTasks, hasNewGenerated } = checkAndGenerateNextRutinTasks(updatedTasks);
      saveTodosForProject(projectId, checkedTasks);
      if (hasNewGenerated) {
        showToast('To-Do List baru otomatis digenerate dari jadwal rutin');
      }
      return { ...prev, [projectId]: checkedTasks };
    });
  };

  const handleDeleteTodoItem = (
    projectId: string,
    taskId: string,
    subTaskId: string | null
  ) => {
    setProjectTodos((prev) => {
      const projectTasks = prev[projectId] || getTodosForProject(projectId);
      let updatedTasks: TodoTaskItem[];
      if (subTaskId) {
        updatedTasks = projectTasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            subTasks: (t.subTasks || []).filter((st) => st.id !== subTaskId),
          };
        });
      } else {
        updatedTasks = projectTasks.filter((t) => t.id !== taskId);
      }
      saveTodosForProject(projectId, updatedTasks);
      return { ...prev, [projectId]: updatedTasks };
    });
    showToast('Item To-Do List berhasil dihapus');
  };

  const handleToggleColumn = (col: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  const handleSaveProject = (data: Omit<ProjectItem, 'id'> | ProjectItem) => {
    if ('id' in data) {
      setProjects((prev) =>
        prev.map((p) => (p.id === data.id ? (data as ProjectItem) : p))
      );
      showToast('Proyek berhasil diperbarui');
    } else {
      const newProject: ProjectItem = {
        ...data,
        id: `proj-${Date.now()}`,
      };
      setProjects((prev) => [...prev, newProject]);
      showToast('Proyek baru berhasil ditambahkan');
    }
    setCurrentView(projectFormReturnView);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast('Proyek telah dihapus');
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showToast(`Status diubah menjadi ${newStatus}`);
  };

  const handleKirimHadiah = (proj: ProjectItem) => {
    setSelectedHadiahProject(proj);
    setCurrentView('formTransaksiSalurHadiah');
  };

  // Jenis Proyek handlers
  const handleSaveJenisProyek = (data: {
    jenisKegiatan: string;
    keterangan: string;
    isCoa?: boolean;
    coaCode?: string;
    coaName?: string;
  }) => {
    let candidateItem: JenisProyekItem;

    if (editingJenisProyek) {
      candidateItem = {
        ...editingJenisProyek,
        jenisKegiatan: data.jenisKegiatan,
        keterangan: data.keterangan,
        isCoa: !!data.isCoa,
        coaCode: data.isCoa ? data.coaCode : undefined,
        coaName: data.isCoa ? (data.coaName || data.jenisKegiatan) : undefined,
      };
    } else {
      candidateItem = {
        id: `jp-${Date.now()}`,
        jenisKegiatan: data.jenisKegiatan,
        keterangan: data.keterangan,
        isCoa: !!data.isCoa,
        coaCode: data.isCoa ? data.coaCode : undefined,
        coaName: data.isCoa ? (data.coaName || data.jenisKegiatan) : undefined,
      };
    }

    const { updatedItem, newCoaAccount, updatedCoaList } = autoCreateCoaForJenisProyek(
      candidateItem,
      coaList,
      jenisProyekList
    );

    if (updatedCoaList !== coaList) {
      handleUpdateCoaList(updatedCoaList);
    }

    if (editingJenisProyek) {
      setJenisProyekList((prev) =>
        prev.map((jp) => (jp.id === editingJenisProyek.id ? updatedItem : jp))
      );
      if (updatedItem.isCoa && updatedItem.coaCode) {
        showToast(
          `Jenis Proyek diperbarui & terhubung ke COA ${updatedItem.coaCode} - ${updatedItem.coaName}`
        );
      } else {
        showToast('Jenis Proyek berhasil diperbarui');
      }
    } else {
      setJenisProyekList((prev) => [...prev, updatedItem]);
      if (updatedItem.isCoa && updatedItem.coaCode) {
        showToast(
          `Jenis Proyek ditambahkan & dibuat Akun COA ${updatedItem.coaCode} - ${updatedItem.coaName}`
        );
      } else {
        showToast('Jenis Proyek baru berhasil ditambahkan');
      }
    }
    setEditingJenisProyek(null);
  };

  const handleDeleteJenisProyek = (id: string) => {
    const itemToDelete = jenisProyekList.find((jp) => jp.id === id);
    const { deletedCoaAccount, updatedCoaList } = autoDeleteCoaForJenisProyek(
      id,
      jenisProyekList,
      coaList
    );

    if (deletedCoaAccount) {
      handleUpdateCoaList(updatedCoaList);
      setJenisProyekList((prev) => prev.filter((jp) => jp.id !== id));
      showToast(
        `Jenis Proyek "${itemToDelete?.jenisKegiatan || ''}" dan Akun COA "${deletedCoaAccount.noAkun} ${deletedCoaAccount.namaAkun}" telah dihapus`
      );
    } else {
      setJenisProyekList((prev) => prev.filter((jp) => jp.id !== id));
      showToast(`Jenis Proyek "${itemToDelete?.jenisKegiatan || ''}" telah dihapus`);
    }
  };

  const handleUpdateTemplateTodoList = (
    jenisProyekId: string,
    templates: { id: string; task: string; deskripsi?: string }[]
  ) => {
    setJenisProyekList((prev) =>
      prev.map((jp) =>
        jp.id === jenisProyekId ? { ...jp, templateTodoList: templates } : jp
      )
    );
    const target = jenisProyekList.find((jp) => jp.id === jenisProyekId);
    showToast(
      `Template Rekomendasi To-Do List untuk "${target?.jenisKegiatan || 'Jenis Proyek'}" berhasil disimpan`
    );
  };

  const handleAddNewJenisProyekFromName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = jenisProyekList.some(
      (jp) => jp.jenisKegiatan.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      const newItem: JenisProyekItem = {
        id: `jp-${Date.now()}`,
        jenisKegiatan: trimmed,
        keterangan: '-',
      };
      setJenisProyekList((prev) => [...prev, newItem]);
    }
  };

  const handleResetData = () => {
    setProjects(INITIAL_PROJECTS);
    setJenisProyekList(INITIAL_JENIS_PROYEK);
    setIdentitasList(INITIAL_IDENTITAS);
    setJenisPanggilanList(INITIAL_JENIS_PANGGILAN);
    setTriyanaList(INITIAL_TRIYANA);
    setPekerjaanList(INITIAL_PEKERJAAN);
    setMengenalYpplnList(INITIAL_MENGENAL_YPPLN);
    setChangeLogs(INITIAL_CHANGE_LOGS);
    setDismissedPairIds([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(JENIS_PROYEK_STORAGE_KEY);
    localStorage.removeItem(IDENTITAS_STORAGE_KEY);
    localStorage.removeItem(JENIS_PANGGILAN_STORAGE_KEY);
    localStorage.removeItem(TRIYANA_STORAGE_KEY);
    localStorage.removeItem(PEKERJAAN_STORAGE_KEY);
    localStorage.removeItem(MENGENAL_YPPLN_STORAGE_KEY);
    localStorage.removeItem(IDENTITAS_CHANGE_LOGS_STORAGE_KEY);
    localStorage.removeItem(DISMISSED_DUPLICATES_STORAGE_KEY);
    showToast('Data berhasil di-reset ke tampilan awal');
  };

  // Edit Identitas change log handler
  const handleSaveEditIdentitas = (updatedItem: IdentitasItem, newLogs: IdentitasChangeLog[]) => {
    setIdentitasList((prev) =>
      prev.map((it) => (it.id === updatedItem.id ? updatedItem : it))
    );
    setChangeLogs((prev) => [...newLogs, ...prev]);

    // If name changed, update all related projects and salur orders
    if (editingIdentitas && editingIdentitas.namaLengkap !== updatedItem.namaLengkap) {
      setProjects((prev) =>
        prev.map((p) =>
          p.pic === editingIdentitas.namaLengkap ? { ...p, pic: updatedItem.namaLengkap } : p
        )
      );
      setSalurOrders((prev) =>
        prev.map((s) =>
          s.penerima === editingIdentitas.namaLengkap ? { ...s, penerima: updatedItem.namaLengkap } : s
        )
      );
    }
  };

  // Merge duplicates handler: merges secondary into primary and updates all related references
  const handleMergePair = (pair: DuplicatePair) => {
    const primary = pair.item1;
    const secondary = pair.item2;

    // Combine fields: primary has priority, fallback to secondary
    const mergedItem: IdentitasItem = {
      ...secondary,
      ...primary,
      email: primary.email || secondary.email,
      nomorHandPhone: primary.nomorHandPhone || secondary.nomorHandPhone,
      kota: primary.kota || secondary.kota,
      organisasi:
        primary.organisasi &&
        secondary.organisasi &&
        primary.organisasi !== '-' &&
        secondary.organisasi !== '-' &&
        primary.organisasi !== secondary.organisasi
          ? `${primary.organisasi}, ${secondary.organisasi}`
          : primary.organisasi !== '-'
          ? primary.organisasi
          : secondary.organisasi,
      status: primary.status !== '-' ? primary.status : secondary.status,
      custDuration:
        primary.custDuration !== '-' ? primary.custDuration : secondary.custDuration,
      alamatList: [
        ...(primary.alamatList || []),
        ...(secondary.alamatList || []).filter(
          (sa) => !(primary.alamatList || []).some((pa) => pa.alamat === sa.alamat)
        ),
      ],
    };

    // 1. Update identity list
    setIdentitasList((prev) =>
      prev
        .filter((it) => it.id !== secondary.id)
        .map((it) => (it.id === primary.id ? mergedItem : it))
    );

    // 2. Update projects where pic or reference was secondary
    setProjects((prev) =>
      prev.map((p) =>
        p.pic === secondary.namaLengkap ? { ...p, pic: primary.namaLengkap } : p
      )
    );

    // 3. Update salur orders where penerima was secondary
    setSalurOrders((prev) =>
      prev.map((s) =>
        s.penerima === secondary.namaLengkap ? { ...s, penerima: primary.namaLengkap } : s
      )
    );

    // 4. Record audit change log
    const now = new Date();
    const timestampFormatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const mergeLog: IdentitasChangeLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      identitasId: primary.id,
      codeId: primary.codeId || '',
      namaLengkap: primary.namaLengkap,
      timestamp: timestampFormatted,
      field: 'Semua Field (Penggabungan Duplikat)',
      oldValue: `Data ${secondary.codeId || '-'} ${secondary.namaLengkap} (${secondary.nomorHandPhone})`,
      newValue: `Digabungkan ke ${primary.codeId || '-'} ${primary.namaLengkap}`,
      alasan: `Merge Duplicates (${pair.reason})`,
      actionType: 'Merge',
    };

    setChangeLogs((prev) => [mergeLog, ...prev]);
    showToast(`Data ${secondary.namaLengkap} (${secondary.codeId || '-'}) berhasil digabungkan ke ${primary.namaLengkap}`);
  };

  // Merge all duplicate pairs
  const handleMergeAll = () => {
    if (duplicatePairs.length === 0) return;
    const count = duplicatePairs.length;
    duplicatePairs.forEach((pair) => {
      handleMergePair(pair);
    });
    showToast(`Semua (${count}) pasangan data duplikat berhasil digabungkan`);
  };

  // Dismiss a duplicate pair
  const handleDismissPair = (pairId: string) => {
    setDismissedPairIds((prev) => [...prev, pairId]);
    showToast('Pasangan duplikat berhasil diabaikan');
  };

  // Organisasi CRUD
  const handleSaveOrganisasi = (savedItem: OrganisasiItem) => {
    if (editingOrganisasi) {
      setOrganisasiList((prev) =>
        prev.map((it) => (it.id === savedItem.id ? savedItem : it))
      );
      showToast('Data organisasi berhasil diperbarui');
    } else {
      setOrganisasiList((prev) => [savedItem, ...prev]);
      showToast('Organisasi baru berhasil ditambahkan');
    }
    if (returnViewAfterAdd) {
      setCurrentView(returnViewAfterAdd);
      setReturnViewAfterAdd(null);
    } else {
      setCurrentView('organisasi');
    }
    setEditingOrganisasi(null);
  };

  const handleDeleteOrganisasi = (id: string) => {
    setOrganisasiList((prev) => prev.filter((it) => it.id !== id));
    showToast('Organisasi berhasil dihapus');
  };

  const handleToggleStarIdentitas = (id: string) => {
    setIdentitasList((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isStarred: !it.isStarred } : it))
    );
  };

  const handleToggleStarOrganisasi = (id: string) => {
    setOrganisasiList((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isStarred: !it.isStarred } : it))
    );
  };

  // Master: Jenis Panggilan CRUD
  const handleSaveJenisPanggilan = (item: JenisPanggilanItem) => {
    setJenisPanggilanList((prev) => {
      const exists = prev.some((x) => x.id === item.id);
      const updatedPrev = item.isPrimary
        ? prev.map((x) => ({ ...x, isPrimary: x.id === item.id }))
        : prev;

      if (exists) {
        return updatedPrev.map((x) => (x.id === item.id ? item : x));
      } else {
        return [...updatedPrev, item];
      }
    });
    showToast(`Jenis Panggilan "${item.jenisPanggilan}" berhasil disimpan`);
    setIsAddJenisPanggilanOpen(false);
    setEditingJenisPanggilan(null);
  };

  const handleDeleteJenisPanggilan = (id: string) => {
    setJenisPanggilanList((prev) => prev.filter((x) => x.id !== id));
    showToast('Jenis Panggilan berhasil dihapus');
  };

  // Master: Triyana CRUD
  const handleSaveTriyana = (triyanaName: string, keterangan: string) => {
    if (editingTriyana) {
      setTriyanaList((prev) =>
        prev.map((x) =>
          x.id === editingTriyana.id ? { ...x, triyana: triyanaName, keterangan } : x
        )
      );
      showToast(`Triyana "${triyanaName}" berhasil diperbarui`);
    } else {
      const newItem: TriyanaItem = {
        id: `tri-${Date.now()}`,
        triyana: triyanaName,
        keterangan,
      };
      setTriyanaList((prev) => [...prev, newItem]);
      showToast(`Triyana "${triyanaName}" berhasil ditambahkan`);
    }
    setIsAddTriyanaOpen(false);
    setEditingTriyana(null);
  };

  const handleDeleteTriyana = (id: string) => {
    setTriyanaList((prev) => prev.filter((x) => x.id !== id));
    showToast('Triyana berhasil dihapus');
  };

  // Master: Pekerjaan CRUD
  const handleSavePekerjaan = (namaPekerjaan: string, keterangan: string) => {
    if (editingPekerjaan) {
      setPekerjaanList((prev) =>
        prev.map((x) =>
          x.id === editingPekerjaan.id ? { ...x, namaPekerjaan, keterangan } : x
        )
      );
      showToast(`Pekerjaan "${namaPekerjaan}" berhasil diperbarui`);
    } else {
      const newItem: PekerjaanItem = {
        id: `pek-${Date.now()}`,
        namaPekerjaan,
        keterangan,
      };
      setPekerjaanList((prev) => [...prev, newItem]);
      showToast(`Pekerjaan "${namaPekerjaan}" berhasil ditambahkan`);
    }
    setIsAddPekerjaanOpen(false);
    setEditingPekerjaan(null);
  };

  const handleDeletePekerjaan = (id: string) => {
    setPekerjaanList((prev) => prev.filter((x) => x.id !== id));
    showToast('Pekerjaan berhasil dihapus');
  };

  // Master: Mengenal YPPLN CRUD
  const handleSaveMengenalYppln = (mengenalYppln: string, keterangan: string) => {
    if (editingMengenalYppln) {
      setMengenalYpplnList((prev) =>
        prev.map((x) =>
          x.id === editingMengenalYppln.id ? { ...x, mengenalYppln, keterangan } : x
        )
      );
      showToast(`Mengenal YPPLN "${mengenalYppln}" berhasil diperbarui`);
    } else {
      const newItem: MengenalYpplnItem = {
        id: `my-${Date.now()}`,
        mengenalYppln,
        keterangan,
      };
      setMengenalYpplnList((prev) => [...prev, newItem]);
      showToast(`Mengenal YPPLN "${mengenalYppln}" berhasil ditambahkan`);
    }
    setIsAddMengenalYpplnOpen(false);
    setEditingMengenalYppln(null);
  };

  const handleDeleteMengenalYppln = (id: string) => {
    setMengenalYpplnList((prev) => prev.filter((x) => x.id !== id));
    showToast('Mengenal YPPLN berhasil dihapus');
  };

  // Master: Divisi CRUD
  const handleSaveDivisi = (namaDivisi: string, keterangan: string) => {
    const trimmedNama = (namaDivisi || '').trim();
    if (!trimmedNama) return;

    if (editingDivisi) {
      const oldNama = editingDivisi.namaDivisi;
      setDivisiList((prev) =>
        prev.map((x) =>
          x.id === editingDivisi.id ? { ...x, namaDivisi: trimmedNama, keterangan } : x
        )
      );

      // Cascade update to connected data if name changed!
      if (oldNama && oldNama !== trimmedNama) {
        setProjects((prev) =>
          prev.map((p) => (p.divisi === oldNama ? { ...p, divisi: trimmedNama } : p))
        );
        setKaryawanList((prev) => {
          const updated = prev.map((k) => (k.divisi === oldNama ? { ...k, divisi: trimmedNama } : k));
          saveKaryawan(updated);
          return updated;
        });
        setPengeluaranList((prev) =>
          prev.map((pg) => (pg.divisi === oldNama ? { ...pg, divisi: trimmedNama } : pg))
        );
      }
      showToast(`Divisi "${trimmedNama}" berhasil diperbarui`);
    } else {
      const newItem: DivisiItem = {
        id: `div-${Date.now()}`,
        namaDivisi: trimmedNama,
        keterangan: keterangan || '-',
      };
      setDivisiList((prev) => [...prev, newItem]);
      showToast(`Divisi "${trimmedNama}" berhasil ditambahkan`);
    }
    setIsAddDivisiOpen(false);
    setEditingDivisi(null);
  };

  const handleDeleteDivisi = (id: string) => {
    setDivisiList((prev) => prev.filter((x) => x.id !== id));
    showToast('Divisi berhasil dihapus');
  };

  const divisiNames = useMemo(() => divisiList.map((d) => d.namaDivisi), [divisiList]);

  const divisiConnectedCounts = useMemo(() => {
    const counts: Record<string, { projects: number; timelineTasks: number; employees: number; pengeluaran: number }> = {};
    divisiList.forEach((d) => {
      const key = d.namaDivisi.toUpperCase();
      counts[key] = { projects: 0, timelineTasks: 0, employees: 0, pengeluaran: 0 };
    });

    projects.forEach((p) => {
      const k = (p.divisi || '').toUpperCase();
      if (counts[k]) counts[k].projects += 1;
    });

    karyawanList.forEach((e) => {
      const k = (e.divisi || '').toUpperCase();
      if (counts[k]) counts[k].employees += 1;
    });

    pengeluaranList.forEach((pg) => {
      const k = (pg.divisi || '').toUpperCase();
      if (counts[k]) counts[k].pengeluaran += 1;
    });

    return counts;
  }, [divisiList, projects, karyawanList, pengeluaranList]);

  // Total Pendapatan per Divisi from Item S-SALUR, Item D-DONASI, and Item A-AJAR
  const divisionRevenues = useMemo(() => {
    let donasiEvents: ItemDonasiEvent[] = INITIAL_ITEM_DONASI_EVENTS;
    try {
      const saved = localStorage.getItem('yppln_item_donasi_events');
      if (saved) donasiEvents = JSON.parse(saved);
    } catch {
      // fallback
    }
    let ajarEvents: ItemAjarEvent[] = INITIAL_ITEM_AJAR_EVENTS;
    try {
      const saved = localStorage.getItem('yppln_item_ajar_events');
      if (saved) ajarEvents = JSON.parse(saved);
    } catch {
      // fallback
    }

    return calculateAllDivisionRevenues(
      divisiNames,
      salurOrders,
      salurItems,
      donasiOrders,
      donasiEvents,
      transaksiAjarList,
      ajarEvents
    );
  }, [divisiNames, salurOrders, salurItems, donasiOrders, transaksiAjarList]);

  // Master: Jenis Item S-SALUR CRUD
  const handleSaveJenisItem = (savedItem: JenisItemSalurItem) => {
    if (editingJenisItem) {
      setJenisItemList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Jenis Item "${savedItem.namaJenis}" berhasil diperbarui`);
    } else {
      setJenisItemList((prev) => [savedItem, ...prev]);
      showToast(`Jenis Item "${savedItem.namaJenis}" berhasil ditambahkan`);
    }
    setIsAddJenisItemOpen(false);
    setEditingJenisItem(null);
  };

  const handleDeleteJenisItem = (id: string) => {
    setJenisItemList((prev) => prev.filter((x) => x.id !== id));
    showToast('Jenis Item berhasil dihapus');
  };

  // Master: Sub-Jenis Item S-SALUR CRUD
  const handleSaveSubJenisItem = (savedItem: SubJenisItemSalurItem) => {
    if (editingSubJenisItem) {
      setSubJenisItemList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Sub-Jenis Item "${savedItem.namaSubJenis}" berhasil diperbarui`);
    } else {
      setSubJenisItemList((prev) => [savedItem, ...prev]);
      showToast(`Sub-Jenis Item "${savedItem.namaSubJenis}" berhasil ditambahkan`);
    }
    setIsAddSubJenisItemOpen(false);
    setEditingSubJenisItem(null);
  };

  const handleDeleteSubJenisItem = (id: string) => {
    setSubJenisItemList((prev) => prev.filter((x) => x.id !== id));
    showToast('Sub-Jenis Item berhasil dihapus');
  };

  // Master: Jenis Kategori Item CRUD
  const handleSaveJenisKategori = (savedItem: JenisKategoriItemSalurItem) => {
    if (editingJenisKategori) {
      setJenisKategoriList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Jenis Kategori "${savedItem.namaJenisKategori}" berhasil diperbarui`);
    } else {
      setJenisKategoriList((prev) => [savedItem, ...prev]);
      showToast(`Jenis Kategori "${savedItem.namaJenisKategori}" berhasil ditambahkan`);
    }
    setIsAddJenisKategoriOpen(false);
    setEditingJenisKategori(null);
  };

  const handleDeleteJenisKategori = (id: string) => {
    setJenisKategoriList((prev) => prev.filter((x) => x.id !== id));
    showToast('Jenis Kategori berhasil dihapus');
  };

  // Master: Kategori Item S-SALUR CRUD
  const handleSaveKategoriItem = (savedItem: KategoriItemSalurItem) => {
    if (editingKategoriItem) {
      setKategoriItemList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Kategori Item "${savedItem.namaKategori}" berhasil diperbarui`);
    } else {
      setKategoriItemList((prev) => [savedItem, ...prev]);
      showToast(`Kategori Item "${savedItem.namaKategori}" berhasil ditambahkan`);
    }
    setIsAddKategoriItemOpen(false);
    setEditingKategoriItem(null);
  };

  const handleDeleteKategoriItem = (id: string) => {
    setKategoriItemList((prev) => prev.filter((x) => x.id !== id));
    showToast('Kategori Item berhasil dihapus');
  };

  // Master: Via Transaksi S-SALUR CRUD
  const handleSaveViaSalur = (savedItem: ViaTransaksiSalurItem) => {
    if (editingViaSalur) {
      setViaSalurList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Via Transaksi "${savedItem.namaVia}" berhasil diperbarui`);
    } else {
      setViaSalurList((prev) => [savedItem, ...prev]);
      showToast(`Via Transaksi "${savedItem.namaVia}" berhasil ditambahkan`);
    }
    setIsAddViaSalurOpen(false);
    setEditingViaSalur(null);
  };

  const handleDeleteViaSalur = (id: string) => {
    setViaSalurList((prev) => prev.filter((x) => x.id !== id));
    showToast('Via Transaksi berhasil dihapus');
  };

  // Master: Jenis Via Transaksi S-SALUR CRUD
  const handleSaveJenisViaSalur = (savedItem: JenisViaSalurItem) => {
    if (editingJenisViaSalur) {
      setJenisViaSalurList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Jenis Via Transaksi "${savedItem.namaJenisVia}" berhasil diperbarui`);
    } else {
      setJenisViaSalurList((prev) => [savedItem, ...prev]);
      showToast(`Jenis Via Transaksi "${savedItem.namaJenisVia}" berhasil ditambahkan`);
    }
    setIsAddJenisViaSalurOpen(false);
    setEditingJenisViaSalur(null);
  };

  const handleDeleteJenisViaSalur = (id: string) => {
    setJenisViaSalurList((prev) => prev.filter((x) => x.id !== id));
    showToast('Jenis Via Transaksi berhasil dihapus');
  };

  // Master: Via Transaksi D-DONASI CRUD
  const handleSaveViaDonasi = (savedItem: ViaTransaksiDonasiItem) => {
    if (editingViaDonasi) {
      setViaDonasiList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Via Transaksi "${savedItem.namaVia}" berhasil diperbarui`);
    } else {
      setViaDonasiList((prev) => [savedItem, ...prev]);
      showToast(`Via Transaksi "${savedItem.namaVia}" berhasil ditambahkan`);
    }
    setIsAddViaDonasiOpen(false);
    setEditingViaDonasi(null);
  };

  const handleDeleteViaDonasi = (id: string) => {
    setViaDonasiList((prev) => prev.filter((x) => x.id !== id));
    showToast('Via Transaksi D-DONASI berhasil dihapus');
  };

  // Master: Jenis Via Transaksi D-DONASI CRUD
  const handleSaveJenisViaDonasi = (savedItem: JenisViaDonasiItem) => {
    if (editingJenisViaDonasi) {
      setJenisViaDonasiList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Jenis Via Transaksi "${savedItem.namaJenisVia}" berhasil diperbarui`);
    } else {
      setJenisViaDonasiList((prev) => [savedItem, ...prev]);
      showToast(`Jenis Via Transaksi "${savedItem.namaJenisVia}" berhasil ditambahkan`);
    }
    setIsAddJenisViaDonasiOpen(false);
    setEditingJenisViaDonasi(null);
  };

  const handleDeleteJenisViaDonasi = (id: string) => {
    setJenisViaDonasiList((prev) => prev.filter((x) => x.id !== id));
    showToast('Jenis Via Transaksi D-DONASI berhasil dihapus');
  };

  // Master: Via Transaksi A-AJAR CRUD
  const handleSaveViaAjar = (savedItem: ViaTransaksiAjarItem) => {
    if (editingViaAjar) {
      setViaAjarList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Via Transaksi "${savedItem.namaVia}" berhasil diperbarui`);
    } else {
      setViaAjarList((prev) => [savedItem, ...prev]);
      showToast(`Via Transaksi "${savedItem.namaVia}" berhasil ditambahkan`);
    }
    setIsAddViaAjarOpen(false);
    setEditingViaAjar(null);
  };

  const handleDeleteViaAjar = (id: string) => {
    setViaAjarList((prev) => prev.filter((x) => x.id !== id));
    showToast('Via Transaksi A-AJAR berhasil dihapus');
  };

  // Master: Jenis Via Transaksi A-AJAR CRUD
  const handleSaveJenisViaAjar = (savedItem: JenisViaAjarItem) => {
    if (editingJenisViaAjar) {
      setJenisViaAjarList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Jenis Via Transaksi "${savedItem.namaJenisVia}" berhasil diperbarui`);
    } else {
      setJenisViaAjarList((prev) => [savedItem, ...prev]);
      showToast(`Jenis Via Transaksi "${savedItem.namaJenisVia}" berhasil ditambahkan`);
    }
    setIsAddJenisViaAjarOpen(false);
    setEditingJenisViaAjar(null);
  };

  const handleDeleteJenisViaAjar = (id: string) => {
    setJenisViaAjarList((prev) => prev.filter((x) => x.id !== id));
    showToast('Jenis Via Transaksi A-AJAR berhasil dihapus');
  };

  // Mutasi Bank CRUD
  const handleSaveMutasi = (savedItem: MutasiItem) => {
    if (editingMutasi) {
      setMutasiItems((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Data mutasi tanggal ${savedItem.date} berhasil diperbarui`);
    } else {
      setMutasiItems((prev) => [savedItem, ...prev]);
      showToast('Data mutasi baru berhasil ditambahkan');
    }
    setIsAddMutasiOpen(false);
    setEditingMutasi(null);
  };

  const handleDeleteMutasi = (id: string) => {
    setMutasiItems((prev) => prev.filter((x) => x.id !== id));
    showToast('Data mutasi berhasil dihapus');
  };

  const handleImportMutasi = (
    newItems: MutasiItem[],
    mode: 'append' | 'replace',
    targetBank?: string
  ) => {
    if (mode === 'replace' && targetBank) {
      setMutasiItems((prev) => [
        ...prev.filter((item) => item.bankAccount !== targetBank),
        ...newItems,
      ]);
    } else {
      setMutasiItems((prev) => [...prev, ...newItems]);
    }
    showToast(`${newItems.length} data mutasi berhasil di-import`);
  };

  // Rekening Bank CRUD
  const handleSaveRekening = (savedItem: RekeningItem) => {
    if (editingRekening) {
      setRekeningList((prev) =>
        prev.map((x) => (x.id === savedItem.id ? savedItem : x))
      );
      showToast(`Rekening "${savedItem.nama}" berhasil diperbarui`);
    } else {
      setRekeningList((prev) => [savedItem, ...prev]);
      showToast(`Rekening "${savedItem.nama}" berhasil ditambahkan`);
    }
    setIsAddRekeningOpen(false);
    setEditingRekening(null);
  };

  const handleDeleteRekening = (id: string) => {
    setRekeningList((prev) => prev.filter((x) => x.id !== id));
    showToast('Rekening berhasil dihapus');
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Tanggal',
      'Date Range Persiapan',
      'Nama Kegiatan',
      'Jenis Proyek',
      'Divisi',
      'Lokasi',
      'Status',
    ];
    const rows = projects.map((p) => [
      p.id,
      `"${p.tanggal}"`,
      `"${p.dateRangePersiapan}"`,
      `"${p.namaKegiatan}"`,
      `"${p.jenisProyek}"`,
      `"${p.divisi}"`,
      `"${p.lokasi}"`,
      `"${p.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'proyek_sapa_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh');
  };

  // Filter projects based on search query, divisi, and status
  const filteredProjects = projects.filter((item) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.namaKegiatan.toLowerCase().includes(q) ||
        item.jenisProyek.toLowerCase().includes(q) ||
        item.divisi.toLowerCase().includes(q) ||
        item.lokasi.toLowerCase().includes(q) ||
        item.tanggal.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Divisi filter
    if (selectedDivisi !== 'ALL' && item.divisi !== selectedDivisi) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  // Header Title mapping
  const getHeaderTitle = () => {
    if (currentView === 'home') return 'Home';
    if (currentView === 'organisasi' || currentView === 'formOrganisasi' || currentView === 'editOrganisasi') return 'Organisasi';
    if (currentView === 'identitas') return 'Identitas';
    if (currentView === 'formIdentitas') return 'Form Identitas';
    if (currentView === 'editIdentitas') return 'Edit Identitas';
    if (currentView === 'mergeDuplicates') return 'Merge Duplicates';
    if (currentView === 'jenisPanggilan') return 'Jenis Panggilan';
    if (currentView === 'triyana') return 'Triyana';
    if (currentView === 'pekerjaan') return 'Pekerjaan';
    if (currentView === 'mengenalYppln') return 'Mengenal YPPLN';
    if (currentView === 'divisi') return 'Divisi';
    if (currentView === 'transaksiSalur') return 'Transaksi S-SALUR';
    if (currentView === 'posKasirTransaksiSalur') return 'POS Kasir Form Transaksi S-SALUR';
    if (currentView === 'listPromoSSalur') return 'List Promo S-SALUR';
    if (currentView === 'formListPromoSSalur') return 'Form List Promo S-SALUR';
    if (currentView === 'resi') return 'Resi';
    if (currentView === 'agenResi') return 'Agen Resi';
    if (currentView === 'formTransaksiSalur') return 'Form Transaksi S-SALUR';
    if (currentView === 'formTransaksiSalurHadiah') return 'Form Transaksi S-SALUR Hadiah';
    if (currentView === 'viaTransaksiSalur') return 'Via Transaksi S-SALUR';
    if (currentView === 'jenisViaTransaksiSalur') return 'Jenis Via Transaksi S-SALUR';
    if (currentView === 'itemSalur') return 'Item S-SALUR';
    if (currentView === 'ongoingCreateItemSalur') return 'Ongoing Create Item S-SALUR';
    if (currentView === 'modalItemSalur') return 'Modal Item S-SALUR';
    if (currentView === 'reportBepSalur') return 'Report BEP Item S-SALUR';
    if (currentView === 'stokItemSalur') return 'Stok Item S-SALUR';
    if (currentView === 'lokasiStokItemSalur') return 'Lokasi Stok Item S_SALUR';
    if (currentView === 'stockInOutSalur') return 'Stock In/Out Stok Item S-SALUR';
    if (currentView === 'formStockInOutSalur') return 'Form Stock In/Out Stok Item S-SALUR';
    if (currentView === 'jenisPerubahanStockSalur') return 'Jenis Perubahan Stock In/Out Stok Item S-SALUR';
    if (currentView === 'namaPercetakanStockSalur') return 'Nama Percetakan Stok Item S-SALUR';
    if (currentView === 'transaksiDonasi') return 'Transaksi D-DONASI';
    if (currentView === 'itemDonasi') return 'Item D-DONASI';
    if (currentView === 'alokasiDonasiSalur') return 'Alokasi D-DONASI ke Item S-SALUR';
    if (currentView === 'transaksiAjar') return 'Transaksi A-AJAR';
    if (currentView === 'formTransaksiAjar') return 'Form Transaksi A-AJAR';
    if (currentView === 'viaTransaksiAjar') return 'Via Transaksi A-AJAR';
    if (currentView === 'jenisViaTransaksiAjar') return 'Jenis Via Transaksi A-AJAR';
    if (currentView === 'itemAjar') return 'Item A-AJAR';
    if (currentView === 'formItemAjar') return 'Item A-AJAR';
    if (currentView === 'subJenisItemAjar') return 'Sub-Jenis Item A-AJAR';
    if (currentView === 'jenisAcaraItemAjar') return 'Jenis Acara Item A-AJAR';
    if (currentView === 'pengisiAcaraItemAjar') return 'Pengisi Acara Item A-AJAR';
    if (currentView === 'formItemDonasi') return 'Form Item D -DONASI';
    if (currentView === 'subJenisItemDonasi') return 'Sub-Jenis Item D-DONASI';
    if (currentView === 'formTransaksiDonasi') return 'Form Transaksi D-DONASI';
    if (currentView === 'viaTransaksiDonasi') return 'Via Transaksi D-DONASI';
    if (currentView === 'jenisViaTransaksiDonasi') return 'Jenis Via Transaksi D-DONASI';
    if (currentView === 'formItemSalur') return 'Form Item S-SALUR';
    if (currentView === 'jenisItemSalur') return 'Jenis Item S-SALUR';
    if (currentView === 'subJenisItemSalur') return 'Sub-Jenis Item S-SALUR';
    if (currentView === 'kategoriItemSalur') return 'Kategori Item S-SALUR';
    if (currentView === 'jenisKategoriItemSalur') return 'Jenis Kategori Item';
    if (currentView === 'form') return 'Form Proyek SAPA';
    if (currentView === 'jenisProyek') return 'Jenis Proyek';
    if (currentView === 'report') return 'Report Proyek';
    if (currentView === 'reportCustomerSalur') return 'Report Customer S-SALUR';
    if (currentView === 'rekening') return 'Rekening';
    if (currentView === 'mutasi') return 'Mutasi';
    if (currentView === 'rincianMutasi') return 'Rincian Mutasi';
    if (currentView === 'laporanKeuangan') return 'Laporan Keuangan';
    if (currentView === 'jurnalUmum') return 'Jurnal Umum (Otomatis Mutasi)';
    if (currentView === 'coa') return 'COA (Chart of Accounts)';
    if (currentView === 'posKeuangan') return 'Pos Keuangan';
    if (currentView === 'posPemasukan') return 'Pos Pemasukan';
    if (currentView === 'posPemasukanSubJenis') return 'Pos Pemasukan per Sub-Jenis Item';
    if (currentView === 'posPengeluaran') return 'Pos Pengeluaran';
    if (currentView === 'kelompokBiayaCoa') return 'Kelompok Biaya COA';
    if (currentView === 'kebutuhanPengeluaran') return 'Kebutuhan Pengeluaran';
    if (currentView === 'kumpulanRekening') return 'Kumpulan Rekening';
    if (currentView === 'pengeluaran') return 'Pengeluaran';
    if (currentView === 'formPengeluaran') return 'Form Pengeluaran';
    if (currentView === 'karyawan') return 'Karyawan';
    if (currentView === 'formCutiKaryawan') return 'Form cuti Karyawan';
    if (currentView === 'rekapAbsensiKaryawan') return 'Rekap Absensi Karyawan';
    if (currentView === 'listAccount') return 'List Account';
    if (currentView === 'formListAccount') return 'Form List Account';
    if (currentView === 'quickReply') return 'Quick Reply';
    if (currentView === 'formQuickReply') return 'Form Quick Reply';
    if (currentView === 'listFaq') return 'List FAQ';
    if (currentView === 'tentangListFaq') return 'Tentang List FAQ';
    if (currentView === 'formListFaq') return 'Form List FAQ';
    if (currentView === 'complaint') return 'Complaint';
    if (currentView === 'formComplaint') return 'Form Complaint';
    if (currentView === 'jenisPerubahanDharmaPatron') return 'Jenis Perubahan Edit Donasi/bulan Dharma Patron Rutin';
    if (currentView === 'formListDharmaPatronRutin') return 'Form List Dharma Patron Rutin';
    if (currentView === 'listDharmaPatronRutin') return 'List Dharma Patron Rutin';
    if (currentView === 'listDatabaseAAjakAll') return 'List Database A-AJAK ALL';
    if (currentView === 'listDatabaseAAjakItemSSebar') return 'List Database A-AJAK Item S-Sebar';
    if (currentView === 'formListDatabaseAAjakItemSSebar') return 'Form List Database A-AJAK Item S-Sebar';
    if (currentView === 'jobAdvanceFormListDatabaseAAjakItemSSebar') return 'Job Advance Form List Database A-AJAK Item S-Sebar';
    if (currentView === 'statusJobAdvanceFormListDatabaseAAjakItemSSebar') return 'Status Job Advance Form List Database A-AJAK Item S-Sebar';
    if (currentView === 'kontenPromosi') return 'Konten Promosi';
    if (currentView === 'listPM') return 'List PM';
    if (currentView === 'pipelinePM') return 'Pipeline List PM';
    if (currentView === 'autoInputListPMKhususSalur') return 'Auto Input List PM Khusus S-SALUR';
    if (currentView === 'formListPM') return 'Form PM';
    if (currentView === 'templatePM') return 'Template PM';
    if (currentView === 'formTemplatePM') return 'Form Template PM';
    if (currentView === 'listGroupFunneling') return 'List Group Funneling';
    if (currentView === 'listNamaGroupFunneling') return 'List Nama Group Funneling';
    if (currentView === 'formListGroupFunneling') return 'Form List Group Funneling';
    if (currentView === 'jenisGroupFunneling') return 'Jenis Group Funneling';
    if (currentView === 'todoList') return 'To-Do List';
    if (currentView === 'formTodoList') return 'Form To-Do List';
    if (currentView === 'calendarTodoList') return 'Calendar To-Do List';
    if (currentView === 'hariKhususCalendarTodoList') return 'Hari Khusus Calendar To-Do List';
    if (currentView === 'jenisNonProyekTodoList') return 'Jenis Non-Proyek To-do List';
    if (currentView === 'timelineProyekSapa') return 'Timeline Proyek SAPA';
    if (currentView === 'reportNamaPelimpahanJasaDonasi') return 'Report Nama Pelimpahan Jasa D-DONASI';
    return 'Proyek SAPA';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Menu Bar / Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => {
          if (view === 'table') {
            setEditingProject(null);
            setTodoProject(null);
          }
          if (view === 'identitas') {
            setEditingIdentitas(null);
          }
          if (view === 'organisasi') {
            setEditingOrganisasi(null);
          }
          setCurrentView(view);
        }}
        projects={projects}
        identitasCount={identitasList.length}
        organisasiCount={organisasiList.length}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Main Content Container */}
        <main className="w-full max-w-[1550px] mx-auto px-3 sm:px-6 md:px-8 py-5 sm:py-7 flex flex-col flex-1">
          {/* Header matching exact layout */}
          <Header
            title={getHeaderTitle()}
            currentView={currentView}
            onSelectView={(view) => setCurrentView(view)}
            onBackToTable={
              currentView === 'formTransaksiAjar'
                ? () => {
                    setEditingTransaksiAjar(null);
                    setCurrentView('transaksiAjar');
                  }
                : currentView === 'formItemAjar' ||
              currentView === 'subJenisItemAjar' ||
              currentView === 'jenisAcaraItemAjar' ||
              currentView === 'pengisiAcaraItemAjar'
                ? () => setCurrentView('itemAjar')
                : currentView === 'formItemDonasi' ||
                  currentView === 'subJenisItemDonasi' ||
                  currentView === 'alokasiDonasiSalur'
                ? () => setCurrentView('itemDonasi')
                : currentView === 'viaTransaksiAjar'
                ? () => setCurrentView('transaksiAjar')
                : currentView === 'jenisViaTransaksiAjar'
                ? () => setCurrentView('viaTransaksiAjar')
                : currentView === 'viaTransaksiDonasi' || currentView === 'jenisViaTransaksiDonasi'
                ? () => setCurrentView('transaksiDonasi')
                : currentView === 'viaTransaksiSalur' || currentView === 'jenisViaTransaksiSalur'
                ? () => setCurrentView('transaksiSalur')
                : currentView === 'formListPromoSSalur'
                ? () => {
                    setEditingPromoSalurItem(null);
                    setCurrentView('listPromoSSalur');
                  }
                : currentView === 'formStockInOutSalur'
                ? () => setCurrentView(previousStockView || 'stockInOutSalur')
                : currentView === 'namaPercetakanStockSalur'
                ? () => setCurrentView('stockInOutSalur')
                : currentView === 'jenisPerubahanStockSalur'
                ? () => setCurrentView('stockInOutSalur')
                : currentView === 'lokasiStokItemSalur' || currentView === 'stockInOutSalur'
                ? () => setCurrentView('stokItemSalur')
                : currentView === 'reportBepSalur'
                ? () => setCurrentView('modalItemSalur')
                : currentView === 'modalItemSalur' || currentView === 'stokItemSalur'
                ? () => setCurrentView('itemSalur')
                : currentView === 'formItemSalur' ||
              currentView === 'jenisItemSalur' ||
              currentView === 'subJenisItemSalur' ||
              currentView === 'kategoriItemSalur' ||
              currentView === 'jenisKategoriItemSalur'
                ? () => setCurrentView('itemSalur')
                : currentView === 'formTransaksiSalur'
                ? () => setCurrentView('transaksiSalur')
                : currentView === 'formTransaksiSalurHadiah'
                ? () => {
                    setSelectedHadiahProject(null);
                    setCurrentView('table');
                  }
                : currentView === 'formTransaksiDonasi'
                ? () => setCurrentView('transaksiDonasi')
                : currentView === 'formOrganisasi' || currentView === 'editOrganisasi'
                ? () => setCurrentView('organisasi')
                : currentView === 'formIdentitas' ||
                  currentView === 'editIdentitas' ||
                  currentView === 'mergeDuplicates' ||
                  currentView === 'jenisPanggilan' ||
                  currentView === 'triyana' ||
                  currentView === 'pekerjaan' ||
                  currentView === 'mengenalYppln'
                ? () => setCurrentView('identitas')
                : currentView === 'posPemasukanSubJenis'
                ? () => setCurrentView('posPemasukan')
                : currentView === 'posPengeluaran' ||
                  currentView === 'kelompokBiayaCoa' ||
                  currentView === 'kebutuhanPengeluaran' ||
                  currentView === 'kumpulanRekening'
                ? () => setCurrentView('pengeluaran')
                : currentView === 'formPengeluaran'
                ? () => {
                    setEditingPengeluaranItem(null);
                    setSelectedPersonForPengeluaran(null);
                    setCurrentView(pengeluaranReturnView || 'pengeluaran');
                  }
                : currentView === 'jenisPerubahanDharmaPatron'
                ? () => setCurrentView('listDharmaPatronRutin')
                : currentView === 'jobAdvanceFormListDatabaseAAjakItemSSebar' ||
                  currentView === 'statusJobAdvanceFormListDatabaseAAjakItemSSebar'
                ? () => setCurrentView('formListDatabaseAAjakItemSSebar')
                : currentView === 'listDatabaseAAjakAll' ||
                  currentView === 'listDatabaseAAjakItemSSebar'
                ? () => setCurrentView('listDharmaPatronRutin')
                : currentView === 'formListDatabaseAAjakItemSSebar'
                ? () => {
                    setEditingVolunteerSSebarItem(null);
                    setCurrentView('listDatabaseAAjakItemSSebar');
                  }
                : currentView === 'formListDharmaPatronRutin'
                ? () => {
                    setEditingDharmaPatronItem(null);
                    setCurrentView('listDharmaPatronRutin');
                  }
                : currentView === 'formListGroupFunneling'
                ? () => setCurrentView(previousFunnelingView)
                : currentView === 'formListPM'
                ? () => setCurrentView('listPM')
                : currentView === 'formTemplatePM'
                ? () => {
                    setEditingTemplatePMItem(null);
                    setCurrentView('templatePM');
                  }
                : currentView === 'kontenPromosi'
                ? () => setCurrentView('listPM')
                : currentView === 'listNamaGroupFunneling'
                ? () => setCurrentView('listGroupFunneling')
                : currentView === 'jenisGroupFunneling'
                ? () => setCurrentView('listGroupFunneling')
                : currentView === 'formTodoList'
                ? () => {
                    setCurrentView(todoProject ? 'table' : 'todoList');
                    setTodoProject(null);
                  }
                : currentView === 'formListAccount'
                ? () => {
                    setEditingAccountItem(null);
                    setCurrentView('listAccount');
                  }
                : currentView === 'listAccount'
                ? undefined
                : currentView === 'formQuickReply'
                ? () => {
                    setEditingQuickReplyItem(null);
                    setCurrentView('quickReply');
                  }
                : currentView === 'quickReply'
                ? undefined
                : currentView === 'formListFaq'
                ? () => {
                    setEditingFaqItem(null);
                    setCurrentView('listFaq');
                  }
                : currentView === 'tentangListFaq'
                ? () => setCurrentView('listFaq')
                : currentView === 'listFaq'
                ? undefined
                : currentView === 'formComplaint'
                ? () => {
                    setEditingComplaintItem(null);
                    setCurrentView('complaint');
                  }
                : currentView === 'complaint'
                ? undefined
                : currentView === 'hariKhususCalendarTodoList'
                ? () => setCurrentView('calendarTodoList')
                : currentView === 'jenisNonProyekTodoList'
                ? () => setCurrentView('todoList')
                : currentView === 'home'
                ? undefined
                : currentView === 'calendarTodoList'
                ? undefined
                : currentView === 'todoList'
                ? undefined
                : currentView === 'form'
                ? () => {
                    setEditingProject(null);
                    setCurrentView(projectFormReturnView);
                  }
                : currentView === 'reportNamaPelimpahanJasaDonasi'
                ? () => setCurrentView('transaksiDonasi')
                : currentView !== 'table'
                ? () => setCurrentView('table')
                : undefined
            }
            onResetData={handleResetData}
            onExportData={handleExportCSV}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />

          {/* View: Home Dashboard */}
          {currentView === 'home' && (
            <HomeView
              currentUser={currentUser}
              currentDivisi={currentDivisi}
              onUpdateCurrentUser={handleUpdateCurrentUser}
              projects={projects}
              identitasList={identitasList}
              organisasiList={organisasiList}
              todoTasks={projectTodos}
              listPMItems={listPMList}
              posKeuanganList={reconciledPosKeuanganList}
              mutasiItems={mutasiItems}
              posPemasukanList={posPemasukanList}
              posPemasukanSubJenisList={posPemasukanSubJenisList}
              salurOrders={salurOrders}
              salurItems={salurItems}
              transaksiAjarList={transaksiAjarList}
              donasiOrders={donasiOrders}
              pengeluaranList={pengeluaranList}
              volunteerSSebarList={volunteerSSebarList}
              onNavigateView={(view) => setCurrentView(view)}
              onOpenProjectReport={(proj) => {
                setReportingProject(proj);
                setCurrentView('report');
              }}
              onOpenProjectDetail={(proj) => {
                setViewingProject(proj);
              }}
              onOpenProjectTodos={(proj) => {
                setTodoProject(proj);
                setCurrentView('todoList');
              }}
              onToggleTodoCompleted={(projId, taskId) => {
                handleToggleTodoComplete(projId, taskId, null);
              }}
              onShowToast={showToast}
            />
          )}

          {/* View 1: Main Proyek SAPA Table */}
          {currentView === 'table' && (
            <>
              {/* Toolbar with EyeOff, Search, Sliders, + Add */}
              <div className="mt-2 sm:mt-4">
                <TableToolbar
                  onAddClick={() => {
                    setEditingProject(null);
                    setProjectFormReturnView('table');
                    setCurrentView('form');
                  }}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  columnVisibility={columnVisibility}
                  onToggleColumn={handleToggleColumn}
                  selectedDivisi={selectedDivisi}
                  onSelectDivisi={setSelectedDivisi}
                  divisiOptions={divisiNames}
                  selectedStatus={selectedStatus}
                  onSelectStatus={setSelectedStatus}
                />
              </div>

              {/* Table matching image */}
              <div className="mt-1">
                <ProjectTable
                  projects={filteredProjects}
                  columnVisibility={columnVisibility}
                  onEditProject={(proj) => {
                    setEditingProject(proj);
                    setProjectFormReturnView('table');
                    setCurrentView('form');
                  }}
                  onDeleteProject={handleDeleteProject}
                  onViewDetail={(proj) => setViewingProject(proj)}
                  onUpdateStatus={handleUpdateStatus}
                  onViewReport={(proj) => {
                    setReportingProject(proj);
                    setCurrentView('report');
                  }}
                  onOpenTodoList={(proj) => {
                    setTodoProject(proj);
                    setCurrentView('formTodoList');
                  }}
                  onKirimHadiah={handleKirimHadiah}
                />
              </div>
            </>
          )}

          {/* View: To-Do List Dashboard matching exact user image */}
          {currentView === 'todoList' && (
            <div className="mt-4 sm:mt-6">
              <TodoListDashboard
                projects={projects}
                projectTodos={projectTodos}
                karyawanList={karyawanList}
                onToggleComplete={handleToggleTodoComplete}
                onOpenFormTodoList={(proj) => {
                  setTodoProject(proj);
                  setCurrentView('formTodoList');
                }}
                onAddNewTodo={() => {
                  setTodoProject(null);
                  setCurrentView('formTodoList');
                }}
                onDeleteTodoItem={handleDeleteTodoItem}
              />
            </div>
          )}

          {/* View: Form To-Do List */}
          {currentView === 'formTodoList' && (
            <div className="mt-4 sm:mt-6">
              <FormTodoList
                project={todoProject}
                projects={projects}
                karyawanList={karyawanList}
                identitasList={identitasList}
                organisasiList={organisasiList}
                initialTasks={todoProject ? (projectTodos[todoProject.id] || getTodosForProject(todoProject.id)) : []}
                jenisProyekList={jenisProyekList}
                jenisNonProyekList={jenisNonProyekList}
                onSave={handleSaveTodoList}
                onCancel={() => {
                  setCurrentView(todoProject ? 'table' : 'todoList');
                  setTodoProject(null);
                }}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* View: Calendar To-Do List */}
          {currentView === 'calendarTodoList' && (
            <div className="mt-4 sm:mt-6">
              <CalendarTodoList
                projects={projects}
                projectTodos={projectTodos}
                karyawanList={karyawanList}
                divisiOptions={divisiNames}
                hariKhususList={hariKhususList}
                onUpdateHariKhususList={(updated) => setHariKhususList(updated)}
                onNavigateToHariKhusus={() => setCurrentView('hariKhususCalendarTodoList')}
                onNavigateToJenisNonProyek={() => setCurrentView('jenisNonProyekTodoList')}
                onOpenFormTodoList={(proj) => {
                  setTodoProject(proj || null);
                  setCurrentView('formTodoList');
                }}
                onUpdateTasks={(projectId, tasks) => {
                  saveTodosForProject(projectId, tasks);
                  setProjectTodos((prev) => ({ ...prev, [projectId]: tasks }));
                }}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* View: Hari Khusus Calendar To-Do List */}
          {currentView === 'hariKhususCalendarTodoList' && (
            <div className="mt-4 sm:mt-6">
              <HariKhususCalendarTodoListView
                items={hariKhususList}
                onSaveItem={handleSaveHariKhususItem}
                onDeleteItem={handleDeleteHariKhususItem}
                onToggleLibur={handleToggleLiburHariKhusus}
                onNavigateToCalendar={() => setCurrentView('calendarTodoList')}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* View: Jenis Non-Proyek To-do List matching image.png */}
          {currentView === 'jenisNonProyekTodoList' && (
            <div className="mt-4 sm:mt-6">
              <JenisNonProyekTodoListTable
                items={jenisNonProyekList}
                onSaveItem={handleSaveJenisNonProyekItem}
                onDeleteItem={handleDeleteJenisNonProyekItem}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* View: Timeline Proyek SAPA (1-Year Weekly Timeline) */}
          {currentView === 'timelineProyekSapa' && (
            <div className="mt-4 sm:mt-6">
              <ProyekSapaTimelineView
                projects={projects}
                divisiOptions={divisiNames}
                onNavigateView={(view) => setCurrentView(view)}
                onAddProject={() => {
                  setEditingProject(null);
                  setProjectFormReturnView('timelineProyekSapa');
                  setCurrentView('form');
                }}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* View 2: Form Proyek SAPA view matching exact images */}
          {currentView === 'form' && (
            <div className="mt-4 sm:mt-6">
              <FormProyekSapa
                initialData={editingProject}
                jenisProyekOptions={jenisProyekList.map((jp) => jp.jenisKegiatan)}
                onAddNewJenisProyek={handleAddNewJenisProyekFromName}
                divisiOptions={divisiNames}
                onSave={handleSaveProject}
                onCancel={() => {
                  setCurrentView(projectFormReturnView);
                  setEditingProject(null);
                }}
              />
            </div>
          )}

          {/* View 3: Table Jenis Proyek matching exact image */}
          {currentView === 'jenisProyek' && (
            <div className="mt-2 sm:mt-4">
              <JenisProyekTable
                items={jenisProyekList}
                onAddClick={() => {
                  setEditingJenisProyek(null);
                  setIsAddJenisProyekOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingJenisProyek(item);
                  setIsAddJenisProyekOpen(true);
                }}
                onDeleteItem={handleDeleteJenisProyek}
                onUpdateTemplate={handleUpdateTemplateTodoList}
              />
            </div>
          )}

          {/* View 4: Report Proyek view matching exact image */}
          {currentView === 'report' && (
            <div className="mt-4 sm:mt-6">
              <ReportProyek
                project={reportingProject || projects[0]}
                onBack={() => {
                  setCurrentView('table');
                }}
              />
            </div>
          )}

          {/* View: Report Customer S-SALUR matching exact user image */}
          {currentView === 'reportCustomerSalur' && (
            <div className="mt-2 sm:mt-4">
              <ReportCustomerSalurDashboard
                onShowToast={(msg) => showToast(msg)}
                onNavigateToTransaksiSalur={() => setCurrentView('transaksiSalur')}
                onKirimPM={handleKirimPMToForm}
                onCreateGroupFunneling={(ids) => handleNavigateToCreateGroupFunneling(ids, 'reportCustomerSalur')}
                onTambahKeGroupFunnelingExisting={handleOpenTambahKeGroupFunnelingExisting}
              />
            </div>
          )}

          {/* View: List Database A-AJAK A-JAR */}
          {currentView === 'listDatabaseAAjakAJar' && (
            <div className="mt-2 sm:mt-4">
              <ListDatabaseAAjakAJarView
                items={volunteerAJarList}
                onSaveItem={handleSaveVolunteerAJar}
                onDeleteItem={handleDeleteVolunteerAJar}
                onDuplicateItem={handleDuplicateVolunteerAJar}
                onShowToast={(msg) => showToast(msg)}
                onKirimPM={handleKirimPMToForm}
                onCreateGroupFunneling={(ids) => handleNavigateToCreateGroupFunneling(ids, 'listDatabaseAAjakAJar')}
                onTambahKeGroupFunnelingExisting={handleOpenTambahKeGroupFunnelingExisting}
              />
            </div>
          )}

          {/* View: Rekening Bank Dashboard matching exact user image */}
          {currentView === 'rekening' && (
            <div className="mt-2 sm:mt-4">
              <RekeningDashboard
                items={rekeningList}
                onAddClick={() => {
                  setEditingRekening(null);
                  setIsAddRekeningOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingRekening(item);
                  setIsAddRekeningOpen(true);
                }}
                onDeleteItem={handleDeleteRekening}
              />
            </div>
          )}

          {/* View: Mutasi Bank Table matching user image */}
          {currentView === 'mutasi' && (
            <div className="mt-2 sm:mt-4">
              <MutasiTable
                items={mutasiItems}
                rekeningList={rekeningList}
                initialBank={activeMutasiBank}
                salurOrders={salurOrders}
                transaksiAjarList={transaksiAjarList}
                donasiOrders={donasiOrders}
                pengeluaranList={pengeluaranList}
                onUpdateMutasiItems={(updated) => {
                  setMutasiItems(updated);
                  try {
                    localStorage.setItem(MUTASI_STORAGE_KEY, JSON.stringify(updated));
                  } catch (e) {
                    console.error('Failed to save mutasi items', e);
                  }
                }}
                onNavigateToRincianMutasi={(bank) => {
                  if (bank && bank !== 'ALL' && !bank.startsWith('GROUP_')) {
                    setActiveMutasiBank(bank);
                  }
                  setCurrentView('rincianMutasi');
                }}
                onAddClick={(bank) => {
                  setActiveMutasiBank(bank);
                  setEditingMutasi(null);
                  setIsAddMutasiOpen(true);
                }}
                onEditItem={(item) => {
                  setActiveMutasiBank(item.bankAccount);
                  setEditingMutasi(item);
                  setIsAddMutasiOpen(true);
                }}
                onDeleteItem={handleDeleteMutasi}
                onImportItems={handleImportMutasi}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Rincian Mutasi matching exact user image */}
          {currentView === 'rincianMutasi' && (
            <div className="mt-2 sm:mt-4">
              <RincianMutasiView
                mutasiItems={mutasiItems}
                salurOrders={salurOrders}
                transaksiAjarList={transaksiAjarList}
                donasiOrders={donasiOrders}
                pengeluaranList={pengeluaranList}
                onUpdateMutasiItems={(updated) => {
                  setMutasiItems(updated);
                  try {
                    localStorage.setItem(MUTASI_STORAGE_KEY, JSON.stringify(updated));
                  } catch (e) {
                    console.error('Failed to save mutasi items', e);
                  }
                }}
                onShowToast={(msg) => showToast(msg)}
                onNavigateToView={(view) => setCurrentView(view as any)}
              />
            </div>
          )}

          {/* View: Laporan Keuangan - Rincian Mutasi Harian, Arus Kas & Jurnal Umum */}
          {(currentView === 'laporanKeuangan' || currentView === 'jurnalUmum') && (
            <div className="mt-2 sm:mt-4">
              <LaporanKeuanganView
                initialTab={currentView === 'jurnalUmum' ? 'jurnal' : 'coa'}
                coaList={coaList}
                onUpdateCoaList={handleUpdateCoaList}
                onNavigateToCoa={() => setCurrentView('coa')}
                mutasiItems={mutasiItems}
                pengeluaranList={pengeluaranList}
                salurOrders={salurOrders}
                donasiOrders={donasiOrders}
                transaksiAjarList={transaksiAjarList}
                posKeuanganList={reconciledPosKeuanganList}
                posPemasukanList={posPemasukanList}
                kebutuhanPengeluaranList={kebutuhanPengeluaranList}
                posPengeluaranList={posPengeluaranList}
                projects={projects}
                jenisProyekList={jenisProyekList}
                onNavigateToMutasi={(bank) => {
                  setActiveMutasiBank(bank);
                  setCurrentView('mutasi');
                }}
                onNavigateToPengeluaran={() => {
                  setCurrentView('pengeluaran');
                }}
              />
            </div>
          )}

          {/* View: Menu COA (Chart of Accounts) - Terkoneksi dengan Laporan Keuangan */}
          {currentView === 'coa' && (
            <div className="mt-2 sm:mt-4">
              <CoaManagementView
                coaList={coaList}
                onUpdateCoaList={handleUpdateCoaList}
                mutasiItems={mutasiItems}
                pengeluaranList={pengeluaranList}
                salurOrders={salurOrders}
                donasiOrders={donasiOrders}
                transaksiAjarList={transaksiAjarList}
                kebutuhanPengeluaranList={kebutuhanPengeluaranList}
                posPengeluaranList={posPengeluaranList}
                projects={projects}
                jenisProyekList={jenisProyekList}
                onNavigateToView={(view) => setCurrentView(view as any)}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Pos Keuangan Table matching exact image */}
          {currentView === 'posKeuangan' && (
            <div className="mt-2 sm:mt-4">
              <PosKeuanganTable
                items={reconciledPosKeuanganList}
                cardLogoConfig={posKeuanganCardLogo}
                onUpdateCardLogo={handleUpdatePosKeuanganCardLogo}
                onAddClick={() => {
                  setEditingPosKeuanganItem(null);
                  setIsAddEditPosKeuanganOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingPosKeuanganItem(item);
                  setIsAddEditPosKeuanganOpen(true);
                }}
                onDeleteItem={handleDeletePosKeuangan}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Pos Pemasukan Table matching exact image */}
          {currentView === 'posPemasukan' && (
            <div className="mt-2 sm:mt-4">
              <PosPemasukanTable
                groups={posPemasukanList}
                cardLogoConfig={posPemasukanCardLogo}
                onUpdateCardLogo={handleUpdatePosPemasukanCardLogo}
                onAddClick={() => {
                  setEditingPosPemasukanGroup(null);
                  setIsAddEditPosPemasukanOpen(true);
                }}
                onEditGroup={(group) => {
                  setEditingPosPemasukanGroup(group);
                  setIsAddEditPosPemasukanOpen(true);
                }}
                onDeleteGroup={handleDeletePosPemasukan}
                onDeleteAllocation={handleDeletePosPemasukanAllocation}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Pos Pemasukan per Sub-Jenis Item Table matching user's image */}
          {currentView === 'posPemasukanSubJenis' && (
            <div className="mt-2 sm:mt-4">
              <PosPemasukanSubJenisTable
                mappings={posPemasukanSubJenisList}
                onAddClick={() => {
                  setEditingPosPemasukanSubJenisItem(null);
                  setIsAddEditPosPemasukanSubJenisOpen(true);
                }}
                onEditMapping={(mapping) => {
                  setEditingPosPemasukanSubJenisItem(mapping);
                  setIsAddEditPosPemasukanSubJenisOpen(true);
                }}
                onDeleteMapping={handleDeletePosPemasukanSubJenis}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Pos Pengeluaran Table */}
          {currentView === 'posPengeluaran' && (
            <div className="mt-2 sm:mt-4">
              <PosPengeluaranTable
                groups={posPengeluaranList}
                cardLogoConfig={posPengeluaranCardLogo}
                onUpdateCardLogo={handleUpdatePosPengeluaranCardLogo}
                onAddClick={() => {
                  setEditingPosPengeluaranGroup(null);
                  setIsAddEditPosPengeluaranOpen(true);
                }}
                onEditGroup={(group) => {
                  setEditingPosPengeluaranGroup(group);
                  setIsAddEditPosPengeluaranOpen(true);
                }}
                onDeleteGroup={handleDeletePosPengeluaran}
                onDeleteAllocation={handleDeletePosPengeluaranAllocation}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Kelompok Biaya COA Table */}
          {currentView === 'kelompokBiayaCoa' && (
            <div className="mt-2 sm:mt-4">
              <KelompokBiayaCoaTable
                items={kelompokBiayaCoaList}
                onSaveItem={handleSaveKelompokBiayaCoa}
                onDeleteItem={handleDeleteKelompokBiayaCoa}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Kebutuhan Pengeluaran Table */}
          {currentView === 'kebutuhanPengeluaran' && (
            <div className="mt-2 sm:mt-4">
              <KebutuhanPengeluaranTable
                items={kebutuhanPengeluaranList}
                posPengeluaranList={posPengeluaranList}
                kelompokBiayaList={kelompokBiayaCoaList}
                coaList={coaList}
                onSaveItem={handleSaveKebutuhanPengeluaran}
                onDeleteItem={handleDeleteKebutuhanPengeluaran}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Pengeluaran Table matching user's image */}
          {currentView === 'pengeluaran' && (
            <div className="mt-2 sm:mt-4">
              <PengeluaranTable
                items={pengeluaranList}
                mutasiList={mutasiItems}
                onUpdateMutasiItems={(updated) => setMutasiItems(updated)}
                onUpdateItems={(updated) => setPengeluaranList(updated)}
                projects={projects}
                onNavigateToProject={(projName) => {
                  const target = typeof projName === 'string'
                    ? projects.find((p) => p.namaKegiatan.toLowerCase() === projName.toLowerCase())
                    : projName;
                  if (target) {
                    setViewingProject(target);
                  } else {
                    showToast(`Proyek SAPA: ${projName}`);
                  }
                }}
                onAddClick={() => {
                  setEditingPengeluaranItem(null);
                  setCurrentView('formPengeluaran');
                }}
                onEditItem={(item) => {
                  setEditingPengeluaranItem(item);
                  setCurrentView('formPengeluaran');
                }}
                onSaveItem={handleSavePengeluaran}
                onDeleteItem={handleDeletePengeluaran}
                onDuplicateItem={handleDuplicatePengeluaran}
                onShowToast={(msg) => showToast(msg)}
                onNavigateToMutasi={() => setCurrentView('mutasi')}
                onNavigateToPosPengeluaran={() => setCurrentView('posPengeluaran')}
                onNavigateToKebutuhanPengeluaran={() => setCurrentView('kebutuhanPengeluaran')}
                onNavigateToKumpulanRekening={() => setCurrentView('kumpulanRekening')}
                onOpenFormPengeluaranForPerson={handleOpenFormPengeluaranForPersonName}
              />
            </div>
          )}

          {/* View: Kumpulan Rekening Table */}
          {currentView === 'kumpulanRekening' && (
            <div className="mt-2 sm:mt-4">
              <KumpulanRekeningTable
                items={kumpulanRekeningList}
                identitasList={identitasList}
                organisasiList={organisasiList}
                onAddClick={() => {
                  setEditingKumpulanRekeningItem(null);
                  setIsAddEditKumpulanRekeningOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingKumpulanRekeningItem(item);
                  setIsAddEditKumpulanRekeningOpen(true);
                }}
                onDeleteItem={handleDeleteKumpulanRekening}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form Pengeluaran matching user screenshot image.png */}
          {currentView === 'formPengeluaran' && (
            <div className="mt-2 sm:mt-4">
              <FormPengeluaranView
                initialItem={editingPengeluaranItem}
                initialPerson={selectedPersonForPengeluaran}
                existingItems={pengeluaranList}
                identitasList={identitasList}
                projects={projects}
                jenisProyekList={jenisProyekList}
                posPengeluaranList={posPengeluaranList}
                kebutuhanPengeluaranList={kebutuhanPengeluaranList}
                kumpulanRekeningList={kumpulanRekeningList}
                divisiPresets={divisiNames}
                onSave={(savedItem) => {
                  handleSavePengeluaran(savedItem);
                  setEditingPengeluaranItem(null);
                  setSelectedPersonForPengeluaran(null);
                  setCurrentView(pengeluaranReturnView || 'pengeluaran');
                }}
                onCancel={() => {
                  setEditingPengeluaranItem(null);
                  setSelectedPersonForPengeluaran(null);
                  setCurrentView(pengeluaranReturnView || 'pengeluaran');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Karyawan matching user's screenshot */}
          {currentView === 'karyawan' && (
            <div className="mt-2 sm:mt-4">
              <KaryawanView
                items={karyawanList}
                onSaveItem={handleSaveKaryawanItem}
                onDeleteItem={handleDeleteKaryawanItem}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form cuti Karyawan */}
          {currentView === 'formCutiKaryawan' && (
            <div className="mt-2 sm:mt-4">
              <FormCutiKaryawanView
                items={cutiKaryawanList}
                karyawanList={karyawanList}
                onSaveItem={handleSaveCutiKaryawanItem}
                onDeleteItem={handleDeleteCutiKaryawanItem}
                onUpdateStatus={handleUpdateCutiStatus}
                onNavigateToKaryawan={() => setCurrentView('karyawan')}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Rekap Absensi Karyawan matching user screenshot */}
          {currentView === 'rekapAbsensiKaryawan' && (
            <div className="mt-2 sm:mt-4">
              <RekapAbsensiKaryawanView
                karyawanList={karyawanList}
                cutiList={cutiKaryawanList}
                hariKhususList={hariKhususList}
                onSaveCutiItem={handleSaveCutiKaryawanItem}
                onNavigateToCuti={() => setCurrentView('formCutiKaryawan')}
                onNavigateToKaryawan={() => setCurrentView('karyawan')}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: List Account matching user's Image 1 */}
          {currentView === 'listAccount' && (
            <div className="mt-2 sm:mt-4">
              <ListAccountView
                items={accountList}
                onAddClick={() => {
                  setEditingAccountItem(null);
                  setCurrentView('formListAccount');
                }}
                onEditClick={(item) => {
                  setEditingAccountItem(item);
                  setCurrentView('formListAccount');
                }}
                onDeleteItem={handleDeleteAccountItem}
                onToggleStatus={handleToggleAccountStatus}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form List Account matching user's Image 2 */}
          {currentView === 'formListAccount' && (
            <div className="mt-2 sm:mt-4">
              <FormListAccount
                editingItem={editingAccountItem}
                onSave={handleSaveAccountItem}
                onCancel={() => {
                  setEditingAccountItem(null);
                  setCurrentView('listAccount');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Quick Reply matching user's Image 1 */}
          {currentView === 'quickReply' && (
            <div className="mt-2 sm:mt-4">
              <QuickReplyView
                items={quickReplyList}
                onAddClick={() => {
                  setEditingQuickReplyItem(null);
                  setCurrentView('formQuickReply');
                }}
                onEditClick={(item) => {
                  setEditingQuickReplyItem(item);
                  setCurrentView('formQuickReply');
                }}
                onDeleteClick={handleDeleteQuickReplyItem}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form Quick Reply matching user's Image 2 */}
          {currentView === 'formQuickReply' && (
            <div className="mt-2 sm:mt-4">
              <FormQuickReply
                editingItem={editingQuickReplyItem}
                onSave={handleSaveQuickReplyItem}
                onCancel={() => {
                  setEditingQuickReplyItem(null);
                  setCurrentView('quickReply');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: List FAQ matching user's Image 1 */}
          {currentView === 'listFaq' && (
            <div className="mt-2 sm:mt-4">
              <ListFaqView
                items={faqList}
                tentangList={tentangFaqList}
                projects={projects}
                onAddClick={() => {
                  setEditingFaqItem(null);
                  setCurrentView('formListFaq');
                }}
                onEditClick={(item) => {
                  setEditingFaqItem(item);
                  setCurrentView('formListFaq');
                }}
                onDeleteClick={handleDeleteFaqItem}
                onManageTentangClick={() => {
                  setCurrentView('tentangListFaq');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Tentang List FAQ matching user's Image 2 */}
          {currentView === 'tentangListFaq' && (
            <div className="mt-2 sm:mt-4">
              <TentangListFaqView
                items={tentangFaqList}
                onBack={() => setCurrentView('listFaq')}
                onSaveItem={handleSaveTentangFaqItem}
                onDeleteItem={handleDeleteTentangFaqItem}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form List FAQ matching user's Image 3 */}
          {currentView === 'formListFaq' && (
            <div className="mt-2 sm:mt-4">
              <FormListFaq
                editingItem={editingFaqItem}
                tentangList={tentangFaqList}
                projects={projects}
                onSave={handleSaveFaqItems}
                onCancel={() => {
                  setEditingFaqItem(null);
                  setCurrentView('listFaq');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Complaint matching user's image */}
          {currentView === 'complaint' && (
            <div className="mt-2 sm:mt-4">
              <ComplaintView
                complaints={complaints}
                onAddComplaint={handleAddComplaint}
                onUpdateComplaint={handleUpdateComplaint}
                onDeleteComplaint={handleDeleteComplaint}
                identitasList={identitasList}
                onShowToast={(msg) => showToast(msg)}
                onAddClick={() => {
                  setEditingComplaintItem(null);
                  setCurrentView('formComplaint');
                }}
                onEditClick={(item) => {
                  setEditingComplaintItem(item);
                  setCurrentView('formComplaint');
                }}
              />
            </div>
          )}

          {/* View: Form Complaint matching user's image */}
          {currentView === 'formComplaint' && (
            <div className="mt-2 sm:mt-4">
              <FormComplaint
                editingItem={editingComplaintItem}
                identitasList={identitasList}
                onSave={handleSaveComplaintFromForm}
                onCancel={() => {
                  setEditingComplaintItem(null);
                  setCurrentView('complaint');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: List Dharma Patron Rutin matching user's image */}
          {currentView === 'listDharmaPatronRutin' && (
            <div className="mt-2 sm:mt-4">
              <DharmaPatronRutinTable
                items={dharmaPatronList}
                identitasList={identitasList}
                organisasiList={organisasiList}
                donasiOrders={donasiOrders}
                mutasiItems={mutasiItems}
                onAddClick={() => {
                  setEditingDharmaPatronItem(null);
                  setCurrentView('formListDharmaPatronRutin');
                }}
                onEditItem={(item) => {
                  setEditingDharmaPatronItem(item);
                  setCurrentView('formListDharmaPatronRutin');
                }}
                onDeleteItem={handleDeleteDharmaPatron}
                onDuplicateItem={handleDuplicateDharmaPatron}
                onSaveDonasi={handleSaveDharmaPatron}
                jenisOptions={jenisPerubahanList.map((j) => j.nama)}
                onNavigateToJenisTable={() => setCurrentView('jenisPerubahanDharmaPatron')}
                onShowToast={(msg) => showToast(msg)}
                onKirimPM={handleKirimPMToForm}
                onCreateGroupFunneling={(ids) => handleNavigateToCreateGroupFunneling(ids, 'listDharmaPatronRutin')}
                onTambahKeGroupFunnelingExisting={handleOpenTambahKeGroupFunnelingExisting}
              />
            </div>
          )}

          {/* View: Jenis Perubahan Edit Donasi/bulan Dharma Patron Rutin matching image.png */}
          {currentView === 'jenisPerubahanDharmaPatron' && (
            <div className="mt-2 sm:mt-4">
              <JenisPerubahanDharmaPatronTable
                items={jenisPerubahanList}
                onSaveItem={handleSaveJenisPerubahan}
                onDeleteItem={handleDeleteJenisPerubahan}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: List Database A-AJAK ALL matching user's image.png */}
          {currentView === 'listDatabaseAAjakAll' && (
            <div className="mt-2 sm:mt-4">
              <ListDatabaseAAjakAllView
                onShowToast={(msg) => showToast(msg)}
                onKirimPM={handleKirimPMToForm}
                onCreateGroupFunneling={(ids) => handleNavigateToCreateGroupFunneling(ids, 'listDatabaseAAjakAll')}
                onTambahKeGroupFunnelingExisting={handleOpenTambahKeGroupFunnelingExisting}
              />
            </div>
          )}

          {/* View: List Database A-AJAK Item S-SEBAR matching user's image */}
          {currentView === 'listDatabaseAAjakItemSSebar' && (
            <div className="mt-2 sm:mt-4">
              <ListDatabaseAAjakItemSSebarView
                items={volunteerSSebarList}
                onSaveItem={handleSaveVolunteerSSebar}
                onDeleteItem={handleDeleteVolunteerSSebar}
                onDuplicateItem={handleDuplicateVolunteerSSebar}
                onAddClick={() => {
                  setEditingVolunteerSSebarItem(null);
                  setCurrentView('formListDatabaseAAjakItemSSebar');
                }}
                onEditClick={(item) => {
                  setEditingVolunteerSSebarItem(item);
                  setCurrentView('formListDatabaseAAjakItemSSebar');
                }}
                onShowToast={(msg) => showToast(msg)}
                onKirimPM={handleKirimPMToForm}
                onCreateGroupFunneling={(ids) => handleNavigateToCreateGroupFunneling(ids, 'listDatabaseAAjakItemSSebar')}
                onTambahKeGroupFunnelingExisting={handleOpenTambahKeGroupFunnelingExisting}
              />
            </div>
          )}

          {/* View: Form List Database A-AJAK Item S-SEBAR matching user's image.png */}
          {currentView === 'formListDatabaseAAjakItemSSebar' && (
            <div className="mt-2 sm:mt-4">
              <FormListDatabaseAAjakItemSSebar
                editingItem={editingVolunteerSSebarItem}
                existingItems={volunteerSSebarList}
                identitasList={identitasList}
                jobAdvanceList={jobAdvanceMasterList}
                statusJobAdvanceList={statusJobAdvanceMasterList}
                onNavigateToJobAdvanceTable={() => setCurrentView('jobAdvanceFormListDatabaseAAjakItemSSebar')}
                onNavigateToStatusJobAdvanceTable={() => setCurrentView('statusJobAdvanceFormListDatabaseAAjakItemSSebar')}
                onCancel={() => {
                  setEditingVolunteerSSebarItem(null);
                  setCurrentView('listDatabaseAAjakItemSSebar');
                }}
                onSave={(savedItem) => {
                  handleSaveVolunteerSSebar(savedItem);
                  setEditingVolunteerSSebarItem(null);
                  setCurrentView('listDatabaseAAjakItemSSebar');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Job Advance Form List Database A-AJAK Item S-Sebar matching Image 1 */}
          {currentView === 'jobAdvanceFormListDatabaseAAjakItemSSebar' && (
            <div className="mt-2 sm:mt-4">
              <JobAdvanceFormListDatabaseAAjakItemSSebarTable
                items={jobAdvanceMasterList}
                onSaveItem={handleSaveJobAdvanceMaster}
                onDeleteItem={handleDeleteJobAdvanceMaster}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Status Job Advance Form List Database A-AJAK Item S-Sebar matching Image 2 */}
          {currentView === 'statusJobAdvanceFormListDatabaseAAjakItemSSebar' && (
            <div className="mt-2 sm:mt-4">
              <StatusJobAdvanceFormListDatabaseAAjakItemSSebarTable
                items={statusJobAdvanceMasterList}
                onSaveItem={handleSaveStatusJobAdvanceMaster}
                onDeleteItem={handleDeleteStatusJobAdvanceMaster}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Konten Promosi matching image.png */}
          {currentView === 'kontenPromosi' && (
            <div className="mt-2 sm:mt-4">
              <KontenPromosiView
                items={kontenPromosiList}
                salurOrders={salurOrders}
                donasiOrders={donasiOrders}
                transaksiAjarList={transaksiAjarList}
                onSaveItem={handleSaveKontenPromosiItem}
                onDeleteItem={handleDeleteKontenPromosiItem}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: List PM matching image.png */}
          {currentView === 'listPM' && (
            <div className="mt-2 sm:mt-4">
              <ListPMView
                items={listPMList}
                identitasList={identitasList}
                salurOrders={salurOrders}
                transaksiAjarList={transaksiAjarList}
                donasiOrders={donasiOrders}
                onSaveItem={handleSaveListPMItem}
                onDeleteItem={handleDeleteListPMItem}
                onBulkDeleteItems={handleBulkDeleteListPMItems}
                onBulkSaveItems={handleBulkSaveListPMItems}
                onShowToast={(msg) => showToast(msg)}
                onAddNew={() => {
                  setFormListPMInitialTarget(null);
                  setFormListPMInitialProject(null);
                  setCurrentView('formListPM');
                }}
                onNavigateToAutoInputSalur={() => setCurrentView('autoInputListPMKhususSalur')}
                onNavigateToFormPMWithProject={(project) => {
                  setFormListPMInitialProject(project);
                  setFormListPMInitialTarget(null);
                  setCurrentView('formListPM');
                }}
              />
            </div>
          )}

          {/* View: Rincian List PM matching image_9f4ade77.png */}
          {(currentView === 'rincianListPM' || currentView === 'detailListPM') && (
            <div className="mt-2 sm:mt-4">
              <RincianListPMView
                items={listPMList}
                identitasList={identitasList}
                salurOrders={salurOrders}
                transaksiAjarList={transaksiAjarList}
                donasiOrders={donasiOrders}
                onSaveItem={handleSaveListPMItem}
                onBulkSaveItems={handleBulkSaveListPMItems}
                onNavigateToListPM={() => setCurrentView('listPM')}
                onShowToast={(msg) => showToast(msg)}
                onNavigateToFormPMWithProject={(project) => {
                  setFormListPMInitialProject(project);
                  setFormListPMInitialTarget(null);
                  setCurrentView('formListPM');
                }}
              />
            </div>
          )}

          {/* View: Pipeline List PM */}
          {currentView === 'pipelinePM' && (
            <div className="mt-2 sm:mt-4">
              <PipelineListPMView
                items={listPMList}
                identitasList={identitasList}
                salurOrders={salurOrders}
                transaksiAjarList={transaksiAjarList}
                donasiOrders={donasiOrders}
                onSaveItem={handleSaveListPMItem}
                onDeleteItem={handleDeleteListPMItem}
                onShowToast={(msg) => showToast(msg)}
                onAddNew={() => {
                  setFormListPMInitialTarget(null);
                  setFormListPMInitialProject(null);
                  setCurrentView('formListPM');
                }}
                onNavigateToTableView={() => setCurrentView('listPM')}
                onNavigateToAutoInputSalur={() => setCurrentView('autoInputListPMKhususSalur')}
                onNavigateToFormPMWithProject={(project) => {
                  setFormListPMInitialProject(project);
                  setFormListPMInitialTarget(null);
                  setCurrentView('formListPM');
                }}
              />
            </div>
          )}

          {/* View: Auto Input List PM Khusus S-SALUR */}
          {currentView === 'autoInputListPMKhususSalur' && (
            <div className="mt-2 sm:mt-4">
              <AutoInputListPMSalurView
                templatePMList={templatePMList}
                salurOrders={salurOrders}
                onAddListPMItems={handleAddListPMItems}
                onShowToast={(msg) => showToast(msg)}
                onNavigateToListPM={() => setCurrentView('listPM')}
              />
            </div>
          )}

          {/* View: Form List PM matching user specification and image.png */}
          {currentView === 'formListPM' && (
            <div className="mt-2 sm:mt-4">
              <FormListPM
                identitasList={identitasList}
                organisasiList={organisasiList}
                karyawanList={karyawanList}
                templatePMList={templatePMList}
                initialTarget={formListPMInitialTarget}
                initialProject={formListPMInitialProject}
                onSave={handleSaveFormListPM}
                onCancel={() => {
                  setFormListPMInitialTarget(null);
                  setFormListPMInitialProject(null);
                  setCurrentView('listPM');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Template PM matching user's screenshot */}
          {currentView === 'templatePM' && (
            <div className="mt-2 sm:mt-4">
              <TemplatePMView
                items={templatePMList}
                listPMItems={listPMList}
                salurOrders={salurOrders}
                onSaveItem={handleSaveTemplatePMItem}
                onDeleteItem={handleDeleteTemplatePMItem}
                onToggleAktif={handleToggleAktifTemplatePM}
                onShowToast={(msg) => showToast(msg)}
                onAddNew={() => {
                  setEditingTemplatePMItem(null);
                  setCurrentView('formTemplatePM');
                }}
                onEditItem={(item) => {
                  setEditingTemplatePMItem(item);
                  setCurrentView('formTemplatePM');
                }}
              />
            </div>
          )}

          {/* View: Form Template PM */}
          {currentView === 'formTemplatePM' && (
            <div className="mt-2 sm:mt-4">
              <FormTemplatePM
                initialItem={editingTemplatePMItem}
                projects={projects}
                onSave={(item) => {
                  handleSaveTemplatePMItem(item);
                  setEditingTemplatePMItem(null);
                  setCurrentView('templatePM');
                  showToast(
                    editingTemplatePMItem
                      ? `Template PM "${item.namaTemplate}" berhasil diperbarui`
                      : `Template PM "${item.namaTemplate}" berhasil ditambahkan`
                  );
                }}
                onCancel={() => {
                  setEditingTemplatePMItem(null);
                  setCurrentView('templatePM');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Timeline PM matching user's image.png */}
          {currentView === 'timelinePM' && (
            <div className="mt-2 sm:mt-4">
              <TimelinePMView
                onNavigateView={(view) => setCurrentView(view)}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form List Dharma Patron Rutin matching user's screenshot */}
          {currentView === 'formListDharmaPatronRutin' && (
            <div className="mt-2 sm:mt-4">
              <FormListDharmaPatronRutin
                editingItem={editingDharmaPatronItem}
                existingItems={dharmaPatronList}
                identitasList={identitasList}
                organisasiList={organisasiList}
                donasiOrders={donasiOrders}
                mutasiItems={mutasiItems}
                onNavigateView={(view) => setCurrentView(view)}
                onSave={handleSaveDharmaPatron}
                onCancel={() => {
                  setEditingDharmaPatronItem(null);
                  setCurrentView('listDharmaPatronRutin');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View 5: Transaksi S-SALUR Dashboard matching Image 1 */}
          {currentView === 'transaksiSalur' && (
            <div className="mt-2 sm:mt-4">
              <TransaksiSalurDashboard
                orders={salurOrders}
                mutasiItems={mutasiItems}
                rekeningList={rekeningList}
                onUpdateOrders={(updated) => setSalurOrders(updated)}
                onUpdateMutasiItems={(updated) => setMutasiItems(updated)}
                onAddNew={() => {
                  setEditingSalurOrder(null);
                  setCurrentView('formTransaksiSalur');
                }}
                onEditOrder={(order) => {
                  setEditingSalurOrder(order);
                  setCurrentView('formTransaksiSalur');
                }}
                onShowToast={(msg) => showToast(msg)}
                onResiSaved={handleAutoInputOnResiSaved}
              />
            </div>
          )}

          {/* View: POS Kasir Form Transaksi S-SALUR */}
          {currentView === 'posKasirTransaksiSalur' && (
            <div className="mt-2 sm:mt-4">
              <PosKasirTransaksiSalur
                projects={projects}
                salurOrders={salurOrders}
                salurProducts={salurItems}
                identitasList={identitasList}
                organisasiList={organisasiList}
                promoList={loadPromoSalur()}
                viaList={viaSalurList}
                transaksiAjarList={INITIAL_TRANSAKSI_AJAR_LIST}
                onSaveOrder={(newOrder, sendResiNow) => {
                  const updatedOrders = [newOrder, ...salurOrders];
                  setSalurOrders(updatedOrders);
                  try {
                    localStorage.setItem(SALUR_ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
                  } catch (e) {
                    console.error('Failed saving salur orders:', e);
                  }
                  if (sendResiNow && newOrder.ekspedisi?.noResi) {
                    handleAutoInputOnResiSaved(newOrder, newOrder.ekspedisi.noResi);
                  }
                }}
                onShowToast={(msg) => showToast(msg)}
                onNavigateToDashboard={() => setCurrentView('transaksiSalur')}
                onNavigateToView={(view) => setCurrentView(view)}
              />
            </div>
          )}

          {/* View: List Promo S-SALUR Dashboard matching screenshot */}
          {currentView === 'listPromoSSalur' && (
            <div className="mt-2 sm:mt-4">
              <ListPromoSalurDashboard
                onShowToast={(msg) => showToast(msg)}
                onNavigateToForm={(promoToEdit) => {
                  setEditingPromoSalurItem(promoToEdit || null);
                  setCurrentView('formListPromoSSalur');
                }}
              />
            </div>
          )}

          {/* View: Form List Promo S-SALUR matching screenshots */}
          {currentView === 'formListPromoSSalur' && (
            <div className="mt-2 sm:mt-4">
              <FormListPromoSalur
                editingPromo={editingPromoSalurItem}
                onCancel={() => {
                  setEditingPromoSalurItem(null);
                  setCurrentView('listPromoSSalur');
                }}
                onSave={(savedPromo) => {
                  const currentPromos = loadPromoSalur();
                  const exists = currentPromos.some((p) => p.id === savedPromo.id);
                  let updated: PromoSalurItem[];
                  if (exists) {
                    updated = currentPromos.map((p) =>
                      p.id === savedPromo.id ? savedPromo : p
                    );
                  } else {
                    updated = [savedPromo, ...currentPromos];
                  }
                  savePromoSalur(updated);
                  setEditingPromoSalurItem(null);
                  setCurrentView('listPromoSSalur');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Resi Dashboard matching screenshot */}
          {currentView === 'resi' && (
            <div className="mt-2 sm:mt-4">
              <ResiDashboard
                salurOrders={salurOrders}
                agenResiList={agenResiList}
                onShowToast={(msg) => showToast(msg)}
                onNavigateToTransaksiSalur={() => setCurrentView('transaksiSalur')}
              />
            </div>
          )}

          {/* View: Agen Resi Dashboard */}
          {currentView === 'agenResi' && (
            <div className="mt-2 sm:mt-4">
              <AgenResiDashboard
                items={agenResiList}
                organisasiList={organisasiList}
                identitasList={identitasList}
                onUpdateItems={(updated) => {
                  setAgenResiList(updated);
                  saveAgenResiItems(updated);
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View 6: Form Transaksi S-SALUR matching Image 2 */}
          {currentView === 'formTransaksiSalur' && (
            <div className="mt-2 sm:mt-4">
              <FormTransaksiSalur
                initialOrder={editingSalurOrder}
                onCancel={() => {
                  setEditingSalurOrder(null);
                  setCurrentView('transaksiSalur');
                }}
                identitasList={identitasList}
                organisasiList={organisasiList}
                onNavigateView={(view) => {
                  setReturnViewAfterAdd('formTransaksiSalur');
                  setCurrentView(view);
                }}
                existingOrders={salurOrders}
                promoList={loadPromoSalur()}
                viaList={viaSalurList}
                onSave={(newOrder, sendNow) => {
                  const targetDate = newOrder.date || '14 Nov 2021';
                  const cleanVia = normalizeVia(newOrder.via);
                  const nextSeq = getUrutanTransaksiPerTahun(salurOrders, targetDate);
                  const gen = generateSalurOrderNumber(
                    cleanVia,
                    targetDate,
                    nextSeq
                  );
                  const fullOrder: SalurOrder = {
                    id: `order-${Date.now()}`,
                    orderNumber: newOrder.orderNumber || gen.orderNumber,
                    via: cleanVia,
                    customerId: newOrder.idPembeli || newOrder.customerId || '10001 Lilo',
                    customerCode: newOrder.idPenerima || newOrder.customerCode || '10001 Lilo',
                    idPembeli: newOrder.idPembeli || newOrder.customerId || '10001 Lilo',
                    idPenerima: newOrder.idPenerima || newOrder.customerCode || '10001 Lilo',
                    date: newOrder.date || '14 Nov 2021',
                    paymentStatus: newOrder.paymentStatus || 'Paid',
                    shippingStatus: newOrder.shippingStatus || (sendNow ? 'Sudah Dikirim' : 'Belum dikirim'),
                    statusBadges: newOrder.statusBadges || ['Paid', 'Paid'],
                    items: newOrder.items || [],
                    alamat: newOrder.alamat || {
                      recipientName: 'Lilo',
                      phone: '+62 812 222 222',
                      street: 'Jl. Bandung Barat tengah No.123',
                      cityProvince: 'Jawa Barat, Indonesia',
                      postalCode: '12345',
                    },
                    ekspedisi: newOrder.ekspedisi || {
                      name: sendNow ? (newOrder.ekspedisi?.name || '') : '',
                      noResi: '-',
                      isShipped: !!sendNow,
                    },
                    totalDana: newOrder.totalDana || 'Rp100.080',
                    costBreakdown: newOrder.costBreakdown,
                    keterangan: newOrder.keterangan,
                  };
                  setSalurOrders((prev) => [fullOrder, ...prev]);
                  if (fullOrder.ekspedisi?.noResi && fullOrder.ekspedisi.noResi !== '-') {
                    syncStockInOutFromSalurOrder(fullOrder, fullOrder.ekspedisi.noResi);
                  }
                  showToast(sendNow ? 'Transaksi berhasil disimpan dan dikirim!' : 'Transaksi berhasil disimpan!');
                  setEditingSalurOrder(null);
                  setCurrentView('transaksiSalur');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form Transaksi S-SALUR Hadiah (Kirim Hadiah dari Proyek SAPA) */}
          {currentView === 'formTransaksiSalurHadiah' && (
            <div className="mt-2 sm:mt-4">
              <FormTransaksiSalurHadiah
                project={selectedHadiahProject}
                projects={projects}
                identitasList={identitasList}
                organisasiList={organisasiList}
                existingOrders={salurOrders}
                onCancel={() => {
                  setSelectedHadiahProject(null);
                  setCurrentView('table');
                }}
                onSave={(newOrder, sendNow, pengeluaranData) => {
                  // 1. Catat ke Transaksi S-SALUR
                  const targetDate = newOrder.date || '15 Nov 2021';
                  const cleanVia = normalizeVia(newOrder.via);
                  const nextSeq = getUrutanTransaksiPerTahun(salurOrders, targetDate);
                  const gen = generateSalurOrderNumber(
                    cleanVia,
                    targetDate,
                    nextSeq
                  );
                  const fullOrder: SalurOrder = {
                    id: `order-${Date.now()}`,
                    orderNumber: newOrder.orderNumber || gen.orderNumber,
                    via: cleanVia,
                    customerId: newOrder.idPembeli || newOrder.customerId || '10001 Lilo',
                    customerCode: newOrder.idPenerima || newOrder.customerCode || '10001 Lilo',
                    idPembeli: newOrder.idPembeli || newOrder.customerId || '10001 Lilo',
                    idPenerima: newOrder.idPenerima || newOrder.customerCode || '10001 Lilo',
                    date: newOrder.date || '15 Nov 2021',
                    paymentStatus: 'Paid',
                    shippingStatus: sendNow ? 'Sudah Dikirim' : 'Belum dikirim',
                    statusBadges: ['Paid', 'Hadiah'],
                    items: newOrder.items || [],
                    alamat: newOrder.alamat || {
                      recipientName: 'Lilo',
                      phone: '0812-234-569',
                      street: 'Jl. Ahmad Batahar Carry No. 123, kel. ABC, kec. ABC, Kota, Provinsi',
                      cityProvince: 'Jawa Barat, Indonesia',
                      postalCode: '12345',
                    },
                    ekspedisi: newOrder.ekspedisi || {
                      name: sendNow ? (newOrder.ekspedisi?.name || '') : '',
                      noResi: '-',
                      isShipped: !!sendNow,
                    },
                    totalDana: newOrder.totalDana || 'Rp354.000',
                    costBreakdown: newOrder.costBreakdown,
                    keterangan: newOrder.keterangan,
                    proyekSapa: pengeluaranData.proyekSapa,
                    jenisPengeluaranHadiah: pengeluaranData.jenisPengeluaranHadiah,
                    isHadiah: true,
                  };

                  setSalurOrders((prev) => [fullOrder, ...prev]);
                  if (fullOrder.ekspedisi?.noResi && fullOrder.ekspedisi.noResi !== '-') {
                    syncStockInOutFromSalurOrder(fullOrder, fullOrder.ekspedisi.noResi);
                  }

                  // 2. Pembayaran transaksi masuk ke pengeluaran Proyek SAPA
                  const numbers = pengeluaranList
                    .map((it) => parseInt(it.no, 10))
                    .filter((n) => !isNaN(n));
                  const nextNo = (numbers.length > 0 ? Math.max(...numbers) + 1 : 196).toString();

                  const targetProj = projects.find((p) => p.namaKegiatan === pengeluaranData.proyekSapa);

                  const newPengeluaranItem: PengeluaranItem = {
                    id: `pengeluaran-${Date.now()}`,
                    tanggal: pengeluaranData.tanggal || '15 Nov 2021',
                    divisi: targetProj?.divisi || 'MAD',
                    posKeluar: 'Proyek SAPA',
                    kebutuhan: `Pengeluaran Hadiah (${pengeluaranData.jenisPengeluaranHadiah})`,
                    keterangan: pengeluaranData.keterangan,
                    nominal: pengeluaranData.nominal,
                    jenis: 'ALL',
                    no: nextNo,
                    noBadgeColor: 'teal',
                    dikeluarkan: 'S-SALUR',
                    proyekSapa: pengeluaranData.proyekSapa,
                    createdAt: new Date().toISOString(),
                  };

                  handleSavePengeluaran(newPengeluaranItem);

                  showToast(
                    sendNow
                      ? 'Transaksi Hadiah S-SALUR berhasil dikirim dan pembayaran masuk ke pengeluaran Proyek SAPA!'
                      : 'Transaksi Hadiah S-SALUR berhasil disimpan dan pembayaran masuk ke pengeluaran Proyek SAPA!'
                  );
                  setSelectedHadiahProject(null);
                  setCurrentView('table');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: List Group Funneling */}
          {currentView === 'listGroupFunneling' && (
            <div className="mt-2 sm:mt-4">
              <ListGroupFunnelingView
                identitasList={identitasList}
                jenisGroupList={jenisGroupList}
                onShowToast={(msg) => showToast(msg)}
                onKirimPM={handleKirimPMToForm}
                onCreateGroupFunneling={(ids) => handleNavigateToCreateGroupFunneling(ids, 'listGroupFunneling')}
                onTambahKeGroupFunnelingExisting={handleOpenTambahKeGroupFunnelingExisting}
                onNavigateToFormListGroupFunneling={() => {
                  handleNavigateToCreateGroupFunneling([], 'listGroupFunneling');
                }}
                onNavigateToIdentitas={(identitasId) => {
                  if (identitasId) {
                    const found = identitasList.find((i) => i.id === identitasId);
                    if (found) {
                      setEditingIdentitas(found);
                      setCurrentView('editIdentitas');
                      return;
                    }
                  }
                  setCurrentView('identitas');
                }}
              />
            </div>
          )}

          {/* View: List Nama Group Funneling */}
          {currentView === 'listNamaGroupFunneling' && (
            <div className="mt-2 sm:mt-4">
              <ListNamaGroupFunnelingView
                jenisGroupList={jenisGroupList}
                onNavigateToFormListGroupFunneling={() => {
                  setPreviousFunnelingView('listNamaGroupFunneling');
                  setCurrentView('formListGroupFunneling');
                }}
                onNavigateToListGroupFunneling={() => setCurrentView('listGroupFunneling')}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form List Group Funneling */}
          {currentView === 'formListGroupFunneling' && (
            <div className="mt-2 sm:mt-4">
              <FormListGroupFunneling
                onCancel={() => {
                  setFunnelingInitialIdentitasIds([]);
                  setCurrentView(previousFunnelingView);
                }}
                onSaveSuccess={() => {
                  setFunnelingInitialIdentitasIds([]);
                  setCurrentView(previousFunnelingView);
                }}
                identitasList={identitasList}
                jenisGroupList={jenisGroupList}
                initialIdentitasIds={funnelingInitialIdentitasIds}
                onNavigateToJenisGroupFunneling={() => setCurrentView('jenisGroupFunneling')}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Jenis Group Funneling */}
          {currentView === 'jenisGroupFunneling' && (
            <div className="mt-2 sm:mt-4">
              <JenisGroupFunnelingTable
                items={jenisGroupList}
                onAddNew={() => {
                  setEditingJenisGroupItem(null);
                  setIsAddEditJenisGroupModalOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingJenisGroupItem(item);
                  setIsAddEditJenisGroupModalOpen(true);
                }}
                onDeleteItem={handleDeleteJenisGroup}
                onToggleAktif={handleToggleAktifJenisGroup}
                onToggleUniqueId={handleToggleUniqueIdJenisGroup}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Item S-SALUR */}
          {currentView === 'itemSalur' && (
            <div className="mt-2 sm:mt-4">
              <ItemSalurView
                items={salurItems}
                identitasList={identitasList}
                subJenisList={subJenisItemList}
                onUpdateSubJenisList={setSubJenisItemList}
                onAddNewItem={() => setCurrentView('formItemSalur')}
                onDeleteItem={(id) => {
                  const targetItem = salurItems.find((it) => it.id === id);
                  setSalurItems((prev) => prev.filter((it) => it.id !== id));
                  try {
                    const currentStok = getStoredStokSalurItems();
                    const filtered = currentStok.filter((si) => si.productId !== id);
                    saveStoredStokSalurItems(filtered);
                  } catch (e) {}

                  // Auto delete COA if it's a paid S-SALUR item
                  const { deletedCoaAccount, updatedCoaList } = autoDeleteCoaForSalurItem(id, salurItems, coaList);
                  if (deletedCoaAccount) {
                    handleUpdateCoaList(updatedCoaList);
                    showToast(
                      `Item "${targetItem?.title || ''}" & Akun COA (${deletedCoaAccount.noAkun} - ${deletedCoaAccount.namaAkun}) berhasil dihapus`
                    );
                  } else {
                    showToast('Item berhasil dihapus');
                  }
                }}
                onNavigateToModalItemSalur={() => setCurrentView('modalItemSalur')}
                onNavigateToStokItemSalur={() => setCurrentView('stokItemSalur')}
                onNavigateToOngoingCreateItemSalur={() => setCurrentView('ongoingCreateItemSalur')}
                onShowToast={(msg) => showToast(msg)}
                onKirimPM={handleKirimPMToForm}
                onCreateGroupFunneling={(ids) => handleNavigateToCreateGroupFunneling(ids, 'itemSalur')}
                onTambahKeGroupFunnelingExisting={handleOpenTambahKeGroupFunnelingExisting}
              />
            </div>
          )}

          {/* View: Ongoing Create Item S-SALUR (Papan Trello & Track PNB) */}
          {currentView === 'ongoingCreateItemSalur' && (
            <div className="mt-2 sm:mt-4">
              <OngoingCreateItemSalurView
                projectsList={projects}
                onShowToast={(msg) => showToast(msg)}
                onNavigateToItemSalur={() => setCurrentView('itemSalur')}
              />
            </div>
          )}

          {/* View: Modal Item S-SALUR matching image.png */}
          {currentView === 'modalItemSalur' && (
            <div className="mt-2 sm:mt-4">
              <ModalItemSalurView
                items={salurItems}
                mutasiItems={mutasiItems}
                salurOrders={salurOrders}
                onUpdateMutasiItems={(updated) => setMutasiItems(updated)}
                onNavigateToMutasi={(bankAccount) => {
                  setActiveMutasiBank(bankAccount);
                  setCurrentView('mutasi');
                  showToast(`Membuka Mutasi Rekening ${bankAccount}`);
                }}
                onNavigateToItemSalur={() => {
                  setCurrentView('itemSalur');
                }}
                onNavigateToReportBepSalur={() => {
                  setCurrentView('reportBepSalur');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Report BEP Item S-SALUR matching exact user screenshot */}
          {currentView === 'reportBepSalur' && (
            <div className="mt-2 sm:mt-4">
              <ReportBepItemSalurView
                salurOrders={salurOrders}
                onNavigateToTransaksiSalur={() => setCurrentView('transaksiSalur')}
                onNavigateToModalItemSalur={() => setCurrentView('modalItemSalur')}
                onNavigateToStokItemSalur={() => setCurrentView('stokItemSalur')}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Stok Item S-SALUR matching image.png */}
          {currentView === 'stokItemSalur' && (
            <div className="mt-2 sm:mt-4">
              <StokItemSalurView
                onShowToast={(msg) => showToast(msg)}
                onNavigateToItemSalur={() => setCurrentView('itemSalur')}
                onNavigateToModalItemSalur={() => setCurrentView('modalItemSalur')}
                onNavigateToLokasiStokSalur={() => setCurrentView('lokasiStokItemSalur')}
                onNavigateToStockInOutSalur={() => setCurrentView('stockInOutSalur')}
                onNavigateToFormStockInOutSalur={() => {
                  setPreviousStockView('stokItemSalur');
                  setCurrentView('formStockInOutSalur');
                }}
                initialGudangFilter={activeStokSalurGudangFilter}
                subJenisList={subJenisItemList}
                salurItems={salurItems}
              />
            </div>
          )}

          {/* View: Lokasi Stok Item S_SALUR matching image.png */}
          {currentView === 'lokasiStokItemSalur' && (
            <div className="mt-2 sm:mt-4">
              <LokasiStokItemSalurView
                onShowToast={(msg) => showToast(msg)}
                onNavigateToStokItemSalur={(selectedGudang) => {
                  setActiveStokSalurGudangFilter(selectedGudang);
                  setCurrentView('stokItemSalur');
                }}
              />
            </div>
          )}

          {/* View: Stock In/Out Stok Item S-SALUR matching image.png */}
          {currentView === 'stockInOutSalur' && (
            <div className="mt-2 sm:mt-4">
              <StockInOutSalurView
                onShowToast={(msg) => showToast(msg)}
                initialJenisPerubahanFilter={activeStockInOutFilter}
                onNavigateToStokItemSalur={(selectedGudang) => {
                  setActiveStokSalurGudangFilter(selectedGudang);
                  setCurrentView('stokItemSalur');
                }}
                onNavigateToLokasiStokSalur={() => setCurrentView('lokasiStokItemSalur')}
                onNavigateToJenisPerubahanSalur={() => setCurrentView('jenisPerubahanStockSalur')}
                onNavigateToNamaPercetakan={() => {
                  setPreviousStockView('stockInOutSalur');
                  setCurrentView('namaPercetakanStockSalur');
                }}
                onNavigateToFormStockInOutSalur={() => {
                  setSelectedFormPercetakan('');
                  setPreviousStockView('stockInOutSalur');
                  setCurrentView('formStockInOutSalur');
                }}
              />
            </div>
          )}

          {/* View: Form Stock In/Out Stok Item S-SALUR matching image.png */}
          {currentView === 'formStockInOutSalur' && (
            <div className="mt-2 sm:mt-4">
              <FormStockInOutSalurView
                onBack={() => setCurrentView(previousStockView || 'stockInOutSalur')}
                onShowToast={(msg) => showToast(msg)}
                initialPercetakan={selectedFormPercetakan}
                onNavigateToNamaPercetakan={() => {
                  setPreviousStockView('formStockInOutSalur');
                  setCurrentView('namaPercetakanStockSalur');
                }}
              />
            </div>
          )}

          {/* View: Nama Percetakan Stok Item S-SALUR */}
          {currentView === 'namaPercetakanStockSalur' && (
            <div className="mt-2 sm:mt-4">
              <NamaPercetakanStockSalurView
                onShowToast={(msg) => showToast(msg)}
                onNavigateToFormStockInOutSalur={(selectedPercetakan) => {
                  setSelectedFormPercetakan(selectedPercetakan || '');
                  setPreviousStockView('namaPercetakanStockSalur');
                  setCurrentView('formStockInOutSalur');
                }}
              />
            </div>
          )}

          {/* View: Jenis Perubahan Stock In/Out Stok Item S-SALUR */}
          {currentView === 'jenisPerubahanStockSalur' && (
            <div className="mt-2 sm:mt-4">
              <JenisPerubahanStockSalurView
                onShowToast={(msg) => showToast(msg)}
                onNavigateToStockInOutSalur={(selectedJenisPerubahan) => {
                  setActiveStockInOutFilter(selectedJenisPerubahan);
                  setCurrentView('stockInOutSalur');
                }}
                onNavigateToStokItemSalur={() => setCurrentView('stokItemSalur')}
              />
            </div>
          )}

          {/* View: Transaksi D-DONASI */}
          {currentView === 'transaksiDonasi' && (
            <div className="mt-2 sm:mt-4">
              <TransaksiDonasiDashboard
                orders={donasiOrders}
                rekeningList={rekeningList}
                mutasiItems={mutasiItems}
                onUpdateMutasiItems={(updated) => setMutasiItems(updated)}
                onUpdateOrders={(updated) => setDonasiOrders(updated)}
                onAddNew={() => setCurrentView('formTransaksiDonasi')}
                onNavigateToReportPelimpahanJasa={() => setCurrentView('reportNamaPelimpahanJasaDonasi')}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Report Nama Pelimpahan Jasa D-DONASI matching exact user mockup */}
          {currentView === 'reportNamaPelimpahanJasaDonasi' && (
            <div className="mt-2 sm:mt-4">
              <ReportNamaPelimpahanJasaDonasiView
                donasiOrders={donasiOrders}
                onNavigateToTransaksiDonasi={() => setCurrentView('transaksiDonasi')}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form Transaksi D-DONASI matching uploaded design */}
          {currentView === 'formTransaksiDonasi' && (
            <div className="mt-2 sm:mt-4">
              <FormTransaksiDonasi
                onCancel={() => setCurrentView('transaksiDonasi')}
                identitasList={identitasList}
                organisasiList={organisasiList}
                onNavigateView={(view) => setCurrentView(view)}
                viaList={viaDonasiList}
                dharmaPatronList={dharmaPatronList}
                existingOrders={donasiOrders}
                onSave={(newOrder) => {
                  const targetDate = newOrder.date || '15 Nov 2021';
                  const cleanVia = normalizeVia(newOrder.via);
                  const nextSeq = getUrutanTransaksiPerTahun(donasiOrders, targetDate);
                  const fullOrder: DonasiOrder = {
                    id: `donasi-${Date.now()}`,
                    orderNumber: newOrder.orderNumber || generateKodeTransaksi('D', cleanVia, targetDate, nextSeq),
                    via: cleanVia,
                    customerId: newOrder.customerId || '10001 Lilo',
                    date: newOrder.date || '15 Nov 2021',
                    statusBadges: newOrder.statusBadges || ['Paid', 'Paid'],
                    items: newOrder.items || [],
                    extraItems: newOrder.extraItems || [],
                    namaDonatur: newOrder.namaDonatur || {
                      badgeDate: newOrder.date || '15 Nov 2021',
                      name: 'Lilo',
                    },
                    keterangan: newOrder.keterangan || {
                      title: 'Dharma Patron Rutin',
                      subtitle: 'Oktober - November',
                    },
                    pelimpahanJasa: newOrder.pelimpahanJasa || {
                      badges: ['Sudah Dikirim'],
                      name: 'Suhu Bhadra Ruci',
                    },
                    totalDana: newOrder.totalDana || 'Rp100.080',
                    notesText: '',
                  };
                  setDonasiOrders((prev) => [fullOrder, ...prev]);
                  showToast('Transaksi D-DONASI berhasil disimpan!');
                  setCurrentView('transaksiDonasi');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form Item S-SALUR */}
          {currentView === 'formItemSalur' && (
            <div className="mt-2 sm:mt-4">
              <FormItemSalur
                onCancel={() => setCurrentView('itemSalur')}
                coaList={coaList}
                onSave={(newItem) => {
                  const { updatedItem, newCoaAccount, updatedCoaList } = autoCreateCoaForSalurItem(newItem, coaList);
                  if (newCoaAccount) {
                    handleUpdateCoaList(updatedCoaList);
                  }
                  setSalurItems((prev) => [updatedItem, ...prev]);
                  try {
                    const currentStok = getStoredStokSalurItems();
                    const exists = currentStok.some(
                      (si) => si.productId === updatedItem.id || si.namaItem.toLowerCase().trim() === updatedItem.title.toLowerCase().trim()
                    );
                    if (!exists) {
                      const stockVal = Number(updatedItem.stock) || 0;
                      const newStokItem: StokSalurItem = {
                        id: `stok-salur-${Date.now()}`,
                        productId: updatedItem.id,
                        namaItem: updatedItem.title,
                        subtitle: updatedItem.subtitle || `Buku, ${updatedItem.code || 'BSM - 2026'}`,
                        subJenis: updatedItem.subJenis || updatedItem.subJenisItem || 'Buku Berbayar',
                        stok: stockVal,
                        jumlahLokasi: stockVal > 0 ? 1 : 0,
                        jumlahContainer: stockVal > 0 ? 1 : 0,
                        keterangan: '-',
                        containers:
                          stockVal > 0
                            ? [
                                {
                                  id: `cont-${Date.now()}`,
                                  namaContainer: 'Container A',
                                  lokasiGudang: 'Rumah Tsa-Tsa',
                                  jenisLokasi: 'Gudang YPPLN',
                                  stok: stockVal,
                                  keterangan: '-',
                                },
                              ]
                            : [],
                      };
                      saveStoredStokSalurItems([newStokItem, ...currentStok]);
                    }
                  } catch (e) {
                    console.error('Failed to register item in stok salur:', e);
                  }
                  showToast(
                    newCoaAccount
                      ? `Item "${updatedItem.title}" & Akun COA ${newCoaAccount.noAkun} (${newCoaAccount.namaAkun}) berhasil disimpan!`
                      : `Item "${updatedItem.title}" berhasil disimpan!`
                  );
                  setCurrentView('itemSalur');
                }}
                onShowToast={(msg) => showToast(msg)}
                jenisItemList={jenisItemList}
                subJenisItemList={subJenisItemList}
                jenisKategoriItemList={jenisKategoriList}
                kategoriItemListData={kategoriItemList}
              />
            </div>
          )}

          {/* View: Table Jenis Item S-SALUR */}
          {currentView === 'jenisItemSalur' && (
            <div className="mt-2 sm:mt-4">
              <JenisItemSalurTable
                items={jenisItemList}
                onAddClick={() => {
                  setEditingJenisItem(null);
                  setIsAddJenisItemOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingJenisItem(item);
                  setIsAddJenisItemOpen(true);
                }}
                onDeleteItem={handleDeleteJenisItem}
              />
            </div>
          )}

          {/* View: Table Sub-Jenis Item S-SALUR */}
          {currentView === 'subJenisItemSalur' && (
            <div className="mt-2 sm:mt-4">
              <SubJenisItemSalurTable
                items={subJenisItemList}
                jenisItemList={jenisItemList}
                onAddClick={() => {
                  setEditingSubJenisItem(null);
                  setIsAddSubJenisItemOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingSubJenisItem(item);
                  setIsAddSubJenisItemOpen(true);
                }}
                onDeleteItem={handleDeleteSubJenisItem}
              />
            </div>
          )}

          {/* View: Table Kategori Item S-SALUR */}
          {currentView === 'kategoriItemSalur' && (
            <div className="mt-2 sm:mt-4">
              <KategoriItemSalurTable
                items={kategoriItemList}
                jenisKategoriList={jenisKategoriList}
                onAddClick={() => {
                  setEditingKategoriItem(null);
                  setIsAddKategoriItemOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingKategoriItem(item);
                  setIsAddKategoriItemOpen(true);
                }}
                onDeleteItem={handleDeleteKategoriItem}
              />
            </div>
          )}

          {/* View: Table Jenis Kategori Item S-SALUR */}
          {currentView === 'jenisKategoriItemSalur' && (
            <div className="mt-2 sm:mt-4">
              <JenisKategoriItemSalurTable
                items={jenisKategoriList}
                onAddClick={() => {
                  setEditingJenisKategori(null);
                  setIsAddJenisKategoriOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingJenisKategori(item);
                  setIsAddJenisKategoriOpen(true);
                }}
                onDeleteItem={handleDeleteJenisKategori}
              />
            </div>
          )}

          {/* View: Table Via Transaksi S-SALUR */}
          {currentView === 'viaTransaksiSalur' && (
            <div className="mt-2 sm:mt-4">
              <ViaTransaksiSalurTable
                items={viaSalurList}
                onAddClick={() => {
                  setEditingViaSalur(null);
                  setIsAddViaSalurOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingViaSalur(item);
                  setIsAddViaSalurOpen(true);
                }}
                onDeleteItem={handleDeleteViaSalur}
              />
            </div>
          )}

          {/* View: Table Jenis Via Transaksi S-SALUR */}
          {currentView === 'jenisViaTransaksiSalur' && (
            <div className="mt-2 sm:mt-4">
              <JenisViaTransaksiSalurTable
                items={jenisViaSalurList}
                onAddClick={() => {
                  setEditingJenisViaSalur(null);
                  setIsAddJenisViaSalurOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingJenisViaSalur(item);
                  setIsAddJenisViaSalurOpen(true);
                }}
                onDeleteItem={handleDeleteJenisViaSalur}
              />
            </div>
          )}

          {/* View: Table Via Transaksi D-DONASI */}
          {currentView === 'viaTransaksiDonasi' && (
            <div className="mt-2 sm:mt-4">
              <ViaTransaksiDonasiTable
                items={viaDonasiList}
                onAddClick={() => {
                  setEditingViaDonasi(null);
                  setIsAddViaDonasiOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingViaDonasi(item);
                  setIsAddViaDonasiOpen(true);
                }}
                onDeleteItem={handleDeleteViaDonasi}
                onToggleKirimResi={(item) => {
                  const newStatus = !item.kirimResi;
                  setViaDonasiList((prev) =>
                    prev.map((v) => (v.id === item.id ? { ...v, kirimResi: newStatus } : v))
                  );
                  showToast(
                    `Kirim Resi untuk "${item.namaVia}": ${
                      newStatus ? 'Checklist' : 'Tidak'
                    }`
                  );
                }}
              />
            </div>
          )}

          {/* View: Table Jenis Via Transaksi D-DONASI */}
          {currentView === 'jenisViaTransaksiDonasi' && (
            <div className="mt-2 sm:mt-4">
              <JenisViaTransaksiDonasiTable
                items={jenisViaDonasiList}
                onAddClick={() => {
                  setEditingJenisViaDonasi(null);
                  setIsAddJenisViaDonasiOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingJenisViaDonasi(item);
                  setIsAddJenisViaDonasiOpen(true);
                }}
                onDeleteItem={handleDeleteJenisViaDonasi}
              />
            </div>
          )}

          {/* View: Item D-DONASI matching exact image */}
          {currentView === 'itemDonasi' && (
            <div className="mt-2 sm:mt-4">
              <ItemDonasiView
                onShowToast={(msg) => showToast(msg)}
                onAddClick={() => setCurrentView('formItemDonasi')}
                templatePMList={templatePMList}
                onNavigateToFormTemplatePM={(initialData) => {
                  setEditingTemplatePMItem(initialData as any);
                  setCurrentView('formTemplatePM');
                }}
                onNavigateToAlokasiSalur={(evt, child) => {
                  setSelectedItemDonasiForAlokasi(evt);
                  setSelectedChildForAlokasi(child || null);
                  setCurrentView('alokasiDonasiSalur');
                }}
              />
            </div>
          )}

          {/* View: Alokasi D-DONASI ke Item S-SALUR */}
          {currentView === 'alokasiDonasiSalur' && (
            <div className="mt-2 sm:mt-4">
              <AlokasiDonasiSalurView
                itemDonasi={selectedItemDonasiForAlokasi || INITIAL_ITEM_DONASI_EVENTS[0]}
                allItemDonasiEvents={INITIAL_ITEM_DONASI_EVENTS}
                selectedChild={selectedChildForAlokasi}
                salurItems={salurItems}
                identitasList={identitasList}
                existingSalurOrders={salurOrders}
                onSaveAlokasi={(newSalurOrder) => {
                  // 1. Add directly to Transaksi S-SALUR
                  setSalurOrders((prev) => [newSalurOrder, ...prev]);

                  // 2. Decrement stock from salur items
                  setSalurItems((prev) =>
                    prev.map((item) => {
                      const allocated = newSalurOrder.items.find((it) => it.productId === item.id);
                      if (allocated) {
                        return {
                          ...item,
                          stock: Math.max(0, item.stock - allocated.quantity),
                        };
                      }
                      return item;
                    })
                  );

                  // 3. Navigate directly to Transaksi S-SALUR
                  setCurrentView('transaksiSalur');
                }}
                onCancel={() => setCurrentView('itemDonasi')}
                onNavigateToTransaksiSalur={() => setCurrentView('transaksiSalur')}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Template Tanda Terima D-DONASI */}
          {currentView === 'templateTandaTerimaDonasi' && (
            <div className="mt-2 sm:mt-4">
              <TemplateTandaTerimaDonasiView
                templatePMList={templatePMList}
                projects={projects}
                onNavigateView={(view) => setCurrentView(view)}
                onNavigateToFormTemplatePM={(initialData) => {
                  setEditingTemplatePMItem(initialData as any);
                  setCurrentView('formTemplatePM');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Transaksi A-AJAR matching user's image */}
          {currentView === 'transaksiAjar' && (
            <div className="mt-2 sm:mt-4">
              <TransaksiAjarDashboard
                items={transaksiAjarList}
                rekeningList={rekeningList}
                mutasiItems={mutasiItems}
                onUpdateMutasiItems={(updated) => setMutasiItems(updated)}
                onUpdateItems={handleUpdateTransaksiAjar}
                onShowToast={(msg) => showToast(msg)}
                onAddNew={() => {
                  setEditingTransaksiAjar(null);
                  setCurrentView('formTransaksiAjar');
                }}
                onEditOrder={(item) => {
                  setEditingTransaksiAjar(item);
                  setCurrentView('formTransaksiAjar');
                }}
              />
            </div>
          )}

          {/* View: Form Transaksi A-AJAR matching user's image */}
          {currentView === 'formTransaksiAjar' && (
            <div className="mt-2 sm:mt-4">
              <FormTransaksiAjar
                initialData={editingTransaksiAjar}
                existingItems={transaksiAjarList}
                identitasList={identitasList}
                organisasiList={organisasiList}
                onNavigateView={(view) => {
                  setReturnViewAfterAdd('formTransaksiAjar');
                  setCurrentView(view);
                }}
                viaList={viaAjarList}
                itemAjarList={INITIAL_ITEM_AJAR_EVENTS}
                onSave={(savedItem) => {
                  const exists = transaksiAjarList.some((it) => it.id === savedItem.id);
                  let updated: TransaksiAjarItem[];
                  if (exists) {
                    updated = transaksiAjarList.map((it) =>
                      it.id === savedItem.id ? savedItem : it
                    );
                  } else {
                    updated = [savedItem, ...transaksiAjarList];
                  }
                  handleUpdateTransaksiAjar(updated);
                  showToast('Transaksi A-AJAR berhasil disimpan');
                  setEditingTransaksiAjar(null);
                  setCurrentView('transaksiAjar');
                }}
                onCancel={() => {
                  setEditingTransaksiAjar(null);
                  setCurrentView('transaksiAjar');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Table Via Transaksi A-AJAR */}
          {currentView === 'viaTransaksiAjar' && (
            <div className="mt-2 sm:mt-4">
              <ViaTransaksiAjarTable
                items={viaAjarList}
                onAddClick={() => {
                  setEditingViaAjar(null);
                  setIsAddViaAjarOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingViaAjar(item);
                  setIsAddViaAjarOpen(true);
                }}
                onDeleteItem={handleDeleteViaAjar}
              />
            </div>
          )}

          {/* View: Table Jenis Via Transaksi A-AJAR */}
          {currentView === 'jenisViaTransaksiAjar' && (
            <div className="mt-2 sm:mt-4">
              <JenisViaTransaksiAjarTable
                items={jenisViaAjarList}
                onAddClick={() => {
                  setEditingJenisViaAjar(null);
                  setIsAddJenisViaAjarOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingJenisViaAjar(item);
                  setIsAddJenisViaAjarOpen(true);
                }}
                onDeleteItem={handleDeleteJenisViaAjar}
              />
            </div>
          )}

          {/* View: Item A-AJAR matching exact image */}
          {currentView === 'itemAjar' && (
            <div className="mt-2 sm:mt-4">
              <ItemAjarView
                onShowToast={(msg) => showToast(msg)}
                onAddClick={() => setCurrentView('formItemAjar')}
                identitasList={identitasList}
                subJenisList={subJenisAjarList}
                onUpdateSubJenisList={setSubJenisAjarList}
                projects={projects}
              />
            </div>
          )}

          {/* View: Form Item A-AJAR matching exact image */}
          {currentView === 'formItemAjar' && (
            <div className="mt-2 sm:mt-4">
              <FormItemAjar
                onCancel={() => setCurrentView('itemAjar')}
                subJenisList={subJenisAjarList}
                jenisAcaraList={jenisAcaraAjarList}
                onNavigateToSubJenis={() => setCurrentView('subJenisItemAjar')}
                onNavigateToJenisAcara={() => setCurrentView('jenisAcaraItemAjar')}
                onSave={(newEvent: ItemAjarEvent) => {
                  try {
                    const saved = localStorage.getItem('yppln_item_ajar_events');
                    let currentEvents: ItemAjarEvent[] = [];
                    if (saved) {
                      currentEvents = JSON.parse(saved);
                    }
                    const updated = [newEvent, ...currentEvents];
                    localStorage.setItem('yppln_item_ajar_events', JSON.stringify(updated));
                  } catch (err) {
                    console.error('Error saving item ajar:', err);
                  }
                  showToast(`Item A-AJAR "${newEvent.name}" berhasil disimpan`);
                  setCurrentView('itemAjar');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Table Sub-Jenis Item A-AJAR matching Image 1 */}
          {currentView === 'subJenisItemAjar' && (
            <div className="mt-2 sm:mt-4">
              <SubJenisItemAjarTable
                items={subJenisAjarList}
                onAddClick={() => {
                  setEditingSubJenisAjarItem(null);
                  setIsAddEditSubJenisAjarOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingSubJenisAjarItem(item);
                  setIsAddEditSubJenisAjarOpen(true);
                }}
                onDeleteItem={handleDeleteSubJenisAjar}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Table Jenis Acara Item A-AJAR matching Image 2 */}
          {currentView === 'jenisAcaraItemAjar' && (
            <div className="mt-2 sm:mt-4">
              <JenisAcaraItemAjarTable
                items={jenisAcaraAjarList}
                onAddClick={() => {
                  setEditingJenisAcaraAjarItem(null);
                  setIsAddEditJenisAcaraAjarOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingJenisAcaraAjarItem(item);
                  setIsAddEditJenisAcaraAjarOpen(true);
                }}
                onDeleteItem={handleDeleteJenisAcaraAjar}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Table Pengisi Acara Item A-AJAR matching user image */}
          {currentView === 'pengisiAcaraItemAjar' && (
            <div className="mt-2 sm:mt-4">
              <PengisiAcaraItemAjarTable
                items={pengisiAcaraAjarList}
                onAddClick={() => {
                  setEditingPengisiAcaraAjarItem(null);
                  setIsAddEditPengisiAcaraAjarOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingPengisiAcaraAjarItem(item);
                  setIsAddEditPengisiAcaraAjarOpen(true);
                }}
                onDeleteItem={handleDeletePengisiAcaraAjar}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Form Item D-DONASI matching exact image */}
          {currentView === 'formItemDonasi' && (
            <div className="mt-2 sm:mt-4">
              <FormItemDonasi
                onCancel={() => setCurrentView('itemDonasi')}
                subJenisList={subJenisDonasiList}
                onNavigateToSubJenis={() => setCurrentView('subJenisItemDonasi')}
                onSave={(newEvent: ItemDonasiEvent) => {
                  try {
                    const saved = localStorage.getItem('yppln_item_donasi_events');
                    let currentEvents: ItemDonasiEvent[] = [];
                    if (saved) {
                      currentEvents = JSON.parse(saved);
                    }
                    const updated = [newEvent, ...currentEvents];
                    localStorage.setItem('yppln_item_donasi_events', JSON.stringify(updated));
                  } catch (err) {
                    console.error('Error saving item donasi:', err);
                  }
                  showToast(`Item D-DONASI "${newEvent.name}" berhasil disimpan`);
                  setCurrentView('itemDonasi');
                }}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View: Table Sub-Jenis Item D-DONASI matching exact image */}
          {currentView === 'subJenisItemDonasi' && (
            <div className="mt-2 sm:mt-4">
              <SubJenisItemDonasiTable
                items={subJenisDonasiList}
                onAddClick={() => {
                  setEditingSubJenisDonasiItem(null);
                  setIsAddEditSubJenisDonasiOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingSubJenisDonasiItem(item);
                  setIsAddEditSubJenisDonasiOpen(true);
                }}
                onDeleteItem={handleDeleteSubJenisDonasi}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View 7: Identitas Dashboard matching Image 1 */}
          {currentView === 'identitas' && (
            <div className="mt-2 sm:mt-4">
              <IdentitasDashboard
                items={identitasList}
                duplicateCount={totalDuplicateRecordsCount}
                onOpenMergeDuplicates={() => setCurrentView('mergeDuplicates')}
                onAddNew={() => {
                  setEditingIdentitas(null);
                  setCurrentView('formIdentitas');
                }}
                onEditItem={(item) => {
                  setEditingIdentitas(item);
                  setCurrentView('editIdentitas');
                }}
                onDeleteItem={(id) => {
                  setIdentitasList((prev) => prev.filter((it) => it.id !== id));
                  showToast('Identitas berhasil dihapus');
                }}
                onOpenFormPengeluaran={handleOpenFormPengeluaranForPerson}
                onShowToast={(msg) => showToast(msg)}
                onKirimPM={handleKirimPMToForm}
                onCreateGroupFunneling={(ids) => handleNavigateToCreateGroupFunneling(ids, 'identitas')}
                onTambahKeGroupFunnelingExisting={handleOpenTambahKeGroupFunnelingExisting}
                onToggleStarItem={handleToggleStarIdentitas}
              />
            </div>
          )}

          {/* View 8: Form Identitas matching Image */}
          {currentView === 'formIdentitas' && (
            <div className="mt-2 sm:mt-4">
              <FormIdentitas
                initialData={editingIdentitas}
                identitasList={identitasList}
                karyawanList={karyawanList}
                onCancel={() => {
                  if (returnViewAfterAdd) {
                    setCurrentView(returnViewAfterAdd);
                    setReturnViewAfterAdd(null);
                  } else {
                    setCurrentView('identitas');
                  }
                  setEditingIdentitas(null);
                }}
                onSave={(savedItem) => {
                  if (editingIdentitas) {
                    setIdentitasList((prev) =>
                      prev.map((it) => (it.id === savedItem.id ? savedItem : it))
                    );
                    showToast('Data identitas berhasil diperbarui');
                  } else {
                    setIdentitasList((prev) => [savedItem, ...prev]);
                    showToast('Identitas baru berhasil ditambahkan');
                  }
                  if (returnViewAfterAdd) {
                    setCurrentView(returnViewAfterAdd);
                    setReturnViewAfterAdd(null);
                  } else {
                    setCurrentView('identitas');
                  }
                  setEditingIdentitas(null);
                }}
                onShowToast={(msg) => showToast(msg)}
                jenisPanggilanList={jenisPanggilanList}
                triyanaList={triyanaList}
                pekerjaanList={pekerjaanList}
                mengenalYpplnList={mengenalYpplnList}
                onAddNewJenisPanggilan={handleSaveJenisPanggilan}
                onAddNewTriyana={handleSaveTriyana}
                onAddNewPekerjaan={handleSavePekerjaan}
                onAddNewMengenalYppln={handleSaveMengenalYppln}
              />
            </div>
          )}

          {/* View: Edit Identitas with Change Log Audit History matching Image 1 */}
          {currentView === 'editIdentitas' && (
            <div className="mt-2 sm:mt-4">
              <EditIdentitasView
                item={editingIdentitas || identitasList[0]}
                allIdentitasList={identitasList}
                changeLogs={changeLogs}
                onBack={() => {
                  setCurrentView('identitas');
                  setEditingIdentitas(null);
                }}
                onSave={handleSaveEditIdentitas}
                onShowToast={(msg) => showToast(msg)}
                onOpenAddModal={() => {
                  setEditingIdentitas(null);
                  setCurrentView('formIdentitas');
                }}
              />
            </div>
          )}

          {/* View: Merge Duplicates Dashboard matching Image 2 */}
          {currentView === 'mergeDuplicates' && (
            <div className="mt-2 sm:mt-4">
              <MergeDuplicatesView
                pairs={duplicatePairs}
                totalDuplicateRecordsCount={totalDuplicateRecordsCount}
                onBack={() => setCurrentView('identitas')}
                onMergePair={handleMergePair}
                onMergeAll={handleMergeAll}
                onDismissPair={handleDismissPair}
                onEditItem={(item) => {
                  setEditingIdentitas(item);
                  setCurrentView('editIdentitas');
                }}
              />
            </div>
          )}

          {/* View: Organisasi Dashboard */}
          {currentView === 'organisasi' && (
            <div className="mt-2 sm:mt-4">
              <OrganisasiDashboard
                items={organisasiList}
                identitasList={identitasList}
                onAddNew={() => {
                  setEditingOrganisasi(null);
                  setCurrentView('formOrganisasi');
                }}
                onEditItem={(item) => {
                  setEditingOrganisasi(item);
                  setCurrentView('formOrganisasi');
                }}
                onDeleteItem={handleDeleteOrganisasi}
                onShowToast={(msg) => showToast(msg)}
                onSelectIdentitas={(identitasId) => {
                  const idItem = identitasList.find((i) => i.id === identitasId);
                  if (idItem) {
                    setEditingIdentitas(idItem);
                    setCurrentView('editIdentitas');
                  }
                }}
                onKirimPM={handleKirimPMToForm}
                onCreateGroupFunneling={(ids) => handleNavigateToCreateGroupFunneling(ids, 'organisasi')}
                onTambahKeGroupFunnelingExisting={handleOpenTambahKeGroupFunnelingExisting}
                onToggleStarItem={handleToggleStarOrganisasi}
              />
            </div>
          )}

          {/* View: Form Organisasi */}
          {currentView === 'formOrganisasi' && (
            <div className="mt-2 sm:mt-4">
              <FormOrganisasi
                initialData={editingOrganisasi}
                identitasList={identitasList}
                triyanaList={triyanaList}
                karyawanList={karyawanList}
                onCancel={() => {
                  if (returnViewAfterAdd) {
                    setCurrentView(returnViewAfterAdd);
                    setReturnViewAfterAdd(null);
                  } else {
                    setCurrentView('organisasi');
                  }
                  setEditingOrganisasi(null);
                }}
                onSave={handleSaveOrganisasi}
                onShowToast={(msg) => showToast(msg)}
              />
            </div>
          )}

          {/* View 9: Table Jenis Panggilan */}
          {currentView === 'jenisPanggilan' && (
            <div className="mt-2 sm:mt-4">
              <JenisPanggilanTable
                items={jenisPanggilanList}
                onAddClick={() => {
                  setEditingJenisPanggilan(null);
                  setIsAddJenisPanggilanOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingJenisPanggilan(item);
                  setIsAddJenisPanggilanOpen(true);
                }}
                onDeleteItem={handleDeleteJenisPanggilan}
              />
            </div>
          )}

          {/* View 10: Table Triyana */}
          {currentView === 'triyana' && (
            <div className="mt-2 sm:mt-4">
              <TriyanaTable
                items={triyanaList}
                onAddClick={() => {
                  setEditingTriyana(null);
                  setIsAddTriyanaOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingTriyana(item);
                  setIsAddTriyanaOpen(true);
                }}
                onDeleteItem={handleDeleteTriyana}
              />
            </div>
          )}

          {/* View 11: Table Pekerjaan */}
          {currentView === 'pekerjaan' && (
            <div className="mt-2 sm:mt-4">
              <PekerjaanTable
                items={pekerjaanList}
                onAddClick={() => {
                  setEditingPekerjaan(null);
                  setIsAddPekerjaanOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingPekerjaan(item);
                  setIsAddPekerjaanOpen(true);
                }}
                onDeleteItem={handleDeletePekerjaan}
              />
            </div>
          )}

          {/* View 12: Table Mengenal YPPLN */}
          {currentView === 'mengenalYppln' && (
            <div className="mt-2 sm:mt-4">
              <MengenalYpplnTable
                items={mengenalYpplnList}
                onAddClick={() => {
                  setEditingMengenalYppln(null);
                  setIsAddMengenalYpplnOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingMengenalYppln(item);
                  setIsAddMengenalYpplnOpen(true);
                }}
                onDeleteItem={handleDeleteMengenalYppln}
              />
            </div>
          )}

          {/* View: Table Divisi matching user's screenshot */}
          {currentView === 'divisi' && (
            <div className="mt-2 sm:mt-4">
              <DivisiTable
                items={divisiList}
                connectedCounts={divisiConnectedCounts}
                divisionRevenues={divisionRevenues}
                onAddClick={() => {
                  setEditingDivisi(null);
                  setIsAddDivisiOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingDivisi(item);
                  setIsAddDivisiOpen(true);
                }}
                onDeleteItem={handleDeleteDivisi}
              />
            </div>
          )}
        </main>
      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={viewingProject}
        onClose={() => setViewingProject(null)}
        onEdit={(proj) => {
          setEditingProject(proj);
          setCurrentView('form');
          setViewingProject(null);
        }}
      />

      {/* Add / Edit Jenis Proyek Modal */}
      <AddJenisProyekModal
        isOpen={isAddJenisProyekOpen}
        onClose={() => {
          setIsAddJenisProyekOpen(false);
          setEditingJenisProyek(null);
        }}
        onSave={handleSaveJenisProyek}
        editingItem={editingJenisProyek}
        coaList={coaList}
        existingJenisProyek={jenisProyekList}
      />

      {/* Add / Edit Jenis Panggilan Modal */}
      <AddJenisPanggilanModal
        isOpen={isAddJenisPanggilanOpen}
        onClose={() => {
          setIsAddJenisPanggilanOpen(false);
          setEditingJenisPanggilan(null);
        }}
        onSave={handleSaveJenisPanggilan}
        editingItem={editingJenisPanggilan}
      />

      {/* Add / Edit Triyana Modal */}
      <AddMasterItemModal
        isOpen={isAddTriyanaOpen}
        onClose={() => {
          setIsAddTriyanaOpen(false);
          setEditingTriyana(null);
        }}
        title={editingTriyana ? 'Edit Triyana' : 'Tambah Triyana'}
        nameLabel="Triyana"
        namePlaceholder="Contoh: Theravada, Mahayana, Tantrayana..."
        initialName={editingTriyana?.triyana}
        initialKeterangan={editingTriyana?.keterangan}
        onSave={handleSaveTriyana}
      />

      {/* Add / Edit Pekerjaan Modal */}
      <AddMasterItemModal
        isOpen={isAddPekerjaanOpen}
        onClose={() => {
          setIsAddPekerjaanOpen(false);
          setEditingPekerjaan(null);
        }}
        title={editingPekerjaan ? 'Edit Pekerjaan' : 'Tambah Pekerjaan'}
        nameLabel="Nama Pekerjaan"
        namePlaceholder="Contoh: Karyawan Swasta, Wiraswasta, Dokter..."
        initialName={editingPekerjaan?.namaPekerjaan}
        initialKeterangan={editingPekerjaan?.keterangan}
        onSave={handleSavePekerjaan}
      />

      {/* Add / Edit Mengenal YPPLN Modal */}
      <AddMasterItemModal
        isOpen={isAddMengenalYpplnOpen}
        onClose={() => {
          setIsAddMengenalYpplnOpen(false);
          setEditingMengenalYppln(null);
        }}
        title={editingMengenalYppln ? 'Edit Mengenal YPPLN' : 'Tambah Mengenal YPPLN'}
        nameLabel="Mengenal YPPLN"
        namePlaceholder="Contoh: Teman/Keluarga, Instagram, Vihara..."
        initialName={editingMengenalYppln?.mengenalYppln}
        initialKeterangan={editingMengenalYppln?.keterangan}
        onSave={handleSaveMengenalYppln}
      />

      {/* Add / Edit Divisi Modal */}
      <AddMasterItemModal
        isOpen={isAddDivisiOpen}
        onClose={() => {
          setIsAddDivisiOpen(false);
          setEditingDivisi(null);
        }}
        title={editingDivisi ? 'Edit Divisi' : 'Tambah Divisi'}
        nameLabel="Divisi"
        namePlaceholder="Contoh: UMM, PNB, MAD, EVE, FUN..."
        initialName={editingDivisi?.namaDivisi}
        initialKeterangan={editingDivisi?.keterangan}
        onSave={handleSaveDivisi}
      />

      {/* S-SALUR Master Modals */}
      <AddEditJenisItemSalurModal
        isOpen={isAddJenisItemOpen}
        onClose={() => {
          setIsAddJenisItemOpen(false);
          setEditingJenisItem(null);
        }}
        initialData={editingJenisItem}
        onSave={handleSaveJenisItem}
      />

      <AddEditSubJenisItemSalurModal
        isOpen={isAddSubJenisItemOpen}
        onClose={() => {
          setIsAddSubJenisItemOpen(false);
          setEditingSubJenisItem(null);
        }}
        initialData={editingSubJenisItem}
        jenisItemList={jenisItemList}
        onSave={handleSaveSubJenisItem}
      />

      <AddEditJenisKategoriItemSalurModal
        isOpen={isAddJenisKategoriOpen}
        onClose={() => {
          setIsAddJenisKategoriOpen(false);
          setEditingJenisKategori(null);
        }}
        initialData={editingJenisKategori}
        onSave={handleSaveJenisKategori}
      />

      <AddEditKategoriItemSalurModal
        isOpen={isAddKategoriItemOpen}
        onClose={() => {
          setIsAddKategoriItemOpen(false);
          setEditingKategoriItem(null);
        }}
        initialData={editingKategoriItem}
        jenisKategoriList={jenisKategoriList}
        onSave={handleSaveKategoriItem}
      />

      {/* Add / Edit Via Transaksi S-SALUR Modal */}
      <AddEditViaTransaksiSalurModal
        isOpen={isAddViaSalurOpen}
        onClose={() => {
          setIsAddViaSalurOpen(false);
          setEditingViaSalur(null);
        }}
        onSave={handleSaveViaSalur}
        editingItem={editingViaSalur}
        jenisViaList={jenisViaSalurList}
      />

      {/* Add / Edit Jenis Via Transaksi S-SALUR Modal */}
      <AddEditJenisViaTransaksiSalurModal
        isOpen={isAddJenisViaSalurOpen}
        onClose={() => {
          setIsAddJenisViaSalurOpen(false);
          setEditingJenisViaSalur(null);
        }}
        onSave={handleSaveJenisViaSalur}
        editingItem={editingJenisViaSalur}
      />

      {/* Add / Edit Via Transaksi D-DONASI Modal */}
      <AddEditViaTransaksiDonasiModal
        isOpen={isAddViaDonasiOpen}
        onClose={() => {
          setIsAddViaDonasiOpen(false);
          setEditingViaDonasi(null);
        }}
        onSave={handleSaveViaDonasi}
        editingItem={editingViaDonasi}
        jenisViaList={jenisViaDonasiList}
      />

      {/* Add / Edit Jenis Via Transaksi D-DONASI Modal */}
      <AddEditJenisViaTransaksiDonasiModal
        isOpen={isAddJenisViaDonasiOpen}
        onClose={() => {
          setIsAddJenisViaDonasiOpen(false);
          setEditingJenisViaDonasi(null);
        }}
        onSave={handleSaveJenisViaDonasi}
        editingItem={editingJenisViaDonasi}
      />

      {/* Add / Edit Via Transaksi A-AJAR Modal */}
      <AddEditViaTransaksiAjarModal
        isOpen={isAddViaAjarOpen}
        onClose={() => {
          setIsAddViaAjarOpen(false);
          setEditingViaAjar(null);
        }}
        onSave={handleSaveViaAjar}
        editingItem={editingViaAjar}
        jenisViaList={jenisViaAjarList}
      />

      {/* Add / Edit Jenis Via Transaksi A-AJAR Modal */}
      <AddEditJenisViaTransaksiAjarModal
        isOpen={isAddJenisViaAjarOpen}
        onClose={() => {
          setIsAddJenisViaAjarOpen(false);
          setEditingJenisViaAjar(null);
        }}
        onSave={handleSaveJenisViaAjar}
        editingItem={editingJenisViaAjar}
      />

      {/* Add / Edit Rekening Modal */}
      <AddEditRekeningModal
        isOpen={isAddRekeningOpen}
        onClose={() => {
          setIsAddRekeningOpen(false);
          setEditingRekening(null);
        }}
        initialData={editingRekening}
        onSave={handleSaveRekening}
      />

      {/* Add / Edit Mutasi Modal */}
      <AddEditMutasiModal
        isOpen={isAddMutasiOpen}
        onClose={() => {
          setIsAddMutasiOpen(false);
          setEditingMutasi(null);
        }}
        initialData={editingMutasi}
        defaultBank={activeMutasiBank}
        onSave={handleSaveMutasi}
      />

      {/* Add / Edit Sub-Jenis Item D-DONASI Modal */}
      <AddEditSubJenisItemDonasiModal
        isOpen={isAddEditSubJenisDonasiOpen}
        onClose={() => {
          setIsAddEditSubJenisDonasiOpen(false);
          setEditingSubJenisDonasiItem(null);
        }}
        onSave={handleSaveSubJenisDonasi}
        editingItem={editingSubJenisDonasiItem}
      />

      {/* Add / Edit Sub-Jenis Item A-AJAR Modal */}
      <AddEditSubJenisItemAjarModal
        isOpen={isAddEditSubJenisAjarOpen}
        onClose={() => {
          setIsAddEditSubJenisAjarOpen(false);
          setEditingSubJenisAjarItem(null);
        }}
        onSave={handleSaveSubJenisAjar}
        editingItem={editingSubJenisAjarItem}
      />

      {/* Add / Edit Jenis Acara Item A-AJAR Modal */}
      <AddEditJenisAcaraAjarModal
        isOpen={isAddEditJenisAcaraAjarOpen}
        onClose={() => {
          setIsAddEditJenisAcaraAjarOpen(false);
          setEditingJenisAcaraAjarItem(null);
        }}
        onSave={handleSaveJenisAcaraAjar}
        editingItem={editingJenisAcaraAjarItem}
      />

      {/* Add / Edit Pengisi Acara Item A-AJAR Modal */}
      <AddEditPengisiAcaraAjarModal
        isOpen={isAddEditPengisiAcaraAjarOpen}
        onClose={() => {
          setIsAddEditPengisiAcaraAjarOpen(false);
          setEditingPengisiAcaraAjarItem(null);
        }}
        onSave={handleSavePengisiAcaraAjar}
        editingItem={editingPengisiAcaraAjarItem}
      />

      {/* Add / Edit Pos Keuangan Modal */}
      <AddEditPosKeuanganModal
        isOpen={isAddEditPosKeuanganOpen}
        onClose={() => {
          setIsAddEditPosKeuanganOpen(false);
          setEditingPosKeuanganItem(null);
        }}
        onSave={handleSavePosKeuangan}
        editingItem={editingPosKeuanganItem}
        coaList={coaList}
      />

      {/* Add / Edit Pos Pemasukan Modal */}
      <AddEditPosPemasukanModal
        isOpen={isAddEditPosPemasukanOpen}
        onClose={() => {
          setIsAddEditPosPemasukanOpen(false);
          setEditingPosPemasukanGroup(null);
        }}
        onSave={handleSavePosPemasukan}
        editingGroup={editingPosPemasukanGroup}
        posKeuanganList={posKeuanganList}
      />

      {/* Add / Edit Pos Pemasukan per Sub-Jenis Item Modal */}
      <AddEditPosPemasukanSubJenisModal
        isOpen={isAddEditPosPemasukanSubJenisOpen}
        onClose={() => {
          setIsAddEditPosPemasukanSubJenisOpen(false);
          setEditingPosPemasukanSubJenisItem(null);
        }}
        onSave={handleSavePosPemasukanSubJenis}
        editingItem={editingPosPemasukanSubJenisItem}
        subJenisSalurList={subJenisItemList}
        subJenisDonasiList={subJenisDonasiList}
        subJenisAjarList={subJenisAjarList}
        posPemasukanList={posPemasukanList}
      />

      {/* Add / Edit Pos Pengeluaran Modal */}
      <AddEditPosPengeluaranModal
        isOpen={isAddEditPosPengeluaranOpen}
        onClose={() => {
          setIsAddEditPosPengeluaranOpen(false);
          setEditingPosPengeluaranGroup(null);
        }}
        onSave={handleSavePosPengeluaran}
        editingGroup={editingPosPengeluaranGroup}
        posKeuanganList={posKeuanganList}
      />

      {/* Add / Edit Pengeluaran Modal */}
      <AddEditPengeluaranModal
        isOpen={isAddEditPengeluaranOpen}
        onClose={() => {
          setIsAddEditPengeluaranOpen(false);
          setEditingPengeluaranItem(null);
        }}
        onSave={handleSavePengeluaran}
        editingItem={editingPengeluaranItem}
        existingItems={pengeluaranList}
        divisiPresets={divisiNames}
        mutasiList={mutasiItems}
        projects={projects}
        posPengeluaranList={posPengeluaranList}
        kebutuhanPengeluaranList={kebutuhanPengeluaranList}
      />

      {/* Add / Edit Kumpulan Rekening Modal */}
      <AddEditKumpulanRekeningModal
        isOpen={isAddEditKumpulanRekeningOpen}
        onClose={() => {
          setIsAddEditKumpulanRekeningOpen(false);
          setEditingKumpulanRekeningItem(null);
        }}
        onSave={handleSaveKumpulanRekening}
        editingItem={editingKumpulanRekeningItem}
        identitasList={identitasList}
        organisasiList={organisasiList}
      />

      {/* Add / Edit Dharma Patron Rutin Modal */}
      <AddEditDharmaPatronModal
        isOpen={isAddEditDharmaPatronOpen}
        onClose={() => {
          setIsAddEditDharmaPatronOpen(false);
          setEditingDharmaPatronItem(null);
        }}
        onSave={handleSaveDharmaPatron}
        editingItem={editingDharmaPatronItem}
        existingItems={dharmaPatronList}
      />

      {/* Add / Edit Jenis Group Funneling Modal */}
      <AddEditJenisGroupFunnelingModal
        isOpen={isAddEditJenisGroupModalOpen}
        onClose={() => {
          setIsAddEditJenisGroupModalOpen(false);
          setEditingJenisGroupItem(null);
        }}
        onSave={handleSaveJenisGroup}
        editingItem={editingJenisGroupItem}
        existingItems={jenisGroupList}
        onShowToast={(msg) => showToast(msg)}
      />

      {/* Modal Tambah Ke Group Funneling Existing */}
      <ModalTambahKeGroupFunnelingExisting
        isOpen={modalTambahExistingOpen}
        onClose={() => setModalTambahExistingOpen(false)}
        targetMembers={modalTambahExistingTargets}
        identitasList={identitasList}
        onShowToast={(msg) => showToast(msg)}
        onNavigateToCreateNewGroup={() => {
          setModalTambahExistingOpen(false);
          const ids = modalTambahExistingTargets.map((t) => t.identitasId || t.id).filter(Boolean);
          handleNavigateToCreateGroupFunneling(ids);
        }}
      />
    </div>
  );
}

