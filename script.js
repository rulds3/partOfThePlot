/* =========================================
   PART OF THE PLOT
   JavaScript
========================================= */


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

const faqQuestions =
    document.querySelectorAll(".faq-question");

faqQuestions.forEach(question => {

    question.addEventListener("click", () => {

        const faqItem =
            question.parentElement;

        const answer =
            faqItem.querySelector(".faq-answer");


        /* Close all other FAQ items */

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


        /* Toggle selected FAQ item */

        faqItem.classList.toggle("active");

        if (faqItem.classList.contains("active")) {

            answer.style.maxHeight =
                answer.scrollHeight + "px";

        }

        else {

            answer.style.maxHeight = null;

        }

    });

});


/* =========================================
   FADE-IN ANIMATIONS
========================================= */

const sections =
    document.querySelectorAll(
        ".section, .how-it-works, .faq, .contact"
    );

if ("IntersectionObserver" in window) {

    const observer =
        new IntersectionObserver(

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

        section.style.transform =
            "translateY(25px)";

        section.style.transition =
            "opacity 0.8s ease, transform 0.8s ease";

        observer.observe(section);

    });

}


/* =========================================
   LOAD SHARED SCHEDULING MODAL
========================================= */

const scheduleContainer =
    document.getElementById(
        "schedule-modal-container"
    );


