// ============================================================================
// Constants
// ============================================================================

/**
 * Configuration constants for various features.
 * @type {Object}
 */
const Constants = {
    /** Scroll threshold in pixels for navigation background change */
    SCROLL_THRESHOLD: 100,
    /** Delay in milliseconds before clearing screen reader announcements */
    SCREEN_READER_CLEAR_DELAY: 1000,
    /** Intersection Observer threshold for fade-in animations */
    FADE_IN_THRESHOLD: 0.1,
    /** Root margin for fade-in animations (bottom offset) */
    FADE_IN_ROOT_MARGIN: '0px 0px -50px 0px',
    /** Root margin for image lazy loading (preload distance) */
    IMAGE_LAZY_LOAD_MARGIN: '50px 0px',
    /** Intersection Observer threshold for image lazy loading */
    IMAGE_LAZY_LOAD_THRESHOLD: 0.01,
    /** CSS selector for CTA buttons with hash links */
    CTA_BUTTON_SELECTOR: '.cta-button[href^="#"]',
    /** CSS selector for navigation container */
    NAV_CONTAINER_SELECTOR: '.nav-container',
    /** CSS selector for navigation element */
    NAV_SELECTOR: '.nav',
    /** CSS selector for menu button */
    MENU_BUTTON_SELECTOR: '.menu-btn',
    /** ID for menu overlay element */
    MENU_OVERLAY_ID: 'menu-overlay',
    /** ID for ARIA live region */
    ARIA_LIVE_REGION_ID: 'aria-live-region',
    /** CSS selector for elements to animate (all content elements within sections, but not sections themselves) */
    ANIMATION_ELEMENTS_SELECTOR: 'section h1, section h2, section h3, section h4, section h5, section h6, section p, section ul, section ol, section li, section div, section article, section header, section footer, section aside',
    /** CSS selector for all images */
    IMAGES_SELECTOR: 'img',
    /** CSS class name for screen reader only content */
    SR_ONLY_CLASS: 'sr-only',
    /** CSS class name for component error display */
    COMPONENT_ERROR_CLASS: 'component-error',
    /** CSS class name for loaded state */
    LOADED_CLASS: 'loaded',
    /** CSS class name for scrolled navigation state */
    SCROLLED_CLASS: 'scrolled',
    /** CSS class name for active menu state */
    ACTIVE_CLASS: 'active',
    /** CSS class name for fade-in animation */
    FADE_IN_CLASS: 'fade-in',
    /** Keyboard key for Escape */
    KEY_ESCAPE: 'Escape',
    /** Keyboard key for Tab */
    KEY_TAB: 'Tab'
};

// ============================================================================
// DOM Element Cache
// ============================================================================

/**
 * Cached DOM elements to avoid repeated queries.
 * Initialized once on DOMContentLoaded.
 * @type {Object}
 */
const cachedElements = {
    nav: null,
    navContainer: null,
    menuBtn: null,
    menuOverlay: null
};

/**
 * Initializes the DOM element cache.
 * Queries and caches frequently accessed elements.
 * @returns {void}
 */
function initializeDOMCache() {
    cachedElements.nav = document.querySelector(Constants.NAV_SELECTOR);
    cachedElements.navContainer = document.querySelector(Constants.NAV_CONTAINER_SELECTOR);
    cachedElements.menuBtn = document.querySelector(Constants.MENU_BUTTON_SELECTOR);
    cachedElements.menuOverlay = document.getElementById(Constants.MENU_OVERLAY_ID);
}

// ============================================================================
// Component Loading
// ============================================================================

/**
 * Fetches HTML content from a file using the Fetch API.
 * @param {string} componentPath - Relative path to the HTML component file (e.g., 'components/nav.html').
 * @returns {Promise<string>} The HTML content as a string.
 * @throws {Error} Throws an error if the HTTP request fails or returns a non-OK status.
 * @example
 * const html = await fetchHTML('components/nav.html');
 */
async function fetchHTML(componentPath) {
    if (!componentPath || typeof componentPath !== 'string') {
        throw new Error('Invalid component path provided');
    }

    const response = await fetch(componentPath);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch ${componentPath}: HTTP ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
}

/**
 * Validates component loading parameters and handles common errors.
 * @param {string} paramName - Name of the parameter being validated (for error messages).
 * @param {*} paramValue - The parameter value to validate.
 * @param {string} paramType - Expected type (e.g., 'string').
 * @returns {boolean} True if valid, false otherwise.
 */
function validateComponentParam(paramName, paramValue, paramType = 'string') {
    if (!paramValue || typeof paramValue !== paramType) {
        console.error(`Invalid ${paramName} provided`);
        return false;
    }
    return true;
}

