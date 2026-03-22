export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange, totalResults, perPage }) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) pages.push(1);
        if (start > 2) pages.push('...');

        for (let i = start; i <= end; i++) pages.push(i);

        if (end < totalPages - 1) pages.push('...');
        if (end < totalPages) pages.push(totalPages);

        return pages;
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--i4)' }}>
            <div>
                {totalResults && perPage ? `Showing ${(currentPage - 1) * perPage + 1}-${Math.min(currentPage * perPage, totalResults)} of ${totalResults} results` : ''}
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="s-btn"
                    style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                    Previous
                </button>

                {getPageNumbers().map((page, i) => (
                    <button
                        key={i}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                        className={`s-btn ${page === currentPage ? 'dark' : ''}`}
                        disabled={page === '...'}
                        style={{ minWidth: '28px', textAlign: 'center' }}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="s-btn"
                    style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
