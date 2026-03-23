import { useEffect } from 'react';

export default function GlobalEffects({ enableCursor = false }) {
    useEffect(() => {
        const body = document.body;

        if (!enableCursor) {
            body.classList.remove('cursor-active');
            document.getElementById('cur')?.remove();
            document.getElementById('curo')?.remove();
            return undefined;
        }

        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (isTouch) {
            body.classList.remove('cursor-active');
            document.getElementById('cur')?.remove();
            document.getElementById('curo')?.remove();
            return undefined;
        }

        body.classList.add('cursor-active');

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

        cur.style.opacity = '0';
        curo.style.opacity = '0';

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
            cur.style.opacity = '1';
            curo.style.opacity = '1';
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

        const hideCursor = () => {
            cur.style.opacity = '0';
            curo.style.opacity = '0';
        };

        const showCursor = () => {
            cur.style.opacity = '1';
            curo.style.opacity = '1';
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseleave', hideCursor);
        window.addEventListener('mouseenter', showCursor);
        document.addEventListener('mouseover', handleHover);
        document.addEventListener('mouseout', handleHover);
        frameId = window.requestAnimationFrame(tick);

        return () => {
            body.classList.remove('cursor-active');
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseleave', hideCursor);
            window.removeEventListener('mouseenter', showCursor);
            document.removeEventListener('mouseover', handleHover);
            document.removeEventListener('mouseout', handleHover);
            window.cancelAnimationFrame(frameId);
        };
    }, [enableCursor]);

    return null;
}
