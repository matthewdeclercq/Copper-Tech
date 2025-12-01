// ============================================================================
// Component Loading
// ============================================================================

/**
 * Shared function to fetch HTML content from a file
 * @param {string} componentPath - Path to the HTML file
 * @returns {Promise<string>} - The HTML content as a string
 */
async function fetchHTML(componentPath) {
    const response = await fetch(componentPath);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
}

/**
 * Load a component into an element by ID
 * @param {string} elementId - ID of the target element
 * @param {string} componentPath - Path to the component HTML file
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found`);
        return false;
    }

    try {
        const html = await fetchHTML(componentPath);
        element.innerHTML = html;
        return true;
    } catch (error) {
        console.error(`Failed to load component ${componentPath}:`, error);
        // Show fallback content if component fails to load
        element.innerHTML = `<div class="component-error" role="alert" aria-live="polite">${AppConfig.messages.componentLoadError}</div>`;
        return false;
    }
}

/**
 * Load a project card into a container
 * @param {string} containerSelector - CSS selector for the container
 * @param {string} componentPath - Path to the project card HTML file
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function loadProjectCard(containerSelector, componentPath) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container "${containerSelector}" not found`);
        return false;
    }

    try {
        const html = await fetchHTML(componentPath);
        container.insertAdjacentHTML('beforeend', html);
        return true;
    } catch (error) {
        console.error(`Failed to load project card ${componentPath}:`, error);
        // Show fallback content for failed project card
        const errorHTML = `<div class="component-error" role="alert" aria-live="polite">${AppConfig.messages.projectCardLoadError}</div>`;
        container.insertAdjacentHTML('beforeend', errorHTML);
        return false;
    }
}

/**
 * Initialize and load all components
 * Uses configuration from AppConfig to determine which components to load
 */
async function initializeComponents() {
    // Load all standard components in parallel
    const componentPromises = Object.entries(AppConfig.components).map(
        ([elementId, componentPath]) => loadComponent(elementId, componentPath)
    );

    // Load individual project cards into the container
    const projectCardsList = document.querySelector(AppConfig.selectors.projectCardsList);
    if (projectCardsList) {
        const projectCardPromises = AppConfig.projectCards.map(
            (componentPath) => loadProjectCard(AppConfig.selectors.projectCardsList, componentPath)
        );
        componentPromises.push(...projectCardPromises);
    }

    await Promise.all(componentPromises);
}

// ============================================================================
// Main Application Logic
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await initializeComponents();

        // Add loaded class to body for smooth fade-in
        if (document.body) {
            document.body.classList.add('loaded');
        }

        // Initialize features (each handles its own null checks)
        initializeSmoothScrolling();
        initializeNavigationScroll();
        initializeMenuOverlay();
        initializeFadeInAnimations();
        initializeImageObserver();
    } catch (error) {
        console.error('Error during initialization:', error);
        // Ensure body still gets loaded class even if components fail
        if (document.body) {
            document.body.classList.add('loaded');
        }
    }
});

// ============================================================================
// Smooth Scrolling for Navigation Links
// ============================================================================

function initializeSmoothScrolling() {
    const ctaButtons = document.querySelectorAll('.cta-button[href^="#"]');

    if (ctaButtons.length === 0) {
        return; // No buttons to handle
    }

    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (!targetId) {
                return;
            }

            const targetSection = document.querySelector(targetId);
            if (!targetSection) {
                console.warn(`Target section not found: ${targetId}`);
                return;
            }

            const nav = document.querySelector('.nav');
            const navHeight = nav ? nav.offsetHeight : 0;
            const targetPosition = targetSection.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// ============================================================================
// Navigation Background Change on Scroll
// ============================================================================

function initializeNavigationScroll() {
    const navContainer = document.querySelector('.nav-container');
    
    if (!navContainer) {
        return; // Navigation container not found
    }

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
// Full-Screen Menu Overlay Toggle with Focus Trap
// ============================================================================

function initializeMenuOverlay() {
    const menuBtn = document.querySelector('.menu-btn');
    const menuOverlay = document.getElementById('menu-overlay');

    if (!menuBtn || !menuOverlay) {
        return;
    }

    const menuLinks = menuOverlay.querySelectorAll('a');
    const firstFocusable = menuLinks[0];
    const lastFocusable = menuLinks[menuLinks.length - 1];
    let previousActiveElement = null;

    function trapFocus(e) {
        if (!menuOverlay.classList.contains('active')) {
            return;
        }

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    }

    function openMenu() {
        menuOverlay.classList.add('active');
        menuBtn.classList.add('active');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        
        // Store the previously focused element
        previousActiveElement = document.activeElement;
        
        // Focus first menu item
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Add focus trap
        menuOverlay.addEventListener('keydown', trapFocus);
        
        // Announce menu opening
        announceToScreenReader('Menu opened');
    }

    function closeMenu() {
        menuOverlay.classList.remove('active');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = 'auto';
        
        // Remove focus trap
        menuOverlay.removeEventListener('keydown', trapFocus);
        
        // Return focus to the button that opened the menu
        if (previousActiveElement) {
            previousActiveElement.focus();
            previousActiveElement = null;
        }
        
        // Announce menu closing
        announceToScreenReader('Menu closed');
    }

    menuBtn.addEventListener('click', function() {
        const isActive = menuOverlay.classList.contains('active');
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when clicking on overlay (but not on content)
    menuOverlay.addEventListener('click', function(e) {
        if (e.target === menuOverlay) {
            closeMenu();
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
            closeMenu();
        }
    });
}

// ============================================================================
// ARIA Live Region for Screen Reader Announcements
// ============================================================================

function createAriaLiveRegion() {
    let liveRegion = document.getElementById('aria-live-region');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
    
    return liveRegion;
}

function announceToScreenReader(message) {
    const liveRegion = createAriaLiveRegion();
    liveRegion.textContent = message;
    
    // Clear after announcement is read (screen readers typically read within 1-2 seconds)
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 1000);
}

// ============================================================================
// Fade-in Animations with Intersection Observer
// ============================================================================

function initializeFadeInAnimations() {
    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
        // Fallback: add fade-in class immediately for browsers without support
        const elementsToAnimate = document.querySelectorAll('section, article');
        elementsToAnimate.forEach(element => {
            element.classList.add('fade-in');
        });
        return;
    }

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
    if (elementsToAnimate.length > 0) {
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    }
}

// ============================================================================
// Performance Optimization: Lazy Load Images
// ============================================================================

function initializeImageObserver() {
    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
        return; // Browser doesn't support IntersectionObserver
    }

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
    if (images.length > 0) {
        images.forEach(img => imageObserver.observe(img));
    }
}

