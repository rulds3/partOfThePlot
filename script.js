/* =========================================
/* =========================================
   LOAD SHARED HEADER
========================================= */

const siteHeader = document.getElementById("site-header");

if (siteHeader) {

    fetch("header.html")
        .then(response => {

            if (!response.ok) {
                throw new Error("Could not load header.html");
            }

            return response.text();

        })
        .then(html => {

            siteHeader.innerHTML = html;

            initializeNavigation();

        })
        .catch(error => {

            console.error("Header loading error:", error);

        });

}


/* =========================================
   LOAD SHARED FOOTER
========================================= */

const siteFooter = document.getElementById("site-footer");

if (siteFooter) {

    fetch("footer.html")
        .then(response => {

            if (!response.ok) {
                throw new Error("Could not load footer.html");
            }

            return response.text();

        })
        .then(html => {

            siteFooter.innerHTML = html;

        })
        .catch(error => {

            console.error("Footer loading error:", error);

        });

}


/* =========================================
   PART OF THE PLOT
   JavaScript
========================================= */


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
        document.querySelector(".nav-dropdown-title");


    /* -----------------------------------------
       MOBILE MENU
    ----------------------------------------- */

    if (menuToggle && navMenu) {

        menuToggle.addEventListener("click", () => {

            const isOpen =
                navMenu.classList.toggle("active");

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        });


        /* Close menu when a regular link is clicked */

        const navLinks =
            navMenu.querySelectorAll("a");

        navLinks.forEach(link => {

            link.addEventListener("click", () => {

                /*
                 * On mobile, the Games title opens
                 * the dropdown instead of navigating.
                 */
                if (
                    link.classList.contains(
                        "nav-dropdown-title"
                    ) &&
                    window.innerWidth <= 900
                ) {
                    return;
                }

                navMenu.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    /* -----------------------------------------
       GAMES DROPDOWN
    ----------------------------------------- */

    if (gamesDropdown && gamesTitle) {

        gamesTitle.addEventListener("click", event => {

            if (window.innerWidth <= 900) {

                event.preventDefault();

                const isOpen =
                    gamesDropdown.classList.toggle("active");

                gamesTitle.setAttribute(
                    "aria-expanded",
                    isOpen ? "true" : "false"
                );

            }

        });

    }

}


/* =========================================
   FAQ ACCORDION
========================================= */

const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(question => {

    question.addEventListener("click", () => {

        const faqItem = question.parentElement;
        const answer = faqItem.querySelector(".faq-answer");

        // Close all other FAQ items
        document.querySelectorAll(".faq-item").forEach(item => {

            if (item !== faqItem) {

                item.classList.remove("active");

                const otherAnswer =
                    item.querySelector(".faq-answer");

                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }

            }

        });

        // Toggle selected FAQ item
        faqItem.classList.toggle("active");

        if (faqItem.classList.contains("active")) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            answer.style.maxHeight = null;
        }

    });

});


/* =========================================
   FADE-IN ANIMATIONS
========================================= */

const sections = document.querySelectorAll(
    ".section, .how-it-works, .faq, .contact"
);

if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";

                    observer.unobserve(entry.target);

                }

            });

        },

        {
            threshold: 0.1
        }

    );

    sections.forEach(section => {

        section.style.opacity = "0";
        section.style.transform = "translateY(25px)";
        section.style.transition =
            "opacity 0.8s ease, transform 0.8s ease";

        observer.observe(section);

    });

}


/* =========================================
   SCHEDULING MODAL
========================================= */

const scheduleModal =
    document.getElementById("scheduleModal");

const closeModal =
    document.getElementById("closeModal");

const scheduleButtons =
    document.querySelectorAll(".schedule-button");


/* -----------------------------------------
   OPEN SCHEDULE MODAL
----------------------------------------- */

function openScheduleModal() {

    if (!scheduleModal) return;

    scheduleModal.classList.add("active");

    scheduleModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";

}


/* -----------------------------------------
   CLOSE SCHEDULE MODAL
----------------------------------------- */

function closeScheduleModal() {

    if (!scheduleModal) return;

    scheduleModal.classList.remove("active");

    scheduleModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";

}