/**
 * Handles component loading errors by displaying fallback content.
 * @param {HTMLElement} targetElement - The element to insert error content into.
 * @param {string} errorMessage - User-facing error message to display.
 * @param {string} insertMethod - Method to insert error ('innerHTML' or 'insertAdjacentHTML').
 * @param {string} position - Position for insertAdjacentHTML (e.g., 'beforeend').
 * @returns {void}
 */
function handleComponentLoadError(targetElement, errorMessage, insertMethod = 'innerHTML', position = 'beforeend') {
    if (!targetElement) {
        return;
    }
    
    const errorHTML = `<div class="${Constants.COMPONENT_ERROR_CLASS}" role="alert" aria-live="polite">${errorMessage}</div>`;
    
    try {
        if (insertMethod === 'innerHTML') {
            targetElement.innerHTML = errorHTML;
        } else {
            targetElement.insertAdjacentHTML(position, errorHTML);
        }
    } catch (error) {
        console.error('Error inserting error message:', error);
    }
}

/**
 * Loads a component HTML file into a target element by its ID.
 * If loading fails, displays a user-friendly error message in the target element.
 * @param {string} elementId - The ID of the target DOM element where the component will be inserted.
 * @param {string} componentPath - Relative path to the component HTML file.
 * @returns {Promise<boolean>} Returns true if the component loaded successfully, false otherwise.
 * @example
 * await loadComponent('nav-placeholder', 'components/nav.html');
 */
async function loadComponent(elementId, componentPath) {
    // Validate parameters
    if (!validateComponentParam('element ID', elementId)) {
        return false;
    }
    if (!validateComponentParam('component path', componentPath)) {
        return false;
    }

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
        console.error(`Failed to load component ${componentPath} into element "${elementId}":`, error);
        handleComponentLoadError(element, AppConfig.messages.componentLoadError, 'innerHTML');
        return false;
    }
}

/**
 * Loads a project card HTML file and appends it to a container element.
 * If loading fails, appends an error message to the container.
 * @param {string} containerSelector - CSS selector for the container element (e.g., '.project-cards-list').
 * @param {string} componentPath - Relative path to the project card HTML file.
 * @returns {Promise<boolean>} Returns true if the project card loaded successfully, false otherwise.
 * @example
 * await loadProjectCard('.project-cards-list', 'components/project-navy-pacific.html');
 */
async function loadProjectCard(containerSelector, componentPath) {
    // Validate parameters
    if (!validateComponentParam('container selector', containerSelector)) {
        return false;
    }
    if (!validateComponentParam('component path', componentPath)) {
        return false;
    }

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
        console.error(`Failed to load project card ${componentPath} into container "${containerSelector}":`, error);
        handleComponentLoadError(container, AppConfig.messages.projectCardLoadError, 'insertAdjacentHTML', 'beforeend');
        return false;
    }
}

/**
 * Initializes and loads all components defined in AppConfig.
 * Loads standard components (nav, footer, CTA) and project cards in parallel.
 * Uses configuration from AppConfig to determine which components to load.
 * @returns {Promise<void>} Resolves when all components have been loaded (or failed to load).
 * @throws {Error} May throw an error if Promise.all fails, though individual component failures are handled gracefully.
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

    // Wait for all components to load (individual failures are handled gracefully)
    // Promise.allSettled never rejects, so no try-catch needed
    await Promise.allSettled(componentPromises);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Opens the menu overlay by triggering the menu button click.
 * Shared utility function used by multiple features.
 * @returns {void}
 */
function openMenuOverlay() {
    if (cachedElements.menuBtn) {
        cachedElements.menuBtn.click();
        announceToScreenReader('Navigation menu opened');
    }
}

// ============================================================================
// Main Application Logic
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await initializeComponents();

        // Cache DOM elements after components are loaded
        initializeDOMCache();

        // Add loaded class to body for smooth fade-in
        if (document.body) {
            document.body.classList.add(Constants.LOADED_CLASS);
        }

        // Initialize features (each handles its own null checks)
        initializeSmoothScrolling();
        initializeNavigationScroll();
        initializeMenuOverlay();
        initializeFadeInAnimations(); // Handles both fade-in animations and image lazy loading
        // Only initialize rotating industry if the element exists on this page
        if (document.getElementById('rotating-industry-text')) {
            initializeRotatingIndustry();
        }
        
        // Initialize banner h1 click handlers for industry pages
        initializeBannerH1Click();
        
        // Initialize carousel after components are loaded
        // Use requestAnimationFrame to ensure DOM is fully updated with project cards
        // Only initialize if carousel elements exist on this page
        if (document.querySelector('.carousel-slides')) {
            requestAnimationFrame(() => {
                initializeCarousel();
            });
        }
        
        // Initialize FAQ accordions
        initializeAccordions();
        
        // Initialize footer copyright year
        initializeCopyrightYear();
    } catch (error) {
        console.error('Error during initialization:', error);
        // Ensure body still gets loaded class even if components fail
        if (document.body) {
            document.body.classList.add(Constants.LOADED_CLASS);
        }
    }
});

