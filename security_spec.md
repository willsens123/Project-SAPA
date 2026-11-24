# Firestore Security Specification (`erp_state`)

## 1. Data Invariants
1. **Allowlisted Collection IDs**: Only documented ERP collection IDs (`identitas`, `mutasi`, `salur_orders`, `donasi_orders`, `transaksi_ajar`, `pengeluaran`, `pos_keuangan`, `coa_accounts`, `projects`, `organisasi`, `dharma_patron_rutin`, `central_audit_logs`, `merge_session_records`, `identitas_change_logs`, `rbac_permissions`, `member_accounts`, `login_activity_logs`, `sapa_coverage_zones`, `cuti_karyawan`, `stok_salur_items`, `gudang_salur_data`, `stock_in_out_salur`, `lokasi_stok_salur`, `jenis_perubahan_salur`, `connection_test`) are permitted.
2. **No Unscoped Collection Listing or Deletes**: `allow list: if false;` and `allow delete: if false;` block bulk scraping and accidental dataset deletion.
3. **Strict Payload & Anti-Update-Gap Schema**: Every document must match `isValidErpEntity(incoming(), docId)`:
   - Required keys: `['id', 'updatedAt']`
   - Allowed keys: `['id', 'updatedAt', 'items', 'data']`
   - `id == docId` matching `^[a-zA-Z0-9_\-]+$` (1..128 chars)
   - `updatedAt` string (10..64 chars)
   - Bounded `items` list (`<= 1500` items; first element must be `map` when non-empty) and optional `data` string (`<= 500000` bytes).
   - Updates must preserve `incoming().id == existing().id` and only mutate `['updatedAt', 'items', 'data']`.
4. **Member Credential Authentication**: Portal authentication uses standard member account registration and login stored in `/erp_state/member_accounts` without Firebase Auth/Google popup requirements.

## 2. Adversarial Test Vectors
1. **Default-deny root fallback** on `/other_collection/doc` -> `PERMISSION_DENIED`.
2. **Collection list scraping** (`list` query on `/erp_state`) -> `PERMISSION_DENIED`.
3. **Arbitrary/unknown docId injection** (`/erp_state/rogue_collection`) -> `PERMISSION_DENIED`.
4. **Oversized/invalid docId poisoning** (`docId` > 128 chars or containing spaces/symbols) -> `PERMISSION_DENIED`.
5. **Shadow / ghost field injection** (`{ id: 'projects', updatedAt: '2026-11-23T00:00:00Z', items: [], isAdmin: true }`) -> `PERMISSION_DENIED`.
6. **Missing required fields** (`{ id: 'projects', items: [] }` without `updatedAt`) -> `PERMISSION_DENIED`.
7. **ID mismatch poisoning** (`docId: 'projects'` with `{ id: 'identitas', updatedAt: '...' }`) -> `PERMISSION_DENIED`.
8. **Unbounded array payload** (`items.size() > 1500`) -> `PERMISSION_DENIED`.
9. **Malformed `items` primitive array** (`items: ['raw-string']` instead of record maps) -> `PERMISSION_DENIED`.
10. **Client delete attempt** (`delete` on `/erp_state/central_audit_logs`) -> `PERMISSION_DENIED`.
