import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import RecommendationForm from '../../components/recommendations/RecommendationForm';
import DestinationCard from '../../components/recommendations/DestinationCard';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';

export default function RecommendationsPage() {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({});

    const { data: recommendations = {}, isLoading } = useQuery({
        queryKey: ['recommendations', page, filters],
        queryFn: async () => {
            const { data } = await api.get('/recommendations', { params: { page, ...filters } });
            return data.data ?? {};
        },
    });

    return (
        <>
            <div className="dc mb16 sr">
                <div className="dc-title">AI Activity Finder</div>
                <RecommendationForm onSubmit={(payload) => {
                    setFilters(payload);
                    setPage(1);
                }} />
            </div>

            <div className="g2">
                {/* Filter sidebar */}
                <div className="dc sr d1" style={{ maxWidth: '300px' }}>
                    <div className="dc-title" style={{ marginBottom: '16px' }}>Filters</div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <div className="sub-lbl">Provinces</div>
                        {['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'].map(prov => (
                            <label key={prov} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                <input type="checkbox" onChange={(e) => {}} style={{ accentColor: 'var(--ac)' }} />
                                {prov}
                            </label>
                        ))}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div className="sub-lbl">Budget</div>
                        {['Free', 'Budget', 'Mid-range', 'Luxury'].map(b => (
                            <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                <input type="radio" name="budget" onChange={(e) => {}} style={{ accentColor: 'var(--ac)' }} />
                                {b}
                            </label>
                        ))}
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" onChange={(e) => {}} style={{ accentColor: 'var(--ac)' }} />
                        Rating: 4★ and above
                    </label>
                </div>

                {/* Results */}
                <div className="dc sr d1">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div className="dc-title">Results</div>
                        <div style={{ fontSize: '12px', color: 'var(--i4)' }}>
                            {recommendations.total ?? 0} found
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} height="240px" />
                            ))}
                        </div>
                    ) : recommendations.data?.length ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                {recommendations.data.map(dest => (
                                    <DestinationCard key={dest.id} destination={dest} />
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