// ============================================================================
// Smooth Scrolling for Navigation Links
// ============================================================================

/**
 * Initializes smooth scrolling behavior for CTA buttons that link to page sections.
 * Calculates the correct scroll position accounting for fixed navigation height.
 * @returns {void}
 */
function initializeSmoothScrolling() {
    try {
        const ctaButtons = document.querySelectorAll(Constants.CTA_BUTTON_SELECTOR);

        if (ctaButtons.length === 0) {
            return; // No buttons to handle
        }

        ctaButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                try {
                    e.preventDefault();

                    const targetId = this.getAttribute('href');
                    if (!targetId) {
                        console.warn('CTA button has no href attribute');
                        return;
                    }

                    const targetSection = document.querySelector(targetId);
                    if (!targetSection) {
                        console.warn(`Target section not found: ${targetId}`);
                        return;
                    }

                    const navHeight = cachedElements.nav ? cachedElements.nav.offsetHeight : 0;
                    const targetPosition = targetSection.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                } catch (error) {
                    console.error('Error during smooth scroll:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error initializing smooth scrolling:', error);
    }
}

// ============================================================================
// Navigation Background Change on Scroll
// ============================================================================

/**
 * Initializes navigation background change on scroll.
 * Adds a 'scrolled' class to the navigation container when the user scrolls past 100px.
 * Uses passive event listener for better scroll performance.
 * @returns {void}
 */
function initializeNavigationScroll() {
    try {
        if (!cachedElements.navContainer) {
            return; // Navigation container not found
        }

        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > Constants.SCROLL_THRESHOLD) {
                cachedElements.navContainer.classList.add(Constants.SCROLLED_CLASS);
            } else {
                cachedElements.navContainer.classList.remove(Constants.SCROLLED_CLASS);
            }
        }, { passive: true });
    } catch (error) {
        console.error('Error initializing navigation scroll:', error);
    }
}

// ============================================================================
// Full-Screen Menu Overlay Toggle with Focus Trap
// ============================================================================

/**
 * Initializes the full-screen menu overlay with keyboard navigation and focus trap.
 * Handles opening/closing the menu, focus management, and ARIA attributes.
 * Implements accessibility features including focus trapping and screen reader announcements.
 * @returns {void}
 */
