/* =========================================
PART OF THE PLOT
site.js

General site functionality:
* Site root/path handling
* Shared header
* Shared footer
* Navigation
* FAQ accordion
* Fade-in animations
* Scheduling modal loading

Does NOT contain:
* Supabase configuration
* Game data
* Game pricing
* Reservation submission
* Scheduling logic
========================================= */


/* =========================================
GOOGLE ANALYTICS
========================================= */

function initializeGoogleAnalytics() {

const measurementId = "G-HC4C1T69RD";

/* Prevent duplicate Google Analytics tags */
if (
    document.querySelector(
        'script[data-google-analytics="true"]'
    )
) {
    return;
}

/* Initialize Google Analytics data layer */
window.dataLayer = window.dataLayer || [];

function gtag() {
    window.dataLayer.push(arguments);
}

window.gtag = gtag;

gtag("js", new Date());
gtag("config", measurementId);

/* Load Google Analytics */
const script = document.createElement("script");

script.async = true;
script.src =
    "https://www.googletagmanager.com/gtag/js?id=" +
    encodeURIComponent(measurementId);

script.setAttribute(
    "data-google-analytics",
    "true"
);

document.head.appendChild(script);

}


/* =========================================
SITE ROOT
========================================= */

function getSiteRoot() {

const path = window.location.pathname;

const gamesFolder = "/games/";

const gamesPosition = path.indexOf(gamesFolder);

if (gamesPosition !== -1) {

    return (
        path.substring(0, gamesPosition) +
        "/"
    );

}

const lastSlash = path.lastIndexOf("/");

return path.substring(0, lastSlash + 1);

}

const siteRoot = getSiteRoot();


/* =========================================
FIX SHARED LINKS
========================================= */

function fixSharedLinks(container) {

if (!container) {
    return;
}

const links = container.querySelectorAll("a");

links.forEach(link => {

    const href = link.getAttribute("href");

    if (
        href &&
        !href.startsWith("http") &&
        !href.startsWith("#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        !href.startsWith("/")
    ) {

        link.href = siteRoot + href;

    }

});

}


/* =========================================
LOAD SHARED HEADER
========================================= */

async function loadSharedHeader() {

const siteHeader =
    document.getElementById("site-header");

if (!siteHeader) {
    return;
}

try {

    const response =
        await fetch(siteRoot + "header.html");

    if (!response.ok) {

        throw new Error(
            "Could not load header.html"
        );

    }

    const html = await response.text();

    siteHeader.innerHTML = html;

    fixSharedLinks(siteHeader);

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
    document.getElementById("site-footer");

if (!siteFooter) {
    return;
}

try {

    const response =
        await fetch(siteRoot + "footer.html");

    if (!response.ok) {

        throw new Error(
            "Could not load footer.html"
        );

    }

    const html = await response.text();

    siteFooter.innerHTML = html;

    fixSharedLinks(siteFooter);

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
* #schedule-modal-container
*
* Scheduling functionality itself belongs
* in scheduling.js.
*/

async function loadSchedulingModal() {

const scheduleContainer =
    document.getElementById(
        "schedule-modal-container"
    );

if (!scheduleContainer) {
    return;
}

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
        await fetch(siteRoot + "schedule.html");

    if (!response.ok) {

        throw new Error(
            "Could not load schedule.html"
        );

    }

    const html = await response.text();

    scheduleContainer.innerHTML = html;

    fixSharedLinks(scheduleContainer);

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
    document.getElementById("menuToggle");

const navMenu =
    document.getElementById("navMenu");

const gamesDropdown =
    document.querySelector(".nav-dropdown");

const gamesTitle =
    document.querySelector(
        ".nav-dropdown-title"
    );

if (!navMenu) {
    return;
}

const navLinks =
    navMenu.querySelectorAll("a");

navLinks.forEach(link => {

    const href =
        link.getAttribute("href");

    if (
        href &&
        !href.startsWith("http") &&
        !href.startsWith("#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        !href.startsWith("/")
    ) {

        link.href =
            siteRoot + href;

    }

});


/* LOGO */

const siteLogo =
    document.getElementById("siteLogo");

if (siteLogo) {

    siteLogo.src =
        siteRoot +
        "partOfThePlotLogo.png";

    const logoLink =
        siteLogo.closest("a");

    if (logoLink) {

        logoLink.href =
            siteRoot + "index.html";

    }

}


/* MOBILE MENU */

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
                isOpen ? "true" : "false"
            );

        }
    );

    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

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

    });

}


/* GAMES DROPDOWN */

if (
    gamesDropdown &&
    gamesTitle
) {

    gamesTitle.addEventListener(
        "click",
        event => {

            if (window.innerWidth <= 900) {

                event.preventDefault();

                const isOpen =
                    gamesDropdown.classList.toggle(
                        "active"
                    );

                gamesTitle.setAttribute(
                    "aria-expanded",
                    isOpen ? "true" : "false"
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

if (faqQuestions.length === 0) {
    return;
}

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

    document
        .querySelectorAll(".faq-item")
        .forEach(item => {

            if (item !== faqItem) {

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

        });

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

    if (scrollToItem) {

        setTimeout(() => {

            faqItem.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 100);

    }

}


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

                if (isCurrentlyOpen) {

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

                openFAQ(faqItem);

            }
        );

    }
);


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
        document.getElementById(id);

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

openFAQFromHash();

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

if (sections.length === 0) {
    return;
}

if (
    !("IntersectionObserver" in window)
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
            threshold: 0.05
        }
    );


sections.forEach(section => {

    section.style.opacity = "1";

    section.style.transform =
        "translateY(0)";

    section.style.transition =
        "opacity 0.8s ease, transform 0.8s ease";

    observer.observe(section);

});


setTimeout(() => {

    sections.forEach(section => {

        section.style.opacity =
            "1";

        section.style.transform =
            "translateY(0)";

    });

}, 2000);

}


/* =========================================
INITIALIZE SITE
========================================= */

async function initializeSite() {

initializeGoogleAnalytics();

await Promise.all([
    loadSharedHeader(),
    loadSharedFooter()
]);

initializeFAQ();

initializeFadeInAnimations();

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