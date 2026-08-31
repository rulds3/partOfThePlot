/* =========================================
   PART OF THE PLOT
   JavaScript
========================================= */


/* =========================================
   SITE ROOT
========================================= */

function getSiteRoot() {
    const path = window.location.pathname;
    const gamesFolder = "/games/";
    const gamesPosition = path.indexOf(gamesFolder);

    if (gamesPosition !== -1) {
        return path.substring(0, gamesPosition) + "/";
    }

    const lastSlash = path.lastIndexOf("/");

    return path.substring(0, lastSlash + 1);
}

const siteRoot = getSiteRoot();


/* =========================================
   GAME PRICING
========================================= */

/*
 * CHANGE GAME PRICES HERE.
 *
 * These prices are used throughout the website.
 */

const GAME_PRICES = {
    "Spellbound": 300,
		//300, 450, 600
    "Way Out West": 225,
		//225, 325, 425
    "A Dead Man's Chest": 225
		//225, 325, 425
};


/* =========================================
   LOAD SHARED HEADER
========================================= */

const siteHeader = document.getElementById("site-header");

if (siteHeader) {
    fetch(siteRoot + "header.html")
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
   LOAD SHARED FOOTER
========================================= */

const siteFooter = document.getElementById("site-footer");

if (siteFooter) {
    fetch(siteRoot + "footer.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load footer.html");
            }

            return response.text();
        })
        .then(html => {
            siteFooter.innerHTML = html;
            fixSharedLinks(siteFooter);
        })
        .catch(error => {
            console.error("Footer loading error:", error);
        });
}


/* =========================================
   NAVIGATION
========================================= */

