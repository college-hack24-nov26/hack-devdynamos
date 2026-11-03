import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { FarmerRecord, StatusCounts } from '@/types/farmer';

// ─── Fetch farmers (with optional status filter + name search) ────────────────
async function fetchFarmers(status?: string, search?: string): Promise<FarmerRecord[]> {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());
    const url = `/api/farmers${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

// ─── Fetch status counts ──────────────────────────────────────────────────────
async function fetchCounts(): Promise<StatusCounts> {
    const res = await fetch('/api/farmers/counts');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

// ─── Update farmer status ─────────────────────────────────────────────────────
export async function updateFarmerStatus(
    landId: string,
    status: 'Verified' | 'Rejected' | 'Pending'
): Promise<FarmerRecord> {
    const res = await fetch(`/api/farmers/${landId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

// ─── Delete farmer record ─────────────────────────────────────────────────────
export async function deleteFarmer(landId: string): Promise<void> {
    const res = await fetch(`/api/farmers/${landId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
}

// ─── Fetch single farmer ──────────────────────────────────────────────────────
export async function fetchFarmerById(landId: string): Promise<FarmerRecord> {
    const res = await fetch(`/api/farmers/${encodeURIComponent(landId)}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

// ─── useFarmers hook ──────────────────────────────────────────────────────────
export function useFarmers(status?: string, search?: string) {
    return useQuery<FarmerRecord[]>({
        queryKey: ['farmers', status, search],
        queryFn: () => fetchFarmers(status, search),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}

// ─── useFarmerCounts hook ─────────────────────────────────────────────────────
export function useFarmerCounts() {
    return useQuery<StatusCounts>({
        queryKey: ['farmerCounts'],
        queryFn: fetchCounts,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}

// ─── useInvalidateFarmers helper ──────────────────────────────────────────────
export function useInvalidateFarmers() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: ['farmers'] })
        .then(() => qc.invalidateQueries({ queryKey: ['farmerCounts'] }));
}
