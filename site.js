/* =========================================
   PART OF THE PLOT
   site.js

   General site functionality:
   - Site root/path handling
   - Shared header
   - Shared footer
   - Navigation
   - FAQ accordion
   - Fade-in animations
   - Scheduling modal loading

   Does NOT contain:
   - Supabase configuration
   - Game data
   - Game pricing
   - Reservation submission
   - Scheduling logic
========================================= */


/* =========================================
   SITE ROOT
========================================= */

function getSiteRoot() {

    const path =
        window.location.pathname;


    const gamesFolder =
        "/games/";


    const gamesPosition =
        path.indexOf(
            gamesFolder
        );


    /*
     * If this page is inside /games/,
     * return the root of the website.
     */

    if (
        gamesPosition !== -1
    ) {

        return (
            path.substring(
                0,
                gamesPosition
            ) +
            "/"
        );

    }


    /*
     * Otherwise use the current
     * directory.
     */

    const lastSlash =
        path.lastIndexOf(
            "/"
        );


    return (
        path.substring(
            0,
            lastSlash + 1
        )
    );
}


const siteRoot =
    getSiteRoot();


/* =========================================
   FIX SHARED LINKS
========================================= */

function fixSharedLinks(
    container
) {

    if (!container) {
        return;
    }


    const links =
        container.querySelectorAll(
            "a"
        );


    links.forEach(
        link => {

            const href =
                link.getAttribute(
                    "href"
                );


            if (
                href &&
                !href.startsWith(
                    "http"
                ) &&
                !href.startsWith(
                    "#"
                ) &&
                !href.startsWith(
                    "mailto:"
                ) &&
                !href.startsWith(
                    "tel:"
                ) &&
                !href.startsWith(
                    "/"
                )
            ) {

                link.href =
                    siteRoot +
                    href;

            }

        }
    );

}


/* =========================================
   LOAD SHARED HEADER
========================================= */

async function loadSharedHeader() {

    const siteHeader =
        document.getElementById(
            "site-header"
        );


    if (!siteHeader) {
        return;
    }


    try {

        const response =
            await fetch(
                siteRoot +
                "header.html"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load header.html"
            );

        }


        const html =
            await response.text();


        siteHeader.innerHTML =
            html;


        /*
         * Fix relative links inside
         * the dynamically loaded header.
         */

        fixSharedLinks(
            siteHeader
        );


        /*
         * Initialize navigation only
         * after the header exists.
         */

        initializeNavigation();

    }


    catch (error) {

        console.error(
            "Header loading error:",
            error
        );

    }

}


/* =========================================
   LOAD SHARED FOOTER
========================================= */

async function loadSharedFooter() {

    const siteFooter =
        document.getElementById(
            "site-footer"
        );


    if (!siteFooter) {
        return;
    }


    try {

        const response =
            await fetch(
                siteRoot +
                "footer.html"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load footer.html"
            );

        }


        const html =
            await response.text();


        siteFooter.innerHTML =
            html;


        /*
         * Fix relative links inside
         * the dynamically loaded footer.
         */

        fixSharedLinks(
            siteFooter
        );

    }


    catch (error) {

        console.error(
            "Footer loading error:",
            error
        );

    }

}


/* =========================================
   LOAD SCHEDULING MODAL
========================================= */

/*
 * schedule.html is loaded dynamically
 * into:
 *
 *     #schedule-modal-container
 *
 * Scheduling functionality itself belongs
 * in scheduling.js.
 */

async function loadSchedulingModal() {

    const scheduleContainer =
        document.getElementById(
            "schedule-modal-container"
        );


    /*
     * Pages without the scheduling
     * container do not need the modal.
     */

    if (!scheduleContainer) {
        return;
    }


    /*
     * Make sure scheduling.js has
     * loaded before trying to initialize
     * the scheduling system.
     */

    if (
        typeof initializeSchedulingSystem !==
        "function"
    ) {

        console.error(
            "initializeSchedulingSystem() is not available. Make sure scheduling.js is loaded after site.js."
        );

        return;
    }


    try {

        const response =
            await fetch(
                siteRoot +
                "schedule.html"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load schedule.html"
            );

        }


        const html =
            await response.text();


        /*
         * Insert the modal into the page.
         */

        scheduleContainer.innerHTML =
            html;


        /*
         * Fix any links inside the
         * dynamically loaded modal.
         */

        fixSharedLinks(
            scheduleContainer
        );


        /*
         * Initialize scheduling now that
         * schedule.html exists.
         */

        await initializeSchedulingSystem();

    }


    catch (error) {

        console.error(
            "Scheduling modal loading error:",
            error
        );

    }

}