function initializeMenuOverlay() {
    try {
        if (!cachedElements.menuBtn || !cachedElements.menuOverlay) {
            return;
        }

    const menuLinks = cachedElements.menuOverlay.querySelectorAll('a');
    const firstFocusable = menuLinks[0];
    const lastFocusable = menuLinks[menuLinks.length - 1];
    const trapFocus = createFocusTrap(cachedElements.menuOverlay, menuLinks, Constants.ACTIVE_CLASS);
    let previousActiveElement = null;

    /**
     * Opens the menu overlay and sets up focus trap.
     * Updates ARIA attributes, prevents body scrolling, and announces to screen readers.
     * @returns {void}
     */
    function openMenu() {
        try {
            cachedElements.menuOverlay.classList.add(Constants.ACTIVE_CLASS);
            cachedElements.menuBtn.classList.add(Constants.ACTIVE_CLASS);
            cachedElements.menuBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';

            // Store the previously focused element
            previousActiveElement = document.activeElement;

            // Focus first menu item
            if (firstFocusable) {
                firstFocusable.focus();
            }

            // Add focus trap
            cachedElements.menuOverlay.addEventListener('keydown', trapFocus);
            
            // Announce menu opening
            announceToScreenReader('Menu opened');
        } catch (error) {
            console.error('Error opening menu:', error);
        }
    }

    /**
     * Closes the menu overlay and restores normal page behavior.
     * Removes focus trap, restores body scrolling, returns focus to trigger element, and announces to screen readers.
     * @returns {void}
     */
    function closeMenu() {
        try {
            cachedElements.menuOverlay.classList.remove(Constants.ACTIVE_CLASS);
            cachedElements.menuBtn.classList.remove(Constants.ACTIVE_CLASS);
            cachedElements.menuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';

            // Remove focus trap
            cachedElements.menuOverlay.removeEventListener('keydown', trapFocus);
            
            // Return focus to the button that opened the menu
            if (previousActiveElement) {
                previousActiveElement.focus();
                previousActiveElement = null;
            }
            
            // Announce menu closing
            announceToScreenReader('Menu closed');
        } catch (error) {
            console.error('Error closing menu:', error);
        }
    }

    cachedElements.menuBtn.addEventListener('click', function() {
        const isActive = cachedElements.menuOverlay.classList.contains(Constants.ACTIVE_CLASS);
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when clicking on overlay (but not on content)
    cachedElements.menuOverlay.addEventListener('click', function(e) {
        if (e.target === cachedElements.menuOverlay) {
            closeMenu();
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === Constants.KEY_ESCAPE && cachedElements.menuOverlay.classList.contains(Constants.ACTIVE_CLASS)) {
            closeMenu();
        }
    });
    } catch (error) {
        console.error('Error initializing menu overlay:', error);
    }
}

// ============================================================================
// ARIA Live Region for Screen Reader Announcements
// ============================================================================

/**
 * Creates or retrieves an ARIA live region element for screen reader announcements.
 * The live region is hidden visually but accessible to assistive technologies.
 * @returns {HTMLElement} The ARIA live region element.
 */
function createAriaLiveRegion() {
    try {
        let liveRegion = document.getElementById(Constants.ARIA_LIVE_REGION_ID);
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = Constants.ARIA_LIVE_REGION_ID;
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = Constants.SR_ONLY_CLASS;
            document.body.appendChild(liveRegion);
        }
        
        return liveRegion;
    } catch (error) {
        console.error('Error creating ARIA live region:', error);
        // Return a dummy element to prevent crashes
        return document.createElement('div');
    }
}

/**
 * Announces a message to screen readers using an ARIA live region.
 * The message is automatically cleared after 1 second to prevent stale announcements.
 * @param {string} message - The message to announce to screen reader users.
 * @returns {void}
 * @example
 * announceToScreenReader('Menu opened');
 */
function announceToScreenReader(message) {
    try {
        if (!message || typeof message !== 'string') {
            console.warn('Invalid message provided to announceToScreenReader');
            return;
        }

        const liveRegion = createAriaLiveRegion();
        liveRegion.textContent = message;
        
        // Clear after announcement is read (screen readers typically read within 1-2 seconds)
        setTimeout(() => {
            try {
                liveRegion.textContent = '';
            } catch (error) {
                console.error('Error clearing ARIA live region:', error);
            }
        }, Constants.SCREEN_READER_CLEAR_DELAY);
    } catch (error) {
        console.error('Error announcing to screen reader:', error);
    }
}

/**
 * Creates a reusable focus trap function for modal/overlay components.
 * Prevents keyboard focus from escaping the container when active.
 * @param {HTMLElement} container - The container element to trap focus within
 * @param {NodeList|Array} focusableElements - Array or NodeList of focusable elements within the container
 * @param {string} activeClass - Class name that indicates the container is active/visible
 * @returns {Function} The trapFocus function to be used as an event listener
 */
function createFocusTrap(container, focusableElements, activeClass) {
    if (!container || !focusableElements || focusableElements.length === 0) {
        return () => {};
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    return function trapFocus(e) {
        if (!container.classList.contains(activeClass)) {
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
    };
}

// ============================================================================
// Consolidated Intersection Observer for Fade-in Animations and Image Lazy Loading
// ============================================================================

/**
 * Initializes a consolidated Intersection Observer for both fade-in animations and image lazy loading.
 * Elements fade in when they enter the viewport. Images get lazy loading attributes.
 * Falls back to immediate fade-in for browsers without IntersectionObserver support.
 * Note: Sections themselves are not animated, only their child elements.
 * @returns {void}
 */
function initializeFadeInAnimations() {
    try {
        // Check if IntersectionObserver is supported
        if (typeof IntersectionObserver === 'undefined') {
            // Fallback: add fade-in class immediately for browsers without support
            const elementsToAnimate = document.querySelectorAll(Constants.ANIMATION_ELEMENTS_SELECTOR);
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                elementsToAnimate.forEach(element => {
                    element.classList.add(Constants.FADE_IN_CLASS);
                });
            });
            return;
        }

        // Use more permissive options to handle both fade-in and images
        // Use the fade-in threshold and margin as primary, but observe images with same observer
        const observerOptions = {
            threshold: Constants.FADE_IN_THRESHOLD,
            rootMargin: Constants.FADE_IN_ROOT_MARGIN
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Handle fade-in animations for content elements
                    if (element.matches && element.matches(Constants.ANIMATION_ELEMENTS_SELECTOR)) {
                        element.classList.add(Constants.FADE_IN_CLASS);
                        observer.unobserve(element); // Stop observing once animated
                    }
                }
            });
        }, observerOptions);

        // Observe all articles and headings within sections for animations
        const elementsToAnimate = document.querySelectorAll(Constants.ANIMATION_ELEMENTS_SELECTOR);
        
        if (elementsToAnimate.length > 0) {
            // Use requestAnimationFrame to ensure DOM is fully rendered before checking viewport
            requestAnimationFrame(() => {
                elementsToAnimate.forEach(element => {
                    // Check if element is already in viewport - if so, animate immediately
                    const rect = element.getBoundingClientRect();
                    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
                    
                    if (isInViewport) {
                        // Element is already visible, add fade-in class immediately
                        element.classList.add(Constants.FADE_IN_CLASS);
                    } else {
                        // Element is not yet visible, observe it
                        observer.observe(element);
                    }
                });
            });
        }

        // Image lazy loading is handled natively by browsers via loading="lazy" attribute in HTML
        // No need to observe images with JavaScript
    } catch (error) {
        console.error('Error initializing fade-in animations and image observer:', error);
    }
}

