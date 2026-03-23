import DestCard from './DestCard';

export default function DestinationList({
    destinations,
    isLoading,
    currentPage,
    totalPages,
    onLoadMore,
    onSelectDestination,
    selectedDestination,
    onAddToItinerary,
    onClearFilters,
}) {
    if (isLoading && destinations.length === 0) {
        return (
            <div style={{ display: 'grid', gap: '8px' }}>
                {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="dest-row shimmer" style={{ minHeight: '70px' }} />
                ))}
            </div>
        );
    }

    if (!isLoading && destinations.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '24px' }}>
                <p style={{ color: 'var(--i3)', marginBottom: '12px' }}>
                    No destinations found for your filters. Try adjusting your budget, theme, or province.
                </p>
                <button type="button" className="s-btn" onClick={onClearFilters}>Clear filters</button>
            </div>
        );
    }

    return (
        <>
            <div className="dest-list">
                {destinations.map((destination) => (
                    <DestCard
                        key={destination.id}
                        destination={destination}
                        isSelected={selectedDestination?.id === destination.id}
                        onSelect={() => onSelectDestination?.(destination)}
                        onAddToItinerary={() => onAddToItinerary?.(destination)}
                    />
                ))}
            </div>

            {currentPage < totalPages ? (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <button type="button" className="s-btn dark" onClick={onLoadMore} disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Load more'}
                    </button>
                </div>
            ) : null}
        </>
    );
}