/* =========================================
   NAVIGATION
========================================= */

function initializeNavigation() {

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    const navMenu =
        document.getElementById(
            "navMenu"
        );


    const gamesDropdown =
        document.querySelector(
            ".nav-dropdown"
        );


    const gamesTitle =
        document.querySelector(
            ".nav-dropdown-title"
        );


    /*
     * Stop if the header did not load.
     */

    if (!navMenu) {
        return;
    }


    /* =========================================
       NAVIGATION LINKS
    ========================================= */

    const navLinks =
        navMenu.querySelectorAll(
            "a"
        );


    navLinks.forEach(
        link => {

            const href =
                link.getAttribute(
                    "href"
                );


            if (
                href &&
                !href.startsWith(
                    "http"
                ) &&
                !href.startsWith(
                    "#"
                ) &&
                !href.startsWith(
                    "mailto:"
                ) &&
                !href.startsWith(
                    "tel:"
                ) &&
                !href.startsWith(
                    "/"
                )
            ) {

                link.href =
                    siteRoot +
                    href;

            }

        }
    );


    /* =========================================
       LOGO
    ========================================= */

    const siteLogo =
        document.getElementById(
            "siteLogo"
        );


    if (siteLogo) {

        siteLogo.src =
            siteRoot +
            "partOfThePlotLogo.png";


        const logoLink =
            siteLogo.closest(
                "a"
            );


        if (logoLink) {

            logoLink.href =
                siteRoot +
                "index.html";

        }

    }


    /* =========================================
       MOBILE MENU
    ========================================= */

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            () => {

                const isOpen =
                    navMenu.classList.toggle(
                        "active"
                    );


                menuToggle.setAttribute(
                    "aria-expanded",
                    isOpen
                        ? "true"
                        : "false"
                );

            }
        );


        navLinks.forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        /*
                         * On mobile, clicking
                         * the Games title opens
                         * the dropdown instead of
                         * closing the menu.
                         */

                        if (
                            link.classList.contains(
                                "nav-dropdown-title"
                            ) &&
                            window.innerWidth <= 900
                        ) {

                            return;

                        }


                        navMenu.classList.remove(
                            "active"
                        );


                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

    }


    /* =========================================
       GAMES DROPDOWN
    ========================================= */

    if (
        gamesDropdown &&
        gamesTitle
    ) {

        gamesTitle.addEventListener(
            "click",
            event => {

                /*
                 * Desktop:
                 * allow the Games link to
                 * navigate normally.
                 */

                if (
                    window.innerWidth <= 900
                ) {

                    event.preventDefault();


                    const isOpen =
                        gamesDropdown.classList.toggle(
                            "active"
                        );


                    gamesTitle.setAttribute(
                        "aria-expanded",
                        isOpen
                            ? "true"
                            : "false"
                    );

                }

            }
        );

    }

}


/* =========================================
   FAQ ACCORDION
========================================= */