function initializeNavigation() {
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");
    const gamesDropdown = document.querySelector(".nav-dropdown");
    const gamesTitle = document.querySelector(".nav-dropdown-title");

    if (!navMenu) {
        return;
    }


    /* -----------------------------------------
       NAVIGATION LINKS
    ----------------------------------------- */

    const navLinks = navMenu.querySelectorAll("a");

    navLinks.forEach(link => {
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


    /* -----------------------------------------
       LOGO
    ----------------------------------------- */

    const siteLogo = document.getElementById("siteLogo");

    if (siteLogo) {
        siteLogo.src = siteRoot + "partOfThePlotLogo.png";

        const logoLink = siteLogo.closest("a");

        if (logoLink) {
            logoLink.href = siteRoot + "index.html";
        }
    }


    /* -----------------------------------------
       MOBILE MENU
    ----------------------------------------- */

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("active");

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );
        });


        navLinks.forEach(link => {
            link.addEventListener("click", () => {

                if (
                    link.classList.contains("nav-dropdown-title") &&
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

function initializeFAQ() {
    const faqQuestions =
        document.querySelectorAll(".faq-question");


    function openFAQ(faqItem, scrollToItem = false) {
        if (!faqItem) {
            return;
        }

        const answer =
            faqItem.querySelector(".faq-answer");

        const question =
            faqItem.querySelector(".faq-question");

        if (!answer || !question) {
            return;
        }


        document.querySelectorAll(".faq-item").forEach(item => {
            if (item !== faqItem) {
                item.classList.remove("active");

                const otherAnswer =
                    item.querySelector(".faq-answer");

                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }

                const otherQuestion =
                    item.querySelector(".faq-question");

                if (otherQuestion) {
                    otherQuestion.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        });


        faqItem.classList.add("active");

        question.setAttribute(
            "aria-expanded",
            "true"
        );

        answer.style.maxHeight =
            answer.scrollHeight + 50 + "px";


        if (scrollToItem) {
            setTimeout(() => {
                faqItem.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 100);
        }
    }


    faqQuestions.forEach(question => {
        question.addEventListener("click", () => {
            const faqItem =
                question.closest(".faq-item");

            if (!faqItem) {
                return;
            }

            const isCurrentlyOpen =
                faqItem.classList.contains("active");


            if (isCurrentlyOpen) {
                faqItem.classList.remove("active");

                question.setAttribute(
                    "aria-expanded",
                    "false"
                );

                const answer =
                    faqItem.querySelector(".faq-answer");

                if (answer) {
                    answer.style.maxHeight = null;
                }

                return;
            }


            openFAQ(faqItem);
        });
    });


    function openFAQFromHash() {
        const hash = window.location.hash;

        if (!hash) {
            return;
        }

        const id =
            decodeURIComponent(hash.substring(1));

        if (!id) {
            return;
        }

        const faqItem =
            document.getElementById(id);

        if (
            faqItem &&
            faqItem.classList.contains("faq-item")
        ) {
            openFAQ(faqItem, true);
        }
    }


    openFAQFromHash();

    window.addEventListener(
        "hashchange",
        openFAQFromHash
    );
}


/* =========================================
   DISPLAY GAME PRICES
========================================= */

function initializeGamePrices() {
    const priceElements =
        document.querySelectorAll(
            ".game-price, .spellbound-price-amount"
        );

    priceElements.forEach(element => {
        const gameName =
            element.dataset.game;

        if (!gameName) {
            return;
        }

        const price =
            GAME_PRICES[gameName];

        if (price === undefined) {
            console.warn(
                "No price found for:",
                gameName
            );

            return;
        }

        element.textContent =
            "$" + price.toLocaleString();
    });
}


/* =========================================
   INITIALIZE PAGE FUNCTIONS
========================================= */

function initializePage() {
    initializeFAQ();
    initializeGamePrices();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializePage
    );
} else {
    initializePage();
}


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
                    entry.target.style.transform =
                        "translateY(0)";

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
   LOAD SHARED SCHEDULING MODAL
========================================= */

const scheduleContainer =
    document.getElementById("schedule-modal-container");

if (scheduleContainer) {
    fetch(siteRoot + "schedule.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load schedule.html");
            }

            return response.text();
        })
        .then(html => {
            scheduleContainer.innerHTML = html;

            initializeGamePlayerOptions();
            initializeScheduling();
            initializeSchedulingForm();
        })
        .catch(error => {
            console.error(
                "Scheduling modal loading error:",
                error
            );
        });
}


/* =========================================
   SCHEDULING MODAL
========================================= */

function initializeScheduling() {
    const scheduleModal =
        document.getElementById("scheduleModal");

    const closeModal =
        document.getElementById("closeModal");


    /* -----------------------------------------
       OPEN MODAL
    ----------------------------------------- */

    function openScheduleModal() {
        if (!scheduleModal) {
            console.error("scheduleModal was not found.");
            return;
        }

        scheduleModal.classList.add("active");

        scheduleModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";
    }


    /* -----------------------------------------
       CLOSE MODAL
    ----------------------------------------- */

    function closeScheduleModal() {
        if (!scheduleModal) {
            return;
        }

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

    const scheduleButtons =
        document.querySelectorAll(
            "#scheduleButton, .schedule-button"
        );

    scheduleButtons.forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();

            const requestedGame =
                button.dataset.game;

            const gameSelect =
                document.getElementById("game");

            if (requestedGame && gameSelect) {
                const gameOption =
                    Array.from(gameSelect.options).find(
                        option =>
                            option.value === requestedGame
                    );

                if (gameOption) {
                    gameSelect.value = requestedGame;

                    gameSelect.dispatchEvent(
                        new Event("change")
                    );
                }
            }

            openScheduleModal();
        });
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

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            scheduleModal &&
            scheduleModal.classList.contains("active")
        ) {
            closeScheduleModal();
        }
    });
}


/* =========================================
   SCHEDULING FORM
========================================= */

