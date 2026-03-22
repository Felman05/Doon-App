import { useEffect } from 'react';

export default function GlobalEffects() {
    useEffect(() => {
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (isTouch) return undefined;

        let cur = document.getElementById('cur');
        let curo = document.getElementById('curo');

        if (!cur) {
            cur = document.createElement('div');
            cur.id = 'cur';
            document.body.appendChild(cur);
        }

        if (!curo) {
            curo = document.createElement('div');
            curo.id = 'curo';
            document.body.appendChild(curo);
        }

        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let followerX = targetX;
        let followerY = targetY;
        let frameId;

        const moveCursor = (event) => {
            targetX = event.clientX;
            targetY = event.clientY;
            cur.style.left = `${targetX}px`;
            cur.style.top = `${targetY}px`;
        };

        const hoverSelector = 'a,button,input,select,textarea,[role="button"],.sb-item,.prov-card,.feat-cell,.role-card,.role-opt';

        const handleHover = (event) => {
            const interactive = event.target.closest(hoverSelector);
            if (interactive) {
                cur.classList.add('big');
                curo.classList.add('big');
            } else {
                cur.classList.remove('big');
                curo.classList.remove('big');
            }
        };

        const tick = () => {
            followerX += (targetX - followerX) * 0.18;
            followerY += (targetY - followerY) * 0.18;
            curo.style.left = `${followerX}px`;
            curo.style.top = `${followerY}px`;
            frameId = window.requestAnimationFrame(tick);
        };

        window.addEventListener('mousemove', moveCursor);
        document.addEventListener('mouseover', handleHover);
        document.addEventListener('mouseout', handleHover);
        frameId = window.requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            document.removeEventListener('mouseover', handleHover);
            document.removeEventListener('mouseout', handleHover);
            window.cancelAnimationFrame(frameId);
        };
    }, []);

    return null;
}
