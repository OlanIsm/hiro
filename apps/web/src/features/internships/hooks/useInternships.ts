import { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "../../../lib/api";
import type { Internship, KanbanColumnId, InternshipMetrics } from "../types";

export function useInternships() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<Internship[]>("/internships");
      if (res.data) {
        setInternships(res.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load internships");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    apiFetch<Internship[]>("/internships")
      .then((res) => {
        if (!ignore && res.data) {
          setInternships(res.data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load internships");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Optimistic status update with automatic rollback on error
  const updateStatus = async (id: string, newStatus: KanbanColumnId) => {
    const previousInternships = [...internships];

    // Optimistically update
    setInternships((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
      )
    );

    try {
      setError(null);
      await apiFetch<Internship>(`/internships/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err: unknown) {
      // Revert optimistic update
      setInternships(previousInternships);
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setError(msg);
      throw err;
    }
  };

  // Metrics summary
  const metrics: InternshipMetrics = useMemo(() => {
    const total = internships.length;
    const test = internships.filter((i) => i.status === "TEST").length;
    const interview = internships.filter((i) => i.status === "INTERVIEW").length;
    const nextStep = internships.filter((i) => i.status === "NEXT_STEP").length;
    const active = test + interview + nextStep;

    return { total, active, test, interview };
  }, [internships]);

  // Filtered & sorted internships
  const filteredInternships = useMemo(() => {
    return internships
      .filter((item) => {
        const matchesSearch =
          item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus =
          statusFilter === "ALL" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [internships, searchQuery, statusFilter, sortOrder]);

  return {
    internships: filteredInternships,
    rawCount: internships.length,
    loading,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    updateStatus,
    refreshInternships: fetchInternships,
    metrics,
  };
}