if (scheduleContainer) {

    fetch("schedule.html")
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Could not load schedule.html"
                );
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

            console.error(
                "scheduleModal was not found."
            );

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

    const scheduleButtons =
        document.querySelectorAll(
            "#scheduleButton, .schedule-button"
        );


    scheduleButtons.forEach(button => {

        button.addEventListener("click", event => {

            event.preventDefault();


            /* -----------------------------------------
               PRESELECT GAME IF BUTTON SPECIFIES ONE
            ----------------------------------------- */

            const requestedGame =
                button.dataset.game;

            const gameSelect =
                document.getElementById("game");


            if (requestedGame && gameSelect) {

                const gameOption =
                    Array.from(
                        gameSelect.options
                    ).find(
                        option =>
                            option.value === requestedGame
                    );


                if (gameOption) {

                    /*
                     * Select the game.
                     */

                    gameSelect.value =
                        requestedGame;


                    /*
                     * Trigger the existing game
                     * change code.
                     *
                     * This will populate the
                     * player choices exactly as
                     * before.
                     */

                    gameSelect.dispatchEvent(
                        new Event("change")
                    );

                }

            }


            /* Open the modal */

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

                if (
                    event.target === scheduleModal
                ) {

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
        document.getElementById(
            "schedule-backup-date"
        );


    if (!scheduleForm) return;


/* -----------------------------------------
   CHARACTER ASSIGNMENT
----------------------------------------- */

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


function updateCharacterFields() {

    const selectedAssignment =
        document.querySelector(
            'input[name="characterAssignment"]:checked'
        );

    if (
        !selectedAssignment ||
        selectedAssignment.value !== "ahead"
    ) {

        characterInfo.style.display = "none";

        characterPlayers.innerHTML = "";

        return;

    }


    characterInfo.style.display = "block";

    const numberOfPlayers =
        parseInt(playersSelect.value);


    if (
        !numberOfPlayers ||
        numberOfPlayers < 1
    ) {

        characterPlayers.innerHTML =
            "<p class=\"form-help\">Choose the number of players above first.</p>";

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

            <h4>
                Player ${i}
            </h4>

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


        characterPlayers.appendChild(
            playerGroup
        );

    }

}


/* Watch for assignment choice */

assignmentRadios.forEach(radio => {

    radio.addEventListener(
        "change",
        updateCharacterFields
    );

});


/* Watch for number of players */

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





    /* -----------------------------------------
       SET MINIMUM DATES
    ----------------------------------------- */

    const todayString =
        getTodayString();


    if (dateInput) {
        dateInput.min = todayString;
    }


    if (backupDateInput) {
        backupDateInput.min = todayString;
    }


    /* -----------------------------------------
       VALIDATE PREFERRED DATE
    ----------------------------------------- */

    if (dateInput) {

        dateInput.addEventListener(
            "blur",
            () => {

                validateDateInput(
                    dateInput
                );

            }
        );

    }


    /* -----------------------------------------
       VALIDATE BACKUP DATE
    ----------------------------------------- */

    if (backupDateInput) {

        backupDateInput.addEventListener(
            "blur",
            () => {

                validateDateInput(
                    backupDateInput
                );

            }
        );

    }


    /* -----------------------------------------
       FORM SUBMISSION
    ----------------------------------------- */

    scheduleForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            /* Check preferred date */

            if (
                dateInput &&
                dateInput.value < todayString
            ) {

                alert(
                    "Please choose today or a future date."
                );

                dateInput.focus();

                return;

            }


            /* Check backup date */

            if (
                backupDateInput &&
                backupDateInput.value &&
                backupDateInput.value < todayString
            ) {

                alert(
                    "Please choose today or a future date."
                );

                backupDateInput.focus();

                return;

            }


            submitForm(
                scheduleForm,
                scheduleSuccess,
                {

                    hideForm: true,

           successMessage:
    "Your scheduling request has been sent! Thank you for reaching out. I’ve received your request and will get back to you soon to work out the details of your game.",

                    successButtonText:
                        "Request Sent"

                }
            );

        }
    );

}


/* =========================================
   FORM SUBMISSION HELPER
========================================= */

async function submitForm(
    form,
    successElement,
    options = {}
) {

    const submitButton =
        form.querySelector(
            "button[type='submit']"
        );


    if (!submitButton) return;


    const originalButtonText =
        submitButton.textContent;


    submitButton.textContent =
        "Sending...";

    submitButton.disabled = true;


    const formData =
        new FormData(form);


    try {

        const response =
            await fetch(
                form.action,
                {

                    method: "POST",

                    body: formData,

                    headers: {
                        "Accept":
                            "application/json"
                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                "Form submission failed."
            );

        }


        /* Successful submission */

        form.reset();


        if (options.hideForm) {

            form.style.display = "none";

        }


        if (successElement) {

            successElement.textContent =
                options.successMessage ||
                "Message sent! Thank you for reaching out.";

            successElement.style.display =
                "block";

        }


        submitButton.textContent =
            options.successButtonText ||
            "Sent";

    }


    catch (error) {

        console.error(
            "Form submission error:",
            error
        );


        if (successElement) {

            successElement.textContent =
                "Something went wrong. Please try again.";

            successElement.style.display =
                "block";

        }


        submitButton.textContent =
            originalButtonText;

        submitButton.disabled = false;

    }

}


/* =========================================
   GAME PLAYER OPTIONS
========================================= */

function initializeGamePlayerOptions() {

    const gameSelect =
        document.getElementById("game");

    const playersSelect =
        document.getElementById("players");

    const playerHelp =
        document.getElementById("playerHelp");


    if (!gameSelect || !playersSelect) {
        return;
    }


    gameSelect.addEventListener(
        "change",
        function () {

            const game =
                this.value;


            /* -----------------------------------------
               CLEAR CURRENT PLAYER OPTIONS
            ----------------------------------------- */

            playersSelect.innerHTML = "";


            /* -----------------------------------------
               NO GAME SELECTED
            ----------------------------------------- */

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
                maximum = 20;

            }


            /* -----------------------------------------
               A DEAD MAN'S CHEST
            ----------------------------------------- */

            else if (game === "A Dead Man's Chest") {

                minimum = 12;
                maximum = 16;

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

            playersSelect.appendChild(
                placeholder
            );


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

                option.value =
                    number;

                option.textContent =
                    number + " players";

                playersSelect.appendChild(
                    option
                );

            }


            /* -----------------------------------------
               HELP TEXT
            ----------------------------------------- */

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

        }
    );

}

/* =========================================
   CHARACTER INFORMATION TIMING
========================================= */

const characterTiming =
    document.querySelectorAll(
        'input[name="characterTiming"]'
    );

const characterEmailsGroup =
    document.getElementById(
        "characterEmailsGroup"
    );


if (
    characterTiming.length > 0 &&
    characterEmailsGroup
) {

    characterTiming.forEach(radio => {

        radio.addEventListener(
            "change",
            function () {

                if (
                    this.value ===
                        "Before the party" &&
                    this.checked
                ) {

                    characterEmailsGroup.style.display =
                        "block";

                }

                else if (
                    this.value ===
                        "At the party" &&
                    this.checked
                ) {

                    characterEmailsGroup.style.display =
                        "none";

                }

            }
        );

    });

}


/* =========================================
   DATE HELPERS
========================================= */

function getTodayString() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/* =========================================
   VALIDATE DATE INPUT
========================================= */

function validateDateInput(input) {

    if (
        !input ||
        !input.value
    ) {

        if (input) {

            input.setCustomValidity("");

        }

        return true;

    }


    const todayString =
        getTodayString();


    if (
        input.value <
        todayString
    ) {

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
    document.getElementById(
        "contact-form"
    );

const contactSuccess =
    document.getElementById(
        "contact-success"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        event => {

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

        }
    );

}