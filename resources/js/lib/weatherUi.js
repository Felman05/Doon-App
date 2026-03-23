export function weatherEmoji(condition, icon) {
    if (!condition) return '⛅';
    const c = String(condition).toLowerCase();

    if (icon && String(icon).includes('n')) {
        if (c.includes('clear')) return '🌙';
        if (c.includes('cloud')) return '☁️';
        return '🌃';
    }

    if (c.includes('thunderstorm')) return '⛈️';
    if (c.includes('drizzle')) return '🌦️';
    if (c.includes('rain')) return '🌧️';
    if (c.includes('snow')) return '❄️';
    if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return '🌫️';
    if (c.includes('clear')) return '☀️';
    if (c.includes('few clouds')) return '🌤️';
    if (c.includes('scattered')) return '⛅';
    if (c.includes('broken') || c.includes('overcast')) return '☁️';

    return '⛅';
}

export function travelAdvice(weather) {
    if (!weather) return '';
    const condition = String(weather.condition || '').toLowerCase();
    const temperature = Number(weather.temperature);

    if (condition.includes('rain')) return '🌂 Bring a raincoat';
    if (Number.isFinite(temperature) && temperature >= 32) return '🧴 Apply sunscreen';
    if (Number.isFinite(temperature) && temperature <= 22) return '🧥 Bring a light jacket';

    return '✅ Good travel conditions';
}

export function buildWeatherAdvisory(weather = []) {
    const usable = (weather || []).filter((w) => w && w.province);
    if (!usable.length) {
        return {
            text: '⛅ Weather updates are temporarily unavailable. Please check again shortly.',
            background: 'var(--bg2)',
            borderColor: 'var(--bd)',
        };
    }

    const hasRain = usable.some((w) => String(w.condition || '').toLowerCase().includes('rain'));
    if (hasRain) {
        return {
            text: '🌧️ Rain expected in some provinces today. Pack a light jacket and waterproof bag.',
            background: '#fef9e7',
            borderColor: '#d6ae00',
        };
    }

    const allClear = usable.every((w) => {
        const condition = String(w.condition || '').toLowerCase();
        return condition.includes('clear');
    });

    const allHot = allClear && usable.every((w) => Number(w.temperature) >= 30);

    if (allHot) {
        return {
            text: '☀️ Hot and sunny across CALABARZON today. Apply sunscreen and bring extra water.',
            background: '#fdeee9',
            borderColor: '#d8754d',
        };
    }

    if (allClear) {
        return {
            text: '✅ Great travel conditions across all 5 provinces today. Perfect day to explore!',
            background: 'var(--acb)',
            borderColor: 'var(--ac)',
        };
    }

    return {
        text: '🌤️ Conditions are mixed across CALABARZON today. Check province weather before leaving.',
        background: 'var(--bg2)',
        borderColor: 'var(--bd2)',
    };
}
