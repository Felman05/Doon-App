import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';
import DestinationCard from '../../components/recommendations/DestCard';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';

export default function RecommendationsPage({ weatherState }) {
    const [searchParams] = useSearchParams();
    const { addToast } = useContext(ToastContext) || {};
    const weather = weatherState?.weather ?? [];
    const [page, setPage] = useState(1);
    const [activeProvinces, setActiveProvinces] = useState([]);
    const [budget, setBudget] = useState('');
    const [minRatingEnabled, setMinRatingEnabled] = useState(false);
    const [quickCategorySlugs, setQuickCategorySlugs] = useState([]);
    const [debouncedFilters, setDebouncedFilters] = useState({
        province_ids: [],
        budget: '',
        min_rating: undefined,
    });
    const [savedDestinationIds, setSavedDestinationIds] = useState([]);

    const { data: provinces = [] } = useQuery({
        queryKey: ['provinces'],
        queryFn: async () => {
            const { data } = await api.get('/provinces');
            return data.data ?? [];
        },
    });

    const provinceMap = useMemo(
        () => Object.fromEntries(provinces.map((province) => [province.name, province.id])),
        [provinces]
    );

    useEffect(() => {
        const requestedProvinceId = Number(searchParams.get('province'));
        if (!Number.isFinite(requestedProvinceId) || !provinces.length) {
            return;
        }

        const matchedProvince = provinces.find((province) => Number(province.id) === requestedProvinceId);
        if (!matchedProvince) {
            return;
        }

        setActiveProvinces([matchedProvince.name]);
        setPage(1);
    }, [provinces, searchParams]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const mappedProvinceIds = activeProvinces
                .map((name) => provinceMap[name])
                .filter((id) => Number.isFinite(Number(id)));

            setDebouncedFilters({
                province_ids: mappedProvinceIds,
                budget: budget || '',
                min_rating: minRatingEnabled ? 4 : undefined,
            });
            setPage(1);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [activeProvinces, budget, minRatingEnabled, provinceMap]);

    const { data: favorites = [] } = useQuery({
        queryKey: ['favorites'],
        queryFn: async () => {
            const { data } = await api.get('/favorites');
            return data.data ?? [];
        },
    });

    useEffect(() => {
        setSavedDestinationIds((favorites || []).map((favorite) => favorite.destination_id));
    }, [favorites]);

    const toggleSaveMutation = useMutation({
        mutationFn: async ({ destinationId, shouldSave }) => {
            if (shouldSave) {
                await api.post(`/favorites/${destinationId}`);
                return;
            }

            await api.delete(`/favorites/${destinationId}`);
        },
        onMutate: async ({ destinationId, shouldSave }) => {
            const previousSavedIds = [...savedDestinationIds];

            setSavedDestinationIds((prev) => {
                if (shouldSave) {
                    return Array.from(new Set([...prev, destinationId]));
                }

                return prev.filter((id) => id !== destinationId);
            });

            return { previousSavedIds };
        },
        onError: (_error, _vars, context) => {
            if (context?.previousSavedIds) {
                setSavedDestinationIds(context.previousSavedIds);
            }
            addToast?.('Failed to update saved places', 'error');
        },
    });

    const { data: recommendations = { items: [], total: 0, current_page: 1, last_page: 1 }, isLoading } = useQuery({
        queryKey: ['recommendations', page, debouncedFilters, quickCategorySlugs],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('page', String(page));

            const quickTheme = quickCategorySlugs.length === 1 ? quickCategorySlugs[0] : '';

            if (debouncedFilters.budget) {
                params.set('budget', debouncedFilters.budget);
            }

            if (quickTheme) {
                params.set('theme', quickTheme);
            }

            if (debouncedFilters.min_rating) {
                params.set('min_rating', String(debouncedFilters.min_rating));
            }

            (debouncedFilters.province_ids || []).forEach((id) => {
                params.append('province_ids[]', String(id));
            });

            const response = await api.get('/recommendations', { params });
            const payload = response?.data ?? {};

            const nestedData = payload?.data;
            const items = Array.isArray(nestedData?.data)
                ? nestedData.data
                : Array.isArray(nestedData)
                    ? nestedData
                    : Array.isArray(payload?.items)
                        ? payload.items
                        : [];

            return {
                items,
                total: nestedData?.total ?? payload?.total ?? items.length,
                current_page: nestedData?.current_page ?? payload?.current_page ?? 1,
                last_page: nestedData?.last_page ?? payload?.last_page ?? 1,
                per_page: nestedData?.per_page ?? payload?.per_page,
            };
        },
    });

    const visibleItems = useMemo(() => {
        if (!quickCategorySlugs.length) {
            return recommendations.items ?? [];
        }

        return (recommendations.items ?? []).filter((destination) => quickCategorySlugs.includes(destination.category?.slug));
    }, [recommendations.items, quickCategorySlugs]);

    const hasRainProvince = weather.find((entry) => String(entry.condition || '').toLowerCase().includes('rain'));
    const batangasSunny = weather.find(
        (entry) => entry.province === 'Batangas' && String(entry.condition || '').toLowerCase().includes('clear')
    );
    const clearCount = weather.filter((entry) => String(entry.condition || '').toLowerCase().includes('clear')).length;

    const weatherSmartBanner = useMemo(() => {
        if (batangasSunny) {
            return {
                message: '☀️ Perfect beach weather in Batangas today',
                actionLabel: 'Show Batangas beaches →',
                onAction: () => {
                    setActiveProvinces(['Batangas']);
                    setQuickCategorySlugs(['beach-water']);
                    setPage(1);
                },
            };
        }

        if (hasRainProvince) {
            return {
                message: `🌧️ Rainy in ${hasRainProvince.province} — try indoor destinations`,
                actionLabel: 'Show indoor options →',
                onAction: () => {
                    setQuickCategorySlugs(['cultural-heritage', 'food-dining']);
                    setPage(1);
                },
            };
        }

        if (clearCount >= 2) {
            return {
                message: '🌤️ Clear skies across CALABARZON — great day for outdoor adventures',
                actionLabel: null,
                onAction: null,
            };
        }

        return null;
    }, [batangasSunny, hasRainProvince, clearCount]);

    return (
        <>
            <div className="dc mb16 sr">
                <div className="dc-title">AI Activity Finder</div>
                <div style={{ fontSize: '12px', color: 'var(--i4)', marginTop: '6px' }}>
                    Refine by province, budget, and rating. Results update automatically.
                </div>
            </div>

            <div className="rec-layout">
                {/* Filter sidebar */}
                <div className="dc sr d1">
                    <div className="dc-title" style={{ marginBottom: '16px' }}>Filters</div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <div className="sub-lbl">Provinces</div>
                        {['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'].map(prov => (
                            <label key={prov} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={activeProvinces.includes(prov)}
                                    onChange={(event) => {
                                        setActiveProvinces((prev) => {
                                            if (event.target.checked) {
                                                return [...prev, prov];
                                            }

                                            return prev.filter((name) => name !== prov);
                                        });
                                    }}
                                    style={{ accentColor: 'var(--ac)' }}
                                />
                                {prov}
                            </label>
                        ))}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div className="sub-lbl">Budget</div>
                        {[
                            { label: 'Free', value: 'free' },
                            { label: 'Budget', value: 'budget' },
                            { label: 'Mid-range', value: 'mid_range' },
                            { label: 'Luxury', value: 'luxury' },
                        ].map((option) => (
                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="budget"
                                    checked={budget === option.value}
                                    onChange={() => setBudget(option.value)}
                                    style={{ accentColor: 'var(--ac)' }}
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={minRatingEnabled}
                            onChange={(event) => setMinRatingEnabled(event.target.checked)}
                            style={{ accentColor: 'var(--ac)' }}
                        />
                        Rating: 4★ and above
                    </label>
                </div>

                {/* Results */}
                <div className="dc sr d1">
                    {weatherSmartBanner ? (
                        <div
                            style={{
                                marginBottom: '12px',
                                padding: '10px 12px',
                                borderRadius: 'var(--r2)',
                                border: '1px solid var(--bd)',
                                background: 'var(--bg2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                                flexWrap: 'wrap',
                            }}
                        >
                            <span style={{ fontSize: '13px', color: 'var(--i2)' }}>{weatherSmartBanner.message}</span>
                            {weatherSmartBanner.actionLabel ? (
                                <button type="button" className="s-btn" onClick={weatherSmartBanner.onAction}>
                                    {weatherSmartBanner.actionLabel}
                                </button>
                            ) : null}
                        </div>
                    ) : null}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div className="dc-title">Results</div>
                        <div style={{ fontSize: '12px', color: 'var(--i4)' }}>
                            {visibleItems.length} found
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="rec-results-grid">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} height="240px" />
                            ))}
                        </div>
                    ) : visibleItems.length ? (
                        <>
                            <div className="rec-results-grid">
                                {visibleItems.map(dest => (
                                    <DestinationCard
                                        key={dest.id}
                                        destination={dest}
                                        weather={weather}
                                        isSaved={savedDestinationIds.includes(dest.id)}
                                        onToggleSave={(destinationId) => {
                                            const shouldSave = !savedDestinationIds.includes(destinationId);
                                            toggleSaveMutation.mutate({ destinationId, shouldSave });
                                        }}
                                    />
                                ))}
                            </div>
                            {recommendations.last_page && recommendations.last_page > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={recommendations.last_page}
                                    totalResults={recommendations.total}
                                    perPage={recommendations.per_page}
                                    onPageChange={setPage}
                                />
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon="📍"
                            title="No destinations found"
                            message="Try adjusting your filters or search criteria."
                        />
                    )}
                </div>
            </div>
        </>
    );
}
