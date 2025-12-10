/**
 * Space Apps - Modern Interactive Script
 * Handles Material You theming, smooth navigation, and animations.
 */

/* =========================================
   THEMING SYSTEM
   ========================================= */
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Default to dark if no preference, or respect saved
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.setTheme(theme);
        
        // Listener for toggle button
        const toggleBtn = document.getElementById('dark-mode-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Optional: Animate the toggle button itself
        const toggleBtn = document.getElementById('dark-mode-toggle');
        if (toggleBtn) {
            toggleBtn.animate([
                { transform: 'rotate(0deg) scale(1)' },
                { transform: 'rotate(180deg) scale(0.8)' },
                { transform: 'rotate(360deg) scale(1)' }
            ], {
                duration: 500,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            });
        }
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
    }
};

/* =========================================
   NAVIGATION & ANIMATIONS
   ========================================= */
const Navigation = {
    init() {
        // Handle internal links
        document.querySelectorAll('a[href^="#"], [data-section]').forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e));
        });

        // Handle browser history
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.switchSection(e.state.section, false);
            }
        });

        // Initial load
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            this.switchSection(hash, false);
        } else {
            this.switchSection('home', false);
        }
        
        // Navbar glass effect on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile Menu
        const hamburger = document.querySelector('.nav-hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('open');
                const isOpen = navLinks.classList.contains('open');
                hamburger.setAttribute('aria-expanded', isOpen);
            });
            
            // Close on click
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('open');
                });
            });
        }
    },

    handleLinkClick(e) {
        // Find closest anchor or button
        const target = e.currentTarget;
        const href = target.getAttribute('href');
        const dataSection = target.getAttribute('data-section');
        
        // If it's a section navigation
        if (dataSection) {
            e.preventDefault();
            this.switchSection(dataSection);
        } else if (href && href.startsWith('#')) {
            e.preventDefault();
            const sectionId = href.substring(1);
            if (document.getElementById(sectionId)) {
                // If we are already on the page and just scrolling to an anchor (unlikely in this SPA setup but possible)
                // Actually, in this SPA, IDs are "pages". So we switch.
                this.switchSection(sectionId);
            }
        }
    },

    switchSection(sectionId, updateHistory = true) {
        const currentSection = document.querySelector('.page-section.active');
        const targetSection = document.getElementById(sectionId);

        if (!targetSection || currentSection === targetSection) return;

        // Animate out current
        if (currentSection) {
            currentSection.classList.add('exiting');
            currentSection.classList.remove('active');
            
            // Wait for CSS animation
            setTimeout(() => {
                currentSection.classList.remove('exiting');
                currentSection.style.display = 'none';
            }, 400);
        }

        // SCROLL TO TOP INSTANTLY (Aggressive Fix)
        // We use a timeout to let the layout refresh (exiting section becomes absolute)
        // and force "instant" behavior to override any browser restoration.
        setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 10);

        // Animate in new
        targetSection.style.display = 'block';
        // Force reflow for animation trigger
        void targetSection.offsetWidth; 
        targetSection.classList.add('active');

        // Update Nav State
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.section === sectionId || link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        if (updateHistory) {
            history.pushState({ section: sectionId }, '', `#${sectionId}`);
        }
    }
};

/* =========================================
   INTERACTIVE EFFECTS
   ========================================= */
const Interactive = {
    init() {
        this.addRippleEffect();
        this.addTiltEffect();
        
        // SyncSpace Maintenance Modal
        const syncspaceBtn = document.getElementById('syncspace-unavailable-btn');
        const modal = document.getElementById('syncspace-modal');
        // Note: Check if modal logic elements exist before attaching
        if (syncspaceBtn && modal) {
            const btns = modal.querySelectorAll('button');
            
            syncspaceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
                // Animate modal in
                modal.animate([
                    { opacity: 0, transform: 'scale(0.9)' },
                    { opacity: 1, transform: 'scale(1)' }
                ], { duration: 300, easing: 'ease-out', fill: 'forwards' });
            });

            // Close actions
            const close = () => {
                const anim = modal.animate([
                    { opacity: 1, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(0.9)' }
                ], { duration: 200, easing: 'ease-in' });
                anim.onfinish = () => modal.style.display = 'none';
            };

            btns.forEach(btn => {
                if (btn.id === 'syncspace-modal-continue') {
                    btn.addEventListener('click', () => {
                        window.open('https://syncspace.spaceapp.rf.gd/', '_blank');
                        close();
                    });
                } else {
                    btn.addEventListener('click', close);
                }
            });
            
            // Close on outside click
            window.addEventListener('click', (e) => {
                if (e.target === modal) close();
            });
        }
    },

    addRippleEffect() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.btn, .nav-link, .product-card');
            if (!target) return;
            
            // Don't trigger if it's disabled
            if (target.getAttribute('disabled') !== null || target.classList.contains('disabled')) return;

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size/2;
            const y = e.clientY - rect.top - size/2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Clean up old ripples
            const oldRipple = target.querySelector('.ripple');
            if (oldRipple) oldRipple.remove();

            target.appendChild(ripple);
            
            // Remove after animation
            setTimeout(() => ripple.remove(), 600);
        });
    },

    addTiltEffect() {
        const cards = document.querySelectorAll('.product-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Sensitivity
                const rotateX = (centerY - y) / 20; 
                const rotateY = (x - centerX) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = ''; // Clear inline transform to revert to CSS hover state or default
            });
        });
    }
};

/* =========================================
   INITIALIZATION
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    Navigation.init();
    Interactive.init();

    // Specific logic for CashSpace details expansion
    const learnMoreBtn = document.getElementById('cashspace-learnmore-btn');
    const cashCard = document.getElementById('cashspace-card');
    const cashDetails = document.getElementById('cashspace-details');

    if (learnMoreBtn && cashCard && cashDetails) {
        learnMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // prevent nav click if nested
            
            // Fade out card
            cashCard.style.opacity = '0';
            setTimeout(() => {
                cashCard.style.display = 'none';
                cashDetails.style.display = 'block';
                cashDetails.style.opacity = '0';
                cashDetails.style.transform = 'translateY(20px)';
                
                // Fade in details
                requestAnimationFrame(() => {
                    cashDetails.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    cashDetails.style.opacity = '1';
                    cashDetails.style.transform = 'translateY(0)';
                });
            }, 300);
        });
        
        // Reset when leaving section
        const resetObserver = new MutationObserver(() => {
            if (!document.getElementById('upcoming-projects').classList.contains('active')) {
                 setTimeout(() => {
                    cashCard.style.display = 'block';
                    cashCard.style.opacity = '1';
                    cashDetails.style.display = 'none';
                 }, 500); 
            }
        });
        resetObserver.observe(document.getElementById('upcoming-projects'), { attributes: true, attributeFilter: ['class'] });
    }
});