function initializeSchedulingForm() {
    const scheduleForm =
        document.getElementById("scheduleForm");

    const scheduleSuccess =
        document.getElementById("schedule-success");

    const dateInput =
        document.getElementById("schedule-date");

    const backupDateInput =
        document.getElementById("schedule-backup-date");

    if (!scheduleForm) {
        return;
    }


    const scheduleFormLoadedAt = Date.now();

    let scheduleSubmissionLocked = false;


    /* =========================================
       CHARACTER ASSIGNMENT
    ========================================= */

    const assignmentRadios =
        document.querySelectorAll(
            'input[name="characterAssignment"]'
        );

    const characterInfo =
        document.getElementById("character-info");

    const characterPlayers =
        document.getElementById("character-players");

    const playersSelect =
        document.getElementById("players");

    const characterNotes =
        characterInfo
            ? characterInfo.querySelector(
                ".character-notes-section"
            )
            : null;

    const playerInformationLabel =
        characterInfo
            ? characterInfo.querySelector(":scope > label")
            : null;

    const playerInformationHelp =
        characterInfo
            ? characterInfo.querySelector(
                ":scope > .form-help"
            )
            : null;


    function updateCharacterFields() {
        const selectedAssignment =
            document.querySelector(
                'input[name="characterAssignment"]:checked'
            );

        const isAheadOfTime =
            selectedAssignment &&
            selectedAssignment.value === "ahead";


        if (characterInfo) {
            characterInfo.style.display = "block";
        }

        if (characterNotes) {
            characterNotes.style.display = "block";
        }


        if (!isAheadOfTime) {
            if (playerInformationLabel) {
                playerInformationLabel.style.display = "none";
            }

            if (playerInformationHelp) {
                playerInformationHelp.style.display = "none";
            }

            if (characterPlayers) {
                characterPlayers.innerHTML = "";
                characterPlayers.style.display = "none";
            }

            return;
        }


        if (playerInformationLabel) {
            playerInformationLabel.style.display = "";
        }

        if (playerInformationHelp) {
            playerInformationHelp.style.display = "";
        }

        if (characterPlayers) {
            characterPlayers.style.display = "block";
        }


        const numberOfPlayers =
            parseInt(playersSelect.value);

        if (!numberOfPlayers || numberOfPlayers < 1) {
            if (characterPlayers) {
                characterPlayers.innerHTML =
                    '<p class="form-help">Choose the number of players above first.</p>';
            }

            return;
        }


        characterPlayers.innerHTML = "";


        for (
            let i = 1;
            i <= numberOfPlayers;
            i++
        ) {
            const playerGroup =
                document.createElement("div");

            playerGroup.className =
                "character-player";

            playerGroup.innerHTML = `
                <h4>Player ${i}</h4>

                <div class="form-row">

                    <div class="form-group">
                        <label for="player-${i}-name">
                            Name *
                        </label>

                        <input
                            type="text"
                            id="player-${i}-name"
                            name="player${i}Name"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="player-${i}-email">
                            Email *
                        </label>

                        <input
                            type="email"
                            id="player-${i}-email"
                            name="player${i}Email"
                            required
                        >
                    </div>

                </div>
            `;

            characterPlayers.appendChild(playerGroup);
        }
    }


    /* =========================================
       CREATE RESERVATION IN SUPABASE
    ========================================= */

    async function submitReservationToSupabase(
        reservationData,
        form,
        successElement
    ) {
        const submitButton =
            form.querySelector("button[type='submit']");

        if (!submitButton) {
            return;
        }


        const originalButtonText =
            submitButton.textContent;

        submitButton.textContent = "Sending...";
        submitButton.disabled = true;


        try {
            const response = await fetch(
                "https://fqcabbpvevtlzzwsvezi.supabase.co/functions/v1/create-reservation",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(reservationData)
                }
            );


            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Unable to create reservation."
                );
            }


            /* SUCCESS */

            form.reset();
            form.style.display = "none";

            if (successElement) {
                successElement.textContent =
                    "Your scheduling request has been sent! Thank you for reaching out. I’ve received your request and will get back to you soon to work out the details.";

                successElement.style.display = "block";
            }

            submitButton.textContent = "Request Sent";
        }


        /* ERROR */

        catch (error) {
            console.error(
                "Reservation submission error:",
                error
            );

            scheduleSubmissionLocked = false;

            if (successElement) {
                successElement.textContent =
                    error.message ||
                    "Something went wrong. Please try again.";

                successElement.style.display = "block";
            }

            submitButton.textContent =
                originalButtonText;

            submitButton.disabled = false;
        }
    }


    /* -----------------------------------------
       WATCH ASSIGNMENT CHOICE
    ----------------------------------------- */

    assignmentRadios.forEach(radio => {
        radio.addEventListener(
            "change",
            updateCharacterFields
        );
    });


    /* -----------------------------------------
       WATCH NUMBER OF PLAYERS
    ----------------------------------------- */

    if (playersSelect) {
        playersSelect.addEventListener(
            "change",
            () => {
                const selectedAssignment =
                    document.querySelector(
                        'input[name="characterAssignment"]:checked'
                    );

                if (
                    selectedAssignment &&
                    selectedAssignment.value === "ahead"
                ) {
                    updateCharacterFields();
                }
            }
        );
    }


    updateCharacterFields();


    /* -----------------------------------------
       SET MINIMUM DATES
    ----------------------------------------- */

    const todayString = getTodayString();

    if (dateInput) {
        dateInput.min = todayString;
    }

    if (backupDateInput) {
        backupDateInput.min = todayString;
    }


    /* -----------------------------------------
       VALIDATE DATES
    ----------------------------------------- */

    if (dateInput) {
        dateInput.addEventListener(
            "blur",
            () => validateDateInput(dateInput)
        );
    }

    if (backupDateInput) {
        backupDateInput.addEventListener(
            "blur",
            () => validateDateInput(backupDateInput)
        );
    }


    /* -----------------------------------------
       FORM SUBMISSION
    ----------------------------------------- */

    scheduleForm.addEventListener(
        "submit",
        event => {
            event.preventDefault();


            /* HONEYPOT CHECK */

            const honeypot =
                scheduleForm.querySelector(
                    'input[name="_gotcha"]'
                );

            if (
                honeypot &&
                honeypot.value.trim() !== ""
            ) {
                console.warn(
                    "Spam submission blocked."
                );

                return;
            }


            /* MINIMUM SUBMISSION TIME */

            const timeOnPage =
                Date.now() - scheduleFormLoadedAt;

            if (timeOnPage < 3000) {
                console.warn(
                    "Suspiciously fast scheduling submission blocked."
                );

                return;
            }


            /* SUBMISSION COOLDOWN */

            if (scheduleSubmissionLocked) {
                console.warn(
                    "Duplicate scheduling submission blocked."
                );

                return;
            }

            scheduleSubmissionLocked = true;


            /* CHECK PREFERRED DATE */

            if (
                dateInput &&
                dateInput.value < todayString
            ) {
                alert(
                    "Please choose today or a future date."
                );

                dateInput.focus();

                scheduleSubmissionLocked = false;
                return;
            }


            /* CHECK BACKUP DATE */

            if (
                backupDateInput &&
                backupDateInput.value &&
                backupDateInput.value < todayString
            ) {
                alert(
                    "Please choose today or a future date."
                );

                backupDateInput.focus();

                scheduleSubmissionLocked = false;
                return;
            }


            /* COLLECT FORM DATA */

            const formData =
                new FormData(scheduleForm);

            const reservationData = {};

            formData.forEach((value, key) => {
                reservationData[key] = value;
            });


            /* INCLUDE PRICE */

            const selectedGame =
                formData.get("game");

            if (selectedGame) {
                const selectedPrice =
                    GAME_PRICES[selectedGame];

                if (selectedPrice !== undefined) {
                    reservationData.price =
                        selectedPrice;
                }
            }


            /* SEND TO SUPABASE */

            submitReservationToSupabase(
                reservationData,
                scheduleForm,
                scheduleSuccess
            );
        }
    );
}


