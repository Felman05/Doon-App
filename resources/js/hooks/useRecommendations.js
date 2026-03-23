import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export default function useRecommendations() {
    const [filters, setFilters] = useState(null);
    const [page, setPage] = useState(1);
    const [items, setItems] = useState([]);
    const hasSearchedRef = useRef(false);

    const query = useQuery({
        queryKey: ['recommendations', filters, page],
        queryFn: async () => {
            const { data } = await api.get('/recommendations', {
                params: {
                    ...(filters || {}),
                    page,
                },
            });
            return data;
        },
        enabled: false,
    });

    const search = useCallback(async (nextFilters) => {
        setFilters(nextFilters);
        setPage(1);
        setItems([]);
        hasSearchedRef.current = true;
        await query.refetch();
    }, [query]);

    const loadMore = useCallback(async () => {
        const totalPages = query.data?.last_page ?? 1;
        if (page >= totalPages || query.isFetching) {
            return;
        }
        setPage((p) => p + 1);
    }, [page, query]);

    useEffect(() => {
        if (!hasSearchedRef.current) {
            return;
        }
        if (!filters) {
            return;
        }
        query.refetch();
    }, [page]);

    useEffect(() => {
        if (!query.data) {
            return;
        }
        const next = query.data.data ?? [];
        setItems((prev) => (page === 1 ? next : [...prev, ...next]));
    }, [query.data, page]);

    const total = query.data?.total ?? 0;
    const currentPage = query.data?.current_page ?? 1;
    const totalPages = query.data?.last_page ?? 1;

    return useMemo(() => ({
        results: items,
        total,
        currentPage,
        totalPages,
        isLoading: query.isLoading || query.isFetching,
        error: query.error,
        search,
        loadMore,
    }), [items, total, currentPage, totalPages, query.isLoading, query.isFetching, query.error, search, loadMore]);
}
