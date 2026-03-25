import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Skeleton from '../../components/ui/Skeleton';

export default function ProviderHome() {
    const queryClient = useQueryClient();
    const { addToast } = useContext(ToastContext) || {};

    const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
        queryKey: ['provider-stats'],
        queryFn: async () => {
            const { data } = await api.get('/provider/stats');
            return data;
        },
        retry: 1,
        staleTime: 3 * 60 * 1000,
    });

    const { data: listings = [], isLoading: listingsLoading } = useQuery({
        queryKey: ['provider-listings-home'],
        queryFn: async () => {
            const { data } = await api.get('/provider/listings');
            return (data.data || []).slice(0, 3);
        },
        retry: 1,
    });

    const { data: profileData = {}, isLoading: profileLoading } = useQuery({
        queryKey: ['provider-profile-home'],
        queryFn: async () => {
            const { data } = await api.get('/provider/profile');
            return data.data || {};
        },
        retry: 1,
    });

    const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
        queryKey: ['provider-analytics-home'],
        queryFn: async () => {
            const { data } = await api.get('/provider/analytics');
            return data;
        },
        retry: 1,
    });

    if (statsError) {
        return (
            <div style={{ padding: '20px', color: 'var(--r)', fontSize: '14px' }}>
                Failed to load dashboard. Please refresh the page.
            </div>
        );
    }

    if (statsLoading) {
        return (
            <div className="kpi-row c4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" />)}
            </div>
        );
    }

    const recentActivity = (analytics?.recent_reviews || []).slice(0, 3);
    const topListing = analytics?.top_listing;

    const tips = [
        '✦ Add more details to your listing description to appear higher in recommendations',
        '✦ Listings with higher ratings get featured in the Doon AI recommendations',
        '✦ Respond to reviews to build trust with tourists',
    ];

    const statusColor = {
        active: 'p-g',
        pending: 'p-y',
        rejected: 'p-r',
        draft: 'p-n',
    };

    return (
        <>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--i)', marginBottom: '2px' }}>
                    Welcome back! 👋
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--i4)' }}>Here's your business performance at a glance.</p>
            </div>

            <div className="kpi-row c4 mb20">
                <div className="kpi sr">
                    <div className="kpi-lbl">Profile Views</div>
                    <div className="kpi-val">{stats?.profile_views || 0}</div>
                    <div className="kpi-sub">This month</div>
                </div>
                <div className="kpi sr d1">
                    <div className="kpi-lbl">Avg Rating</div>
                    <div className="kpi-val">{Number(stats?.avg_rating || 0).toFixed(1)}</div>
                    <div className="kpi-sub">⭐ Rating</div>
                </div>
                <div className="kpi sr d2">
                    <div className="kpi-lbl">Active Listings</div>
                    <div className="kpi-val">{stats?.active_listings || 0}</div>
                    <div className="kpi-sub">{stats?.pending_listings || 0} pending</div>
                </div>
                <div className="kpi sr d3">
                    <div className="kpi-lbl">Recommendation Appearances</div>
                    <div className="kpi-val">{stats?.rec_appearances || 0}</div>
                    <div className="kpi-sub">Times featured</div>
                </div>
            </div>

            <div className="g3" style={{ gridTemplateColumns: '3fr 2fr', marginBottom: '16px' }}>
                <div className="dc sr d1">
                    <div className="dc-title" style={{ marginBottom: '12px' }}>My Listings</div>
                    {listingsLoading ? (
                        <Skeleton height="150px" />
                    ) : listings.length ? (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {listings.map(listing => (
                                    <div key={listing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--i)', marginBottom: '2px' }}>
                                                {listing.listing_title || listing.destination?.name || '-'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--i4)' }}>
                                                {listing.listing_type} • ₱{listing.price}
                                            </div>
                                        </div>
                                        <span className={`pill ${statusColor[listing.status] || 'p-n'}`} style={{ fontSize: '10px', marginLeft: '8px' }}>
                                            {listing.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <a href="/provider/listings" style={{ fontSize: '12px', color: 'var(--pr)', marginTop: '12px', display: 'block', textDecoration: 'none', fontWeight: '600' }}>
                                View all →
                            </a>
                        </>
                    ) : (
                        <div style={{ fontSize: '13px', color: 'var(--i4)', padding: '20px 0', textAlign: 'center' }}>
                            No listings yet
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="dc sr d2">
                        <div className="dc-title" style={{ marginBottom: '12px' }}>Verification Status</div>
                        {profileLoading ? (
                            <Skeleton height="80px" />
                        ) : profileData?.is_verified ? (
                            <div style={{ padding: '12px 0', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
                                <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--ac)', marginBottom: '4px' }}>Verified Business</div>
                                <p style={{ fontSize: '11px', color: 'var(--i4)', lineHeight: '1.4' }}>Your business is verified and can receive bookings.</p>
                            </div>
                        ) : (
                            <div style={{ padding: '12px 0', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#c0a030', marginBottom: '4px' }}>Pending Verification</div>
                                <p style={{ fontSize: '11px', color: 'var(--i4)', lineHeight: '1.4' }}>Your business is under review by the Doon team.</p>
                            </div>
                        )}
                    </div>

                    <div className="dc sr d3">
                        <div className="dc-title" style={{ marginBottom: '12px' }}>Recent Activity</div>
                        {analyticsLoading ? (
                            <Skeleton height="80px" />
                        ) : recentActivity.length ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {recentActivity.map((review, idx) => (
                                    <div key={idx} style={{ fontSize: '11px', padding: '6px 0', borderBottom: '1px solid var(--bd)' }}>
                                        <div style={{ color: 'var(--i)', fontWeight: '500', marginBottom: '2px' }}>
                                            ⭐ {review.rating} star review
                                        </div>
                                        <div style={{ color: 'var(--i4)', fontSize: '10px' }}>
                                            {review.destination?.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: '11px', color: 'var(--i4)', padding: '8px 0' }}>
                                No recent activity yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="g2 mb16">
                <div className="dc sr d1">
                    <div className="dc-title" style={{ marginBottom: '12px' }}>Top Performing Listing</div>
                    {analyticsLoading ? (
                        <Skeleton height="100px" />
                    ) : topListing ? (
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--i)', marginBottom: '8px' }}>
                                {topListing.name}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--i3)', marginBottom: '4px' }}>
                                {'⭐'.repeat(Math.round(Number(topListing.rating || 0)))} {Number(topListing.rating || 0).toFixed(1)}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--i4)' }}>
                                {topListing.views} views this month
                            </div>
                            <a href="/provider/analytics" style={{ fontSize: '12px', color: 'var(--pr)', marginTop: '8px', display: 'block', textDecoration: 'none', fontWeight: '600' }}>
                                View details →
                            </a>
                        </div>
                    ) : (
                        <p style={{ fontSize: '13px', color: 'var(--i4)' }}>No data yet</p>
                    )}
                </div>

                <div className="dc sr d2">
                    <div className="dc-title" style={{ marginBottom: '12px' }}>Quick Tips</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tips.map((tip, idx) => (
                            <div key={idx} style={{ fontSize: '11px', color: 'var(--i3)', lineHeight: '1.5' }}>
                                {tip}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