/* =========================================
   GAME PLAYER OPTIONS + SCHEDULE PRICE
========================================= */

function initializeGamePlayerOptions() {
    const gameSelect =
        document.getElementById("game");

    const playersSelect =
        document.getElementById("players");

    const playerHelp =
        document.getElementById("playerHelp");

    const priceAmount =
        document.getElementById("schedule-price-amount");

    if (!gameSelect || !playersSelect) {
        return;
    }


    /* -----------------------------------------
       UPDATE SCHEDULE PRICE
    ----------------------------------------- */

    function updateSchedulePrice(game) {

        if (!priceAmount) {
            return;
        }

        const price =
            GAME_PRICES[game];

        if (!game || price === undefined) {
            priceAmount.textContent = "";
            return;
        }

        priceAmount.textContent =
            "$" + price.toLocaleString();
    }


    /* -----------------------------------------
       GAME CHANGE
    ----------------------------------------- */

    gameSelect.addEventListener(
        "change",
        function () {
            const game = this.value;


            /* UPDATE PRICE */

            updateSchedulePrice(game);


            /* CLEAR CURRENT PLAYER OPTIONS */

            playersSelect.innerHTML = "";


            /* NO GAME SELECTED */

            if (!game) {
                const option =
                    document.createElement("option");

                option.value = "";
                option.textContent =
                    "Choose number of players";

                playersSelect.appendChild(option);

                if (playerHelp) {
                    playerHelp.textContent =
                        "Select a game to see the available player numbers.";
                }

                return;
            }


            let minimum;
            let maximum;
            let genderRequirement = "";


            /* -----------------------------------------
               SPELLBOUND
            ----------------------------------------- */

            if (game === "Spellbound") {
                minimum = 13;
                maximum = 17;

                genderRequirement =
                    "At least 5 female and 4 male players are required.";
            }


            /* -----------------------------------------
               WAY OUT WEST
            ----------------------------------------- */

			else if (game === "Way Out West") {
				minimum = 10;
				maximum = 14;

				genderRequirement =
					"10 players - at least 3 Female · 5 Male<br>" +
					"11 players - at least 4 Female · 5 Male<br>" +
					"12+ players - at least 4 Female · 6 Male";
			}


            /* -----------------------------------------
               A DEAD MAN'S CHEST
            ----------------------------------------- */

            else if (game === "A Dead Man's Chest") {
                minimum = 12;
                maximum = 16;
				
				genderRequirement =
                    "At least 4 female and 6 male players are required.";
            }


            /* -----------------------------------------
               PLAYER PLACEHOLDER
            ----------------------------------------- */

            const placeholder =
                document.createElement("option");

            placeholder.value = "";
            placeholder.textContent =
                "Select number of players";

            placeholder.disabled = true;
            placeholder.selected = true;

            playersSelect.appendChild(placeholder);


            /* -----------------------------------------
               CREATE PLAYER OPTIONS
            ----------------------------------------- */

            for (
                let number = minimum;
                number <= maximum;
                number++
            ) {
                const option =
                    document.createElement("option");

                option.value = number;
                option.textContent =
                    number + " players";

                playersSelect.appendChild(option);
            }


            /* -----------------------------------------
               HELP TEXT
            ----------------------------------------- */

            if (playerHelp) {
                if (genderRequirement) {
                    playerHelp.innerHTML =
                        genderRequirement;
                } else {
                    playerHelp.textContent =
                        "This game can accommodate " +
                        minimum +
                        "–" +
                        maximum +
                        " players.";
                }
            }
        }
    );


    /*
     * If a game was already selected when the
     * modal opened, update the price and players.
     */

    if (gameSelect.value) {
        gameSelect.dispatchEvent(
            new Event("change")
        );
    }
}