function initializeFAQ() {

    const faqQuestions =
        document.querySelectorAll(
            ".faq-question"
        );


    if (
        faqQuestions.length === 0
    ) {

        return;

    }


    /* =========================================
       OPEN FAQ
    ========================================= */

    function openFAQ(
        faqItem,
        scrollToItem = false
    ) {

        if (!faqItem) {
            return;
        }


        const answer =
            faqItem.querySelector(
                ".faq-answer"
            );


        const question =
            faqItem.querySelector(
                ".faq-question"
            );


        if (
            !answer ||
            !question
        ) {

            return;

        }


        /*
         * Close all other FAQ items.
         */

        document
            .querySelectorAll(
                ".faq-item"
            )
            .forEach(
                item => {

                    if (
                        item !== faqItem
                    ) {

                        item.classList.remove(
                            "active"
                        );


                        const otherAnswer =
                            item.querySelector(
                                ".faq-answer"
                            );


                        if (otherAnswer) {

                            otherAnswer.style.maxHeight =
                                null;

                        }


                        const otherQuestion =
                            item.querySelector(
                                ".faq-question"
                            );


                        if (otherQuestion) {

                            otherQuestion.setAttribute(
                                "aria-expanded",
                                "false"
                            );

                        }

                    }

                }
            );


        /*
         * Open selected FAQ.
         */

        faqItem.classList.add(
            "active"
        );


        question.setAttribute(
            "aria-expanded",
            "true"
        );


        answer.style.maxHeight =
            answer.scrollHeight +
            50 +
            "px";


        /*
         * When opened from a URL hash,
         * scroll the item into view.
         */

        if (scrollToItem) {

            setTimeout(
                () => {

                    faqItem.scrollIntoView({
                        behavior:
                            "smooth",

                        block:
                            "center"
                    });

                },
                100
            );

        }

    }


    /* =========================================
       FAQ CLICK HANDLERS
    ========================================= */

    faqQuestions.forEach(
        question => {

            question.addEventListener(
                "click",
                () => {

                    const faqItem =
                        question.closest(
                            ".faq-item"
                        );


                    if (!faqItem) {
                        return;
                    }


                    const isCurrentlyOpen =
                        faqItem.classList.contains(
                            "active"
                        );


                    /*
                     * Close an already-open FAQ.
                     */

                    if (
                        isCurrentlyOpen
                    ) {

                        faqItem.classList.remove(
                            "active"
                        );


                        question.setAttribute(
                            "aria-expanded",
                            "false"
                        );


                        const answer =
                            faqItem.querySelector(
                                ".faq-answer"
                            );


                        if (answer) {

                            answer.style.maxHeight =
                                null;

                        }


                        return;

                    }


                    /*
                     * Otherwise open it.
                     */

                    openFAQ(
                        faqItem
                    );

                }
            );

        }
    );


    /* =========================================
       OPEN FAQ FROM URL HASH
    ========================================= */

    function openFAQFromHash() {

        const hash =
            window.location.hash;


        if (!hash) {
            return;
        }


        const id =
            decodeURIComponent(
                hash.substring(1)
            );


        if (!id) {
            return;
        }


        const faqItem =
            document.getElementById(
                id
            );


        if (
            faqItem &&
            faqItem.classList.contains(
                "faq-item"
            )
        ) {

            openFAQ(
                faqItem,
                true
            );

        }

    }


    /*
     * Check the hash when the page loads.
     */

    openFAQFromHash();


    /*
     * Respond to hash changes.
     */

    window.addEventListener(
        "hashchange",
        openFAQFromHash
    );

}


/* =========================================
   FADE-IN ANIMATIONS
========================================= */

function initializeFadeInAnimations() {

    const sections =
        document.querySelectorAll(
            ".section, .how-it-works, .faq, .contact"
        );


    if (
        sections.length === 0
    ) {

        return;

    }


    /*
     * If IntersectionObserver is not
     * available, leave everything visible.
     */

    if (
        !(
            "IntersectionObserver"
            in window
        )
    ) {

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.style.opacity =
                                "1";


                            entry.target.style.transform =
                                "translateY(0)";


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold:
                    0.1
            }
        );


    sections.forEach(
        section => {

            section.style.opacity =
                "0";


            section.style.transform =
                "translateY(25px)";


            section.style.transition =
                "opacity 0.8s ease, transform 0.8s ease";


            observer.observe(
                section
            );

        }
    );

}


/* =========================================
   INITIALIZE SITE
========================================= */

async function initializeSite() {

    /*
     * Load shared components.
     */

    await Promise.all([
        loadSharedHeader(),
        loadSharedFooter()
    ]);


    /*
     * Initialize page-specific
     * site functionality.
     */

    initializeFAQ();

    initializeFadeInAnimations();


    /*
     * Load the scheduling modal if
     * this page contains one.
     */

    await loadSchedulingModal();

}


/* =========================================
   START SITE
========================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSite,
        {
            once: true
        }
    );

}

else {

    initializeSite();

}