// ============================================================================
// Project Carousel
// ============================================================================

/**
 * Initializes the project cards carousel with navigation and pagination.
 * Sets up event listeners for navigation arrows and pagination dots.
 * Manages slide transitions and active states.
 * @returns {void}
 */
function initializeCarousel() {
    try {
        const carouselSlides = document.querySelector('.carousel-slides');
        const projectCardsList = document.querySelector(AppConfig.selectors.projectCardsList);
        const paginationContainer = document.querySelector('.carousel-pagination');

        // Check if all required elements exist
        if (!carouselSlides || !projectCardsList || !paginationContainer) {
            console.warn('Carousel elements not found, skipping carousel initialization');
            return;
        }

        // Get all project cards
        const slides = projectCardsList.querySelectorAll('.project-showcase');
        
        if (slides.length === 0) {
            console.warn('No project cards found for carousel');
            return;
        }

        // Initialize carousel state
        let currentSlide = 0;
        const totalSlides = slides.length;

        /**
         * Updates the carousel display to show the specified slide.
         * Calculates the transform to center the active card on the page.
         * @param {number} index - The index of the slide to display (0-based).
         * @returns {void}
         */
        function goToSlide(index) {
            try {
                // Ensure index is within bounds
                if (index < 0 || index >= totalSlides) {
                    return;
                }

                // Validate required elements exist
                if (!projectCardsList || !slides || slides.length === 0) {
                    console.warn('Carousel elements missing, cannot navigate');
                    return;
                }

                currentSlide = index;

                // Calculate transform to center the current slide
                // Simplified: use the first slide's width + gap to calculate movement
                const firstSlide = slides[0];
                if (!firstSlide) {
                    return;
                }

                // Get slide width and gap once
                const slideWidth = firstSlide.offsetWidth;
                if (slideWidth <= 0) {
                    return; // Invalid width, skip transform
                }

                // Get gap from computed style (defaults to 0 if not found)
                const computedStyle = getComputedStyle(projectCardsList);
                const gap = parseInt(computedStyle.gap) || 0;
                
                // Calculate transform: move left by (slide index * (width + gap))
                const translateX = -currentSlide * (slideWidth + gap);
                projectCardsList.style.transform = `translateX(${translateX}px)`;

                // Update active slide styling
                if (slides && slides.length > 0) {
                    slides.forEach((slide, i) => {
                        if (slide) {
                            if (i === currentSlide) {
                                slide.classList.add('active-slide');
                            } else {
                                slide.classList.remove('active-slide');
                            }
                        }
                    });
                }

                // Update pagination dots
                if (paginationContainer) {
                    updatePaginationDots();
                }

                // Announce slide change to screen readers
                announceToScreenReader(`Project ${currentSlide + 1} of ${totalSlides}`);
            } catch (error) {
                console.error('Error navigating to slide:', error);
            }
        }

        /**
         * Navigates to the next slide in the carousel.
         * @returns {void}
         */
        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                goToSlide(currentSlide + 1);
            }
        }

        /**
         * Navigates to the previous slide in the carousel.
         * @returns {void}
         */
        function prevSlide() {
            if (currentSlide > 0) {
                goToSlide(currentSlide - 1);
            }
        }

        /**
         * Updates the active state of pagination dots.
         * @returns {void}
         */
        function updatePaginationDots() {
            if (!paginationContainer) {
                return;
            }
            try {
                const dots = paginationContainer.querySelectorAll('.carousel-pagination-dot');
                dots.forEach((dot, index) => {
                    if (dot) {
                        if (index === currentSlide) {
                            dot.classList.add('active');
                            dot.setAttribute('aria-selected', 'true');
                        } else {
                            dot.classList.remove('active');
                            dot.setAttribute('aria-selected', 'false');
                        }
                    }
                });
            } catch (error) {
                console.error('Error updating pagination dots:', error);
            }
        }

        /**
         * Creates pagination dots for each slide.
         * @returns {void}
         */
        function createPaginationDots() {
            if (!paginationContainer || totalSlides === 0) {
                return;
            }
            try {
                // Clear existing dots
                paginationContainer.innerHTML = '';

                // Create a dot for each slide
                for (let i = 0; i < totalSlides; i++) {
                    const dot = document.createElement('button');
                    dot.classList.add('carousel-pagination-dot');
                    dot.setAttribute('role', 'tab');
                    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
                    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                    
                    // Add click event listener
                    dot.addEventListener('click', () => goToSlide(i));
                    
                    paginationContainer.appendChild(dot);
                }

                // Set first dot as active
                updatePaginationDots();
            } catch (error) {
                console.error('Error creating pagination dots:', error);
            }
        }

        // Touch/Swipe functionality for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        let isSwiping = false;
        const swipeThreshold = 50; // Minimum distance for a swipe

        // Add click handlers to each card to navigate to it
        if (slides && slides.length > 0) {
            slides.forEach((slide, index) => {
                if (slide) {
                    slide.addEventListener('click', function(e) {
                        // Only navigate if it's a click, not the end of a swipe
                        if (!isSwiping && index !== currentSlide) {
                            goToSlide(index);
                        }
                    });
                }
            });
        }

        /**
         * Handles the start of a touch event.
         * @param {TouchEvent} e - The touch event.
         * @returns {void}
         */
        function handleTouchStart(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            isSwiping = false;
        }

        /**
         * Handles touch movement to detect swiping.
         * @param {TouchEvent} e - The touch event.
         * @returns {void}
         */
        function handleTouchMove(e) {
            const currentX = e.changedTouches[0].screenX;
            const currentY = e.changedTouches[0].screenY;
            const diffX = Math.abs(currentX - touchStartX);
            const diffY = Math.abs(currentY - touchStartY);
            
            // If horizontal movement is greater than vertical, it's a swipe
            if (diffX > diffY && diffX > 10) {
                isSwiping = true;
            }
        }

        /**
         * Handles the end of a touch event and executes swipe navigation.
         * @param {TouchEvent} e - The touch event.
         * @returns {void}
         */
        function handleTouchEnd(e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }

        /**
         * Determines swipe direction and navigates accordingly.
         * @returns {void}
         */
        function handleSwipe() {
            const diffX = touchStartX - touchEndX;
            const diffY = Math.abs(touchStartY - touchEndY);
            
            // Only register as swipe if horizontal movement is greater than vertical
            if (Math.abs(diffX) > diffY && Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) {
                    // Swiped left - go to next slide
                    nextSlide();
                } else {
                    // Swiped right - go to previous slide
                    prevSlide();
                }
            }
            
            // Reset swipe flag after a short delay
            setTimeout(() => {
                isSwiping = false;
            }, 50);
        }

        // Add touch event listeners to carousel
        if (carouselSlides) {
            try {
                carouselSlides.addEventListener('touchstart', handleTouchStart, { passive: true });
                carouselSlides.addEventListener('touchmove', handleTouchMove, { passive: true });
                carouselSlides.addEventListener('touchend', handleTouchEnd, { passive: true });
            } catch (error) {
                console.error('Error adding touch event listeners:', error);
            }
        }

        // Create pagination dots
        createPaginationDots();

        // Initialize to first slide (only if slides exist)
        if (slides && slides.length > 0) {
            goToSlide(0);
        }

        // Handle resize to recalculate slide positions
        // Use ResizeObserver for better performance (only observes carousel container)
        // Fallback to window resize for browsers without ResizeObserver support
        let resizeTimeout;
        const handleResize = function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                goToSlide(currentSlide);
            }, 150);
        };

        if (carouselSlides) {
            try {
                if (typeof ResizeObserver !== 'undefined') {
                    // Use ResizeObserver for more efficient resize detection
                    // Observes carousel container instead of entire window
                    const resizeObserver = new ResizeObserver(function() {
                        handleResize();
                    });
                    resizeObserver.observe(carouselSlides);
                } else {
                    // Fallback to window resize for older browsers
                    window.addEventListener('resize', handleResize, { passive: true });
                }

                // Optional: Add keyboard navigation
                carouselSlides.addEventListener('keydown', function(e) {
                    if (e.key === 'ArrowLeft') {
                        prevSlide();
                    } else if (e.key === 'ArrowRight') {
                        nextSlide();
                    }
                });
            } catch (error) {
                console.error('Error setting up resize/keyboard handlers:', error);
            }
        }

    } catch (error) {
        console.error('Error initializing carousel:', error);
    }
}

