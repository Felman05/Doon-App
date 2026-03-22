import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollRevealEffects() {
    const { pathname } = useLocation();

    useEffect(() => {
        const elements = Array.from(document.querySelectorAll('.sr'));
        if (!elements.length) return undefined;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                }
            });
        }, { threshold: 0.1 });

        elements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [pathname]);

    return null;
}
