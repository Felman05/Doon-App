import useWeather from '../../hooks/useWeather';

export default function WeatherStrip() {
    const { data = [], isLoading } = useWeather();

    return (
        <div className="wx-grid">
            {(isLoading ? Array.from({ length: 5 }).map((_, idx) => ({ id: idx, loading: true })) : data).map((row, idx) => {
                if (row.loading) {
                    return <div key={idx} className="wx-cell shimmer">&nbsp;</div>;
                }

                if (row.error || !row.weather) {
                    return <div key={row.province?.id ?? idx} className="wx-cell"><div className="wx-loc">{row.province?.name ?? 'Province'}</div><div className="wx-cond">Weather unavailable</div></div>;
                }

                const icon = row.weather?.weather?.[0]?.icon;
                const temp = Math.round(row.weather?.main?.temp ?? 0);
                const condition = row.weather?.weather?.[0]?.description ?? 'Unknown';

                return (
                    <div key={row.province?.id} className="wx-cell">
                        {icon ? <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={condition} width="42" height="42" /> : null}
                        <div className="wx-temp">{temp}°</div>
                        <div className="wx-loc">{row.province?.name}</div>
                        <div className="wx-cond">{condition}</div>
                    </div>
                );
            })}
        </div>
    );
}
