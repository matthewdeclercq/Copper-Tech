// ============================================================================
// Main Application Logic
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeSmoothScrolling();
    initializeNavigationScroll();
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