// ============================================================================
// Rotating Industry Heading
// ============================================================================

/**
 * Initializes the rotating industry heading with hand-drawn underline.
 * Rotates through industry names and opens menu overlay on click.
 * @returns {void}
 */
function initializeRotatingIndustry() {
    try {
        const rotatingText = document.getElementById('rotating-industry-text');
        if (!rotatingText) {
            console.warn('Rotating industry text element not found');
            return;
        }
        
        const rotatingWord = rotatingText.querySelector('.rotating-industry-word-text');
        const rotatingWordContainer = rotatingText.querySelector('.rotating-industry-word');
        if (!rotatingWord || !rotatingWordContainer) {
            console.warn('Rotating industry word element not found');
            return;
        }

        // Ensure config exists, fallback to defaults if not
        if (!AppConfig || !AppConfig.rotatingIndustry) {
            console.error('AppConfig.rotatingIndustry not found. Using defaults.');
        }
        const config = AppConfig?.rotatingIndustry || {
            industries: ['Military & Defense', 'Remote Businesses', 'Residential Homes', 'Emergency Response', 'Job Sites'],
            rotationInterval: 3500,
            initialDelay: 2000,
            fadeDuration: 300,
            underlineDuration: 600,
            resumeDelay: 2000
        };
        const { industries, rotationInterval, initialDelay, fadeDuration, underlineDuration, resumeDelay } = config;

        // Validate config values
        if (!industries || industries.length === 0) {
            console.error('No industries configured for rotation');
            return;
        }
        if (!rotationInterval || !initialDelay || !fadeDuration) {
            console.error('Invalid rotation timing configuration');
            return;
        }

        let currentIndex = 0;
        let rotationTimer = null;
        let initialTimeout = null;
        let isPaused = false;

        /**
         * Restarts the underline animation by forcing a reflow.
         * @param {HTMLElement} underline - The underline SVG element
         * @returns {void}
         */
        function restartUnderlineAnimation(underline) {
            underline.style.animation = 'none';
            void underline.offsetWidth; // Trigger reflow
            underline.style.animation = `underlineDraw ${underlineDuration}ms ease-out`;
        }

        /**
         * Updates the rotating text with fade animation.
         * @returns {void}
         */
        function updateRotatingText() {
            if (isPaused) return;

            rotatingWord.classList.add('fade-out');
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % industries.length;
                rotatingWord.textContent = industries[currentIndex];
                
                const underline = rotatingWordContainer.querySelector('.hand-drawn-underline');
                if (underline) {
                    restartUnderlineAnimation(underline);
                }
                
                rotatingWord.classList.remove('fade-out');
                rotatingWord.classList.add('fade-in');
                
                setTimeout(() => {
                    rotatingWord.classList.remove('fade-in');
                }, fadeDuration);
            }, fadeDuration);
        }

        /**
         * Handles menu interaction: pauses rotation, opens menu, resumes after delay.
         * @returns {void}
         */
        function handleMenuInteraction() {
            pauseRotation();
            openMenuOverlay();
            setTimeout(resumeRotation, resumeDelay);
        }

        /**
         * Starts the rotation timer.
         * @param {number|null} delay - Delay before first rotation (null uses initialDelay)
         * @returns {void}
         */
        function startRotation(delay = null) {
            // Clear any existing timers
            if (rotationTimer) {
                clearInterval(rotationTimer);
                rotationTimer = null;
            }
            if (initialTimeout) {
                clearTimeout(initialTimeout);
                initialTimeout = null;
            }
            
            // Only start if not paused
            if (isPaused) {
                return;
            }
            
            // Use provided delay or default to initialDelay
            const firstDelay = delay !== null ? delay : initialDelay;
            
            // First rotation after delay, then continue with regular interval
            initialTimeout = setTimeout(() => {
                initialTimeout = null;
                if (!isPaused) {
                    updateRotatingText();
                    rotationTimer = setInterval(updateRotatingText, rotationInterval);
                }
            }, firstDelay);
        }

        /**
         * Pauses rotation when user interacts with the element.
         * @returns {void}
         */
        function pauseRotation() {
            isPaused = true;
            if (rotationTimer) {
                clearInterval(rotationTimer);
                rotationTimer = null;
            }
            if (initialTimeout) {
                clearTimeout(initialTimeout);
                initialTimeout = null;
            }
        }

        /**
         * Resumes rotation after user interaction.
         * @returns {void}
         */
        function resumeRotation() {
            if (isPaused) {
                isPaused = false;
                startRotation();
            }
        }

        // Click handler
        rotatingText.addEventListener('click', handleMenuInteraction);

        // Keyboard support (Enter and Space)
        rotatingText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMenuInteraction();
            }
        });

        // Pause/resume on hover/focus
        rotatingText.addEventListener('mouseenter', pauseRotation);
        rotatingText.addEventListener('focus', pauseRotation);
        rotatingText.addEventListener('mouseleave', resumeRotation);
        rotatingText.addEventListener('blur', resumeRotation);

        // Ensure we're not paused when starting and explicitly start rotation
        isPaused = false;
        startRotation(initialDelay);
    } catch (error) {
        console.error('Error initializing rotating industry:', error);
    }
}