/* -----------------------------------------
   SCHEDULE BUTTONS
----------------------------------------- */

scheduleButtons.forEach(button => {

    button.addEventListener("click", openScheduleModal);

});


/* -----------------------------------------
   CLOSE BUTTON
----------------------------------------- */

if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeScheduleModal
    );

}


/* -----------------------------------------
   CLICK OUTSIDE MODAL
----------------------------------------- */

if (scheduleModal) {

    scheduleModal.addEventListener(
        "click",
        event => {

            if (event.target === scheduleModal) {

                closeScheduleModal();

            }

        }
    );

}


/* -----------------------------------------
   ESCAPE KEY
----------------------------------------- */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            scheduleModal &&
            scheduleModal.classList.contains("active")
        ) {

            closeScheduleModal();

        }

    }
);

/* =========================================
   FORM SUBMISSION HELPER
========================================= */

async function submitForm(form, successElement, options = {}) {

    const submitButton =
        form.querySelector("button[type='submit']");

    if (!submitButton) return;

    const originalButtonText =
        submitButton.textContent;

    submitButton.textContent = "Sending...";
    submitButton.disabled = true;

    const formData = new FormData(form);

    try {

        const response = await fetch(form.action, {

            method: "POST",

            body: formData,

            headers: {
                "Accept": "application/json"
            }

        });

        if (!response.ok) {
            throw new Error("Form submission failed.");
        }

        // Successful submission
        form.reset();

        if (options.hideForm) {
            form.style.display = "none";
        }

        if (successElement) {

            successElement.textContent =
                options.successMessage ||
                "Message sent! Thank you for reaching out.";

            successElement.style.display = "block";

        }

        submitButton.textContent =
            options.successButtonText || "Sent";

    } catch (error) {

        if (successElement) {

            successElement.textContent =
                "Something went wrong. Please try again.";

            successElement.style.display = "block";

        }

        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;

    }

}


/* =========================================
   CONTACT FORM
========================================= */

const contactForm =
    document.getElementById("contact-form");

const contactSuccess =
    document.getElementById("contact-success");


if (contactForm) {

    contactForm.addEventListener("submit", event => {

        event.preventDefault();

        submitForm(
            contactForm,
            contactSuccess,
            {
                successMessage:
                    "Message Sent! Thank you for reaching out. I'll be in touch soon.",

                successButtonText:
                    "Message Sent"
            }
        );

    });

}


/* =========================================
   SCHEDULING FORM
========================================= */

const scheduleForm =
    document.getElementById("scheduleForm");

const scheduleSuccess =
    document.getElementById("schedule-success");


if (scheduleForm) {

    scheduleForm.addEventListener("submit", event => {

        event.preventDefault();


        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        const todayString = `${year}-${month}-${day}`;


        if (dateInput && dateInput.value < todayString) {

            alert("Please choose today or a future date.");

            dateInput.focus();

            return;
        }


        if (
            backupDateInput &&
            backupDateInput.value &&
            backupDateInput.value < todayString
        ) {

            alert("Please choose today or a future date.");

            backupDateInput.focus();

            return;
        }


        submitForm(
            scheduleForm,
            scheduleSuccess,
            {
                hideForm: true,

                successMessage:
                    "Scheduling Request Sent! Thank you! Your request has been received. I'll review your details and get back to you soon to work out the perfect date, game, and location.",

                successButtonText:
                    "Request Sent"
            }
        );

    });

}


/* =========================================
   GAME PLAYER OPTIONS
========================================= */

const gameSelect = document.getElementById("game");
const playersSelect = document.getElementById("players");
const playerHelp = document.getElementById("playerHelp");


