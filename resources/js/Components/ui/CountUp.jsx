import { useEffect, useRef, useState } from 'react';

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

export default function CountUp({ value = 0, duration = 1600 }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef(null);
    const startedRef = useRef(false);

    useEffect(() => {
        const target = Number(value) || 0;
        const node = ref.current;
        if (!node) return undefined;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting || startedRef.current) return;
                startedRef.current = true;

                const start = performance.now();

                const animate = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = easeOutCubic(progress);
                    setDisplay(Math.round(target * eased));

                    if (progress < 1) {
                        window.requestAnimationFrame(animate);
                    }
                };

                window.requestAnimationFrame(animate);
            });
        }, { threshold: 0.2 });

        observer.observe(node);

        return () => observer.disconnect();
    }, [value, duration]);

    return <span ref={ref}>{display.toLocaleString()}</span>;
}