// ============================================================================
// Banner H1 Click Handler (Industry Pages)
// ============================================================================

/**
 * Initializes click handlers for banner h1 elements on industry pages.
 * Opens the menu overlay when the h1 is clicked.
 * @returns {void}
 */
function initializeBannerH1Click() {
    try {
        const bannerH1Text = document.querySelector('.banner-h1-text');
        if (!bannerH1Text) {
            // Not an industry page, or element doesn't exist
            return;
        }

        // Click handler
        bannerH1Text.addEventListener('click', openMenuOverlay);

        // Keyboard support (Enter and Space)
        bannerH1Text.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openMenuOverlay();
            }
        });
    } catch (error) {
        console.error('Error initializing banner h1 click handler:', error);
    }
}

// ============================================================================
// Footer Copyright Year
// ============================================================================

/**
 * Updates the copyright year in the footer to the current year.
 * @returns {void}
 */
function initializeCopyrightYear() {
    try {
        const yearElement = document.getElementById('copyright-year');
        if (yearElement) {
            const currentYear = new Date().getFullYear();
            yearElement.textContent = currentYear;
            yearElement.setAttribute('datetime', currentYear);
        }
    } catch (error) {
        console.error('Error updating copyright year:', error);
    }
}

// ============================================================================
// FAQ Accordions
// ============================================================================

