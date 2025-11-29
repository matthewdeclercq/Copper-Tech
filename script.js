// ============================================================================
// Component Loading
// ============================================================================

// ============================================================================
// Component Loading
// ============================================================================

async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Failed to load component ${componentPath}:`, error);
    }
}

async function initializeComponents() {
    // Load the same nav component for all pages (with hamburger menu)
    const navPath = 'components/nav.html';

    // Load components
    await Promise.all([
        loadComponent('nav-placeholder', navPath),
        loadComponent('footer-placeholder', 'components/footer.html'),
        loadComponent('cta-placeholder', 'components/cta.html')
    ]);
}

// ============================================================================
// Main Application Logic
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
    await initializeComponents();

    // Add loaded class to body for smooth fade-in
    document.body.classList.add('loaded');

    initializeSmoothScrolling();
    initializeNavigationScroll();
    initializeMenuOverlay();
    initializeFadeInAnimations();
    initializeImageObserver();
});

// ============================================================================
// Smooth Scrolling for Navigation Links
// ============================================================================

function initializeSmoothScrolling() {
    const ctaButtons = document.querySelectorAll('.cta-button[href^="#"]');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================================================
// Navigation Background Change on Scroll
// ============================================================================

function initializeNavigationScroll() {
    const navContainer = document.querySelector('.nav-container');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            navContainer.classList.add('scrolled');
        } else {
            navContainer.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
    }, { passive: true });
}

// ============================================================================
// Full-Screen Menu Overlay Toggle
// ============================================================================

function initializeMenuOverlay() {
    const menuBtn = document.querySelector('.menu-btn');
    const menuOverlay = document.getElementById('menu-overlay');

    if (menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', function() {
            const isActive = menuOverlay.classList.contains('active');
            menuOverlay.classList.toggle('active');
            menuBtn.classList.toggle('active');
            menuBtn.setAttribute('aria-expanded', !isActive);

            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? 'auto' : 'hidden';
        });

        // Close menu when clicking on overlay (but not on content)
        menuOverlay.addEventListener('click', function(e) {
            if (e.target === menuOverlay) {
                menuOverlay.classList.remove('active');
                menuBtn.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
                menuOverlay.classList.remove('active');
                menuBtn.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// ============================================================================
// Fade-in Animations with Intersection Observer
// ============================================================================

function initializeFadeInAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    // Observe all sections and articles for animations
    const elementsToAnimate = document.querySelectorAll('section, article');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// ============================================================================
// Performance Optimization: Lazy Load Images
// ============================================================================

function initializeImageObserver() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Add loading="lazy" if not already set
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // Observe all images
    const images = document.querySelectorAll('img');
    images.forEach(img => imageObserver.observe(img));
}
