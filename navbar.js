document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return; // safety for pages without navbar

    const navPanel = navbar.querySelector('.glass-panel');
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                // Shrink / glass effect
                if (currentScrollY > 50) {
                    navbar.classList.remove('lg:py-6');
                    navbar.classList.add('lg:py-3');
                    navPanel?.classList.add('bg-white/90', 'backdrop-blur-xl', 'shadow-xl');
                } else {
                    navbar.classList.add('lg:py-6');
                    navbar.classList.remove('lg:py-3');
                    navPanel?.classList.remove('bg-white/90', 'backdrop-blur-xl', 'shadow-xl');
                }

                // Hide on scroll down, show on scroll up
                if (currentScrollY > lastScrollY && currentScrollY > 5) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
});