/**
 * Initializes FAQ accordion functionality.
 * Handles opening/closing accordion items with smooth animations and ARIA attributes.
 * @returns {void}
 */
function initializeAccordions() {
    try {
        const accordionButtons = document.querySelectorAll('.accordion-button');
        
        if (accordionButtons.length === 0) {
            return; // No accordions found
        }

        accordionButtons.forEach(button => {
            button.addEventListener('click', function() {
                try {
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    const contentId = this.getAttribute('aria-controls');
                    const content = document.getElementById(contentId);
                    
                    if (!content) {
                        console.warn(`Accordion content not found: ${contentId}`);
                        return;
                    }

                    // Close all other accordions (optional - remove if you want multiple open)
                    accordionButtons.forEach(otherButton => {
                        if (otherButton !== this) {
                            const otherIsExpanded = otherButton.getAttribute('aria-expanded') === 'true';
                            if (otherIsExpanded) {
                                const otherContentId = otherButton.getAttribute('aria-controls');
                                const otherContent = document.getElementById(otherContentId);
                                if (otherContent) {
                                    otherButton.setAttribute('aria-expanded', 'false');
                                    otherContent.setAttribute('aria-hidden', 'true');
                                }
                            }
                        }
                    });

                    // Toggle current accordion
                    if (isExpanded) {
                        this.setAttribute('aria-expanded', 'false');
                        content.setAttribute('aria-hidden', 'true');
                        announceToScreenReader('Accordion closed');
                    } else {
                        this.setAttribute('aria-expanded', 'true');
                        content.setAttribute('aria-hidden', 'false');
                        const questionText = this.querySelector('.accordion-question')?.textContent || 'Accordion';
                        announceToScreenReader(`${questionText} expanded`);
                    }
                } catch (error) {
                    console.error('Error toggling accordion:', error);
                }
            });

            // Keyboard support (Enter and Space)
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    } catch (error) {
        console.error('Error initializing accordions:', error);
    }
}