if (gameSelect && playersSelect) {

    gameSelect.addEventListener("change", function () {

        const game = this.value;

        // Clear current options
        playersSelect.innerHTML = "";

if (!game) {

    const option = document.createElement("option");

    option.value = "";
    option.textContent = "Choose number of players";

    playersSelect.appendChild(option);

    playerHelp.textContent =
        "Select a game to see the available player numbers.";

    return;

}


        let minimum;
        let maximum;
        let genderRequirement = "";


        /* SPELLBOUND */

        if (game === "Spellbound") {

            minimum = 13;
            maximum = 17;

            genderRequirement =
                "At least 5 female and 4 male players are required.";

        }


        /* WAY OUT WEST */

        else if (game === "Way Out West") {

            // Change these numbers when you decide
            // how many players this game will support.

            minimum = 10;
            maximum = 20;

        }


        /* DEAD MAN'S CHEST */

        else if (game === "A Dead Man's Chest") {

            minimum = 12;
            maximum = 16;

        }


// Add placeholder so no player count is selected automatically

const placeholder = document.createElement("option");

placeholder.value = "";
placeholder.textContent = "Select number of players";
placeholder.disabled = true;
placeholder.selected = true;

playersSelect.appendChild(placeholder);


// Create valid player choices

for (
    let number = minimum;
    number <= maximum;
    number++
) {

    const option =
        document.createElement("option");

    option.value = number;
    option.textContent = number + " players";

    playersSelect.appendChild(option);

}


playerHelp.textContent =
    minimum +
    "–" +
    maximum +
    " players. At least 5 female and 4 male players are required.";


        // Help text below the dropdown

        if (genderRequirement) {

            playerHelp.textContent =
                genderRequirement;

        }

        else {

            playerHelp.textContent =
                "This game can accommodate " +
                minimum +
                "–" +
                maximum +
                " players.";

        }

    });

}


/* =========================================
   PRESELECT GAME FROM URL
========================================= */

if (gameSelect) {

    const urlParams = new URLSearchParams(window.location.search);
    const requestedGame = urlParams.get("game");

    if (requestedGame) {

        const gameOption =
            Array.from(gameSelect.options).find(
                option => option.value === requestedGame
            );

        if (gameOption) {

            gameSelect.value = requestedGame;

            // Trigger the change event so the
            // player dropdown is populated too.
            gameSelect.dispatchEvent(
                new Event("change")
            );

            // Open the scheduling form automatically
            if (scheduleModal) {
                openScheduleModal();
            }

        }

    }

}



/* =========================================
   CHARACTER INFORMATION TIMING
========================================= */

const characterTiming =
    document.querySelectorAll(
        'input[name="characterTiming"]'
    );

const characterEmailsGroup =
    document.getElementById("characterEmailsGroup");


characterTiming.forEach(radio => {

    radio.addEventListener("change", function () {

        if (
            this.value === "Before the party" &&
            this.checked
        ) {

            characterEmailsGroup.style.display = "block";

        }

        else if (
            this.value === "At the party" &&
            this.checked
        ) {

            characterEmailsGroup.style.display = "none";

        }

    });

});

/* =========================================
   PREVENT PAST DATES
========================================= */

const dateInput = document.getElementById("date");
const backupDateInput = document.getElementById("backupDate");


function getTodayString() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* -----------------------------------------
   SET CALENDAR MINIMUM DATE
----------------------------------------- */

function setMinimumDates() {

    const todayString = getTodayString();

    if (dateInput) {
        dateInput.min = todayString;
    }

    if (backupDateInput) {
        backupDateInput.min = todayString;
    }

}


/* -----------------------------------------
   VALIDATE DATE WHEN USER LEAVES FIELD
----------------------------------------- */

function validateDateInput(input) {

    if (!input || !input.value) {
        input.setCustomValidity("");
        return true;
    }

    const todayString = getTodayString();

    if (input.value < todayString) {

        input.setCustomValidity(
            "Please choose today or a future date."
        );

        input.reportValidity();

        return false;

    }

    input.setCustomValidity("");

    return true;

}


/* -----------------------------------------
   PREFERRED DATE
----------------------------------------- */

if (dateInput) {

    dateInput.addEventListener("blur", function () {

        validateDateInput(dateInput);

    });

}


/* -----------------------------------------
   BACKUP DATE
----------------------------------------- */

if (backupDateInput) {

    backupDateInput.addEventListener("blur", function () {

        validateDateInput(backupDateInput);

    });

}


/* -----------------------------------------
   SET MINIMUM DATES
----------------------------------------- */

setMinimumDates();