/* =========================================
   DATE HELPERS
========================================= */

function getTodayString() {
    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================
   VALIDATE DATE INPUT
========================================= */

function validateDateInput(input) {
    if (!input || !input.value) {
        if (input) {
            input.setCustomValidity("");
        }

        return true;
    }


    const todayString =
        getTodayString();


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


/* =========================================
   CONTACT FORM
========================================= */

const contactForm =
    document.getElementById("contact-form");

const contactSuccess =
    document.getElementById("contact-success");

if (contactForm) {

    const contactFormLoadedAt = Date.now();

    let contactSubmissionLocked = false;


    contactForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /* HONEYPOT CHECK */

            const honeypot =
                contactForm.querySelector(
                    'input[name="_gotcha"]'
                );

            if (
                honeypot &&
                honeypot.value.trim() !== ""
            ) {
                console.warn(
                    "Spam submission blocked."
                );

                return;
            }


            /* MINIMUM SUBMISSION TIME */

            const timeOnPage =
                Date.now() - contactFormLoadedAt;

            if (timeOnPage < 3000) {
                console.warn(
                    "Suspiciously fast contact submission blocked."
                );

                return;
            }


            /* SUBMISSION COOLDOWN */

            if (contactSubmissionLocked) {
                console.warn(
                    "Duplicate contact submission blocked."
                );

                return;
            }

            contactSubmissionLocked = true;


            /* GET SUBMIT BUTTON */

            const submitButton =
                contactForm.querySelector(
                    "button[type='submit']"
                );

            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "Send Message";


            if (submitButton) {
                submitButton.textContent = "Sending...";
                submitButton.disabled = true;
            }


            /* COLLECT FORM DATA */

            const formData =
                new FormData(contactForm);

            const contactData = {
                name: formData.get("name"),
                email: formData.get("email"),
                message: formData.get("message"),
                _gotcha: formData.get("_gotcha")
            };


            /* SEND TO SUPABASE */

            try {
                const response =
                    await fetch(
                        "https://fqcabbpvevtlzzwsvezi.supabase.co/functions/v1/send-contact-message",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(contactData)
                        }
                    );


                const result =
                    await response.json();


                /* HANDLE ERROR */

                if (!response.ok) {
                    throw new Error(
                        result.error ||
                        "Unable to send your message."
                    );
                }


                /* SUCCESS */

                contactForm.reset();

                if (contactSuccess) {
                    contactSuccess.textContent =
                        "Message Sent! Thank you for reaching out. I'll be in touch soon.";

                    contactSuccess.style.display =
                        "block";
                }

                if (submitButton) {
                    submitButton.textContent =
                        "Message Sent";
                }
            }


            /* ERROR */

            catch (error) {
                console.error(
                    "Contact submission error:",
                    error
                );

                if (contactSuccess) {
                    contactSuccess.textContent =
                        error.message ||
                        "Something went wrong. Please try again.";

                    contactSuccess.style.display =
                        "block";
                }

                if (submitButton) {
                    submitButton.textContent =
                        originalButtonText;

                    submitButton.disabled = false;
                }


                /* Allow another attempt */

                contactSubmissionLocked = false;
            }
        }
    );
}