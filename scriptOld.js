/* =========================================
   PART OF THE PLOT
   JavaScript
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
        path.indexOf(gamesFolder);


    if (gamesPosition !== -1) {

        return (
            path.substring(
                0,
                gamesPosition
            ) + "/"
        );
    }


    const lastSlash =
        path.lastIndexOf("/");


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
   SUPABASE CONFIGURATION
========================================= */

const SUPABASE_URL =
    "https://fqcabbpvevtlzzwsvezi.supabase.co";


const SUPABASE_ANON_KEY =
    "sb_publishable_5FNoD9eo9A29lEjvsSKgkQ_sZdRqXQ7";


/* =========================================
   SUPABASE HELPER
========================================= */

async function supabaseRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            SUPABASE_URL + endpoint,
            {
                ...options,

                headers: {

                    "apikey":
                        SUPABASE_ANON_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_ANON_KEY}`,

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})
                }
            }
        );


    if (!response.ok) {

        const errorText =
            await response.text();


        throw new Error(
            `Supabase request failed: ${response.status} ${errorText}`
        );
    }


    return response.json();
}


/* =========================================
   GAME DATA
========================================= */

let AVAILABLE_GAMES = [];


/* =========================================
   LOAD GAMES FROM SUPABASE
========================================= */

async function loadGamesFromSupabase() {

    try {

        const games =
            await supabaseRequest(
                "/rest/v1/games" +
                "?select=id,name,active,pricing_type,minimum_players,maximum_players,current_price_stage" +
                "&active=eq.true" +
                "&order=name.asc"
            );


        AVAILABLE_GAMES =
            Array.isArray(games)
                ? games
                : [];


        return AVAILABLE_GAMES;
    }


    catch (error) {

        console.error(
            "Could not load games from Supabase:",
            error
        );


        AVAILABLE_GAMES = [];


        return [];
    }
}


/* =========================================
   GET GAME RECORD
========================================= */

function getGameRecord(
    gameName
) {

    if (!gameName) {
        return null;
    }


    return (
        AVAILABLE_GAMES.find(
            game =>
                game.name === gameName
        ) || null
    );
}


/* =========================================
   GET GAME PRICE
========================================= */

async function getGamePrice(
    gameName,
    numberOfPlayers = null
) {

    const gameRecord =
        getGameRecord(gameName);


    if (!gameRecord) {
        return null;
    }


    const stage =
        gameRecord.current_price_stage;


    let endpoint =
        "/rest/v1/game_prices" +
        "?select=id,game_id,price_stage,price,active,starts_at,ends_at,minimum_players,maximum_players" +
        `&game_id=eq.${encodeURIComponent(gameRecord.id)}` +
        `&price_stage=eq.${encodeURIComponent(stage)}` +
        "&active=eq.true";


    /* -----------------------------------------
       FIXED PRICE
    ----------------------------------------- */

    if (
        gameRecord.pricing_type ===
        "fixed"
    ) {

        endpoint +=
            "&minimum_players=is.null" +
            "&maximum_players=is.null";
    }


    /* -----------------------------------------
       PLAYER-BASED PRICE
    ----------------------------------------- */

    else if (
        gameRecord.pricing_type ===
        "player_based"
    ) {

        if (
            numberOfPlayers === null ||
            numberOfPlayers === undefined ||
            !Number.isInteger(
                Number(numberOfPlayers)
            )
        ) {

            return null;
        }


        endpoint +=
            `&minimum_players=lte.${Number(numberOfPlayers)}` +
            `&maximum_players=gte.${Number(numberOfPlayers)}`;
    }


    else {

        return null;
    }


    endpoint +=
        "&order=minimum_players.desc" +
        "&limit=1";


    try {

        const prices =
            await supabaseRequest(
                endpoint
            );


        if (
            !Array.isArray(prices) ||
            prices.length === 0
        ) {

            return null;
        }


        const priceRecord =
            prices[0];


        const now =
            new Date();


        /* -----------------------------------------
           START DATE
        ----------------------------------------- */

        if (
            priceRecord.starts_at &&
            new Date(
                priceRecord.starts_at
            ) > now
        ) {

            return null;
        }


        /* -----------------------------------------
           END DATE
        ----------------------------------------- */

        if (
            priceRecord.ends_at &&
            new Date(
                priceRecord.ends_at
            ) < now
        ) {

            return null;
        }


        return {

            price:
                Number(
                    priceRecord.price
                ),

            stage:
                priceRecord.price_stage,

            minimum_players:
                priceRecord.minimum_players,

            maximum_players:
                priceRecord.maximum_players
        };
    }


    catch (error) {

        console.error(
            "Could not load game price:",
            error
        );


        return null;
    }
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


        fixSharedLinks(
            siteHeader
        );


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
                !href.startsWith("http") &&
                !href.startsWith("#") &&
                !href.startsWith("mailto:") &&
                !href.startsWith("tel:") &&
                !href.startsWith("/")
            ) {

                link.href =
                    siteRoot +
                    href;
            }
        }
    );
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


    if (!navMenu) {
        return;
    }


    /* -----------------------------------------
       NAVIGATION LINKS
    ----------------------------------------- */

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
                !href.startsWith("http") &&
                !href.startsWith("#") &&
                !href.startsWith("mailto:") &&
                !href.startsWith("tel:") &&
                !href.startsWith("/")
            ) {

                link.href =
                    siteRoot +
                    href;
            }
        }
    );


    /* -----------------------------------------
       LOGO
    ----------------------------------------- */

    const siteLogo =
        document.getElementById(
            "siteLogo"
        );


    if (siteLogo) {

        siteLogo.src =
            siteRoot +
            "partOfThePlotLogo.png";


        const logoLink =
            siteLogo.closest("a");


        if (logoLink) {

            logoLink.href =
                siteRoot +
                "index.html";
        }
    }


    /* -----------------------------------------
       MOBILE MENU
    ----------------------------------------- */

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


    /* -----------------------------------------
       GAMES DROPDOWN
    ----------------------------------------- */

    if (
        gamesDropdown &&
        gamesTitle
    ) {

        gamesTitle.addEventListener(
            "click",
            event => {

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


                    openFAQ(
                        faqItem
                    );
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


    openFAQFromHash();


    window.addEventListener(
        "hashchange",
        openFAQFromHash
    );
}


/* =========================================
   DISPLAY GAME PRICES
========================================= */

async function initializeGamePrices() {

    const priceElements =
        document.querySelectorAll(
            ".game-price, .spellbound-price-amount"
        );


    if (
        priceElements.length === 0
    ) {

        return;
    }


    if (
        AVAILABLE_GAMES.length === 0
    ) {

        await loadGamesFromSupabase();
    }


    for (
        const element of priceElements
    ) {

        const gameName =
            element.dataset.game;


        if (!gameName) {
            continue;
        }


        const playerCount =
            element.dataset.players
                ? Number(
                    element.dataset.players
                )
                : null;


        const priceData =
            await getGamePrice(
                gameName,
                playerCount
            );


        if (!priceData) {

            console.warn(
                "No active price found for:",
                gameName
            );


            continue;
        }


        element.textContent =
            "$" +
            priceData.price.toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }
            );
    }
}


/* =========================================
   LOAD SCHEDULING MODAL
========================================= */

async function loadSchedulingModal() {

    const scheduleContainer =
        document.getElementById(
            "schedule-modal-container"
        );


    if (!scheduleContainer) {
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


        scheduleContainer.innerHTML =
            html;


        /*
         * The modal now exists in the DOM.
         * Initialize everything that depends
         * on it AFTER loading schedule.html.
         */

        initializeGamePlayerOptions();

        initializeScheduling();

        initializeSchedulingForm();
    }


    catch (error) {

        console.error(
            "Scheduling modal loading error:",
            error
        );
    }
}


/* =========================================
   SCHEDULING MODAL
========================================= */

function initializeScheduling() {

    const scheduleModal =
        document.getElementById(
            "scheduleModal"
        );


    const closeModal =
        document.getElementById(
            "closeModal"
        );


    if (!scheduleModal) {
        return;
    }


    /* -----------------------------------------
       OPEN MODAL
    ----------------------------------------- */

    function openScheduleModal(
        requestedGame = null
    ) {

        if (!scheduleModal) {
            return;
        }


        const gameSelect =
            document.getElementById(
                "game"
            );


        if (
            requestedGame &&
            gameSelect
        ) {

            const gameOption =
                Array.from(
                    gameSelect.options
                ).find(
                    option =>
                        option.value ===
                        requestedGame
                );


            if (gameOption) {

                gameSelect.value =
                    requestedGame;


                gameSelect.dispatchEvent(
                    new Event(
                        "change"
                    )
                );
            }
        }


        scheduleModal.classList.add(
            "active"
        );


        scheduleModal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";
    }


    /* -----------------------------------------
       CLOSE MODAL
    ----------------------------------------- */

    function closeScheduleModal() {

        scheduleModal.classList.remove(
            "active"
        );


        scheduleModal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.style.overflow =
            "";
    }


    /* -----------------------------------------
       SCHEDULE BUTTONS
    ----------------------------------------- */

    const scheduleButtons =
        document.querySelectorAll(
            "#scheduleButton, .schedule-button"
        );


    scheduleButtons.forEach(
        button => {

            /*
             * Avoid accidentally attaching
             * the handler twice.
             */

            if (
                button.dataset.scheduleInitialized ===
                "true"
            ) {

                return;
            }


            button.dataset.scheduleInitialized =
                "true";


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const requestedGame =
                        button.dataset.game ||
                        null;


                    openScheduleModal(
                        requestedGame
                    );
                }
            );
        }
    );


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

    scheduleModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                scheduleModal
            ) {

                closeScheduleModal();
            }
        }
    );


    /* -----------------------------------------
       ESCAPE KEY
    ----------------------------------------- */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                scheduleModal.classList.contains(
                    "active"
                )
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
        document.getElementById(
            "scheduleForm"
        );


    if (!scheduleForm) {
        return;
    }


    const scheduleSuccess =
        document.getElementById(
            "schedule-success"
        );


    const dateInput =
        document.getElementById(
            "schedule-date"
        );


    const backupDateInput =
        document.getElementById(
            "schedule-backup-date"
        );


    const assignmentRadios =
        document.querySelectorAll(
            'input[name="characterAssignment"]'
        );


    const characterInfo =
        document.getElementById(
            "character-info"
        );


    const characterPlayers =
        document.getElementById(
            "character-players"
        );


    const playersSelect =
        document.getElementById(
            "players"
        );


    const characterNotes =
        characterInfo
            ? characterInfo.querySelector(
                ".character-notes-section"
            )
            : null;


    const playerInformationLabel =
        characterInfo
            ? characterInfo.querySelector(
                ":scope > label"
            )
            : null;


    const playerInformationHelp =
        characterInfo
            ? characterInfo.querySelector(
                ":scope > .form-help"
            )
            : null;


    const scheduleFormLoadedAt =
        Date.now();


    let scheduleSubmissionLocked =
        false;


    /* =========================================
       CHARACTER ASSIGNMENT
    ========================================= */

    function updateCharacterFields() {

        const selectedAssignment =
            document.querySelector(
                'input[name="characterAssignment"]:checked'
            );


        const isAheadOfTime =
            selectedAssignment &&
            selectedAssignment.value ===
                "ahead";


        if (characterInfo) {

            characterInfo.style.display =
                "block";
        }


        if (characterNotes) {

            characterNotes.style.display =
                "block";
        }


        if (!isAheadOfTime) {

            if (playerInformationLabel) {

                playerInformationLabel.style.display =
                    "none";
            }


            if (playerInformationHelp) {

                playerInformationHelp.style.display =
                    "none";
            }


            if (characterPlayers) {

                characterPlayers.innerHTML =
                    "";


                characterPlayers.style.display =
                    "none";
            }


            return;
        }


        if (playerInformationLabel) {

            playerInformationLabel.style.display =
                "";
        }


        if (playerInformationHelp) {

            playerInformationHelp.style.display =
                "";
        }


        if (characterPlayers) {

            characterPlayers.style.display =
                "block";
        }


        const numberOfPlayers =
            parseInt(
                playersSelect
                    ? playersSelect.value
                    : "",
                10
            );


        if (
            !numberOfPlayers ||
            numberOfPlayers < 1
        ) {

            if (characterPlayers) {

                characterPlayers.innerHTML =
                    '<p class="form-help">Choose the number of players above first.</p>';
            }


            return;
        }


        if (!characterPlayers) {
            return;
        }


        characterPlayers.innerHTML =
            "";


        for (
            let i = 1;
            i <= numberOfPlayers;
            i++
        ) {

            const playerGroup =
                document.createElement(
                    "div"
                );


            playerGroup.className =
                "character-player";


            playerGroup.innerHTML = `

                <h4>
                    Player ${i}
                </h4>

                <div class="form-row">

                    <div class="form-group">

                        <label
                            for="player-${i}-name"
                        >
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

                        <label
                            for="player-${i}-email"
                        >
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


    /* =========================================
       CREATE RESERVATION
    ========================================= */

    async function submitReservationToSupabase(
        reservationData,
        form,
        successElement
    ) {

        const submitButton =
            form.querySelector(
                "button[type='submit']"
            );


        if (!submitButton) {
            return;
        }


        const originalButtonText =
            submitButton.textContent;


        submitButton.textContent =
            "Sending...";


        submitButton.disabled =
            true;


        try {

            const response =
                await fetch(
                    SUPABASE_URL +
                    "/functions/v1/create-reservation",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                reservationData
                            )
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Unable to create reservation."
                );
            }


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            form.reset();


            form.style.display =
                "none";


            if (successElement) {

                successElement.textContent =
                    "Your scheduling request has been sent! Thank you for reaching out. I’ve received your request and will get back to you soon to work out the details.";


                successElement.style.display =
                    "block";
            }


            submitButton.textContent =
                "Request Sent";
        }


        catch (error) {

            console.error(
                "Reservation submission error:",
                error
            );


            scheduleSubmissionLocked =
                false;


            if (successElement) {

                successElement.textContent =
                    error.message ||
                    "Something went wrong. Please try again.";


                successElement.style.display =
                    "block";
            }


            submitButton.textContent =
                originalButtonText;


            submitButton.disabled =
                false;
        }
    }


    /* -----------------------------------------
       WATCH ASSIGNMENT
    ----------------------------------------- */

    assignmentRadios.forEach(
        radio => {

            radio.addEventListener(
                "change",
                updateCharacterFields
            );
        }
    );


    /* -----------------------------------------
       WATCH PLAYER COUNT
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
                    selectedAssignment.value ===
                        "ahead"
                ) {

                    updateCharacterFields();
                }
            }
        );
    }


    updateCharacterFields();


    /* -----------------------------------------
       DATE MINIMUMS
    ----------------------------------------- */

    const todayString =
        getTodayString();


    if (dateInput) {

        dateInput.min =
            todayString;
    }


    if (backupDateInput) {

        backupDateInput.min =
            todayString;
    }


    /* -----------------------------------------
       DATE VALIDATION
    ----------------------------------------- */

    if (dateInput) {

        dateInput.addEventListener(
            "blur",
            () =>
                validateDateInput(
                    dateInput
                )
        );
    }


    if (backupDateInput) {

        backupDateInput.addEventListener(
            "blur",
            () =>
                validateDateInput(
                    backupDateInput
                )
        );
    }


    /* =========================================
       FORM SUBMISSION
    ========================================= */

    scheduleForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            /* -----------------------------------------
               HONEYPOT
            ----------------------------------------- */

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


            /* -----------------------------------------
               MINIMUM SUBMISSION TIME
            ----------------------------------------- */

            const timeOnPage =
                Date.now() -
                scheduleFormLoadedAt;


            if (
                timeOnPage < 3000
            ) {

                console.warn(
                    "Suspiciously fast scheduling submission blocked."
                );


                return;
            }


            /* -----------------------------------------
               DUPLICATE SUBMISSION
            ----------------------------------------- */

            if (
                scheduleSubmissionLocked
            ) {

                console.warn(
                    "Duplicate scheduling submission blocked."
                );


                return;
            }


            scheduleSubmissionLocked =
                true;


            /* -----------------------------------------
               DATE VALIDATION
            ----------------------------------------- */

            if (
                dateInput &&
                dateInput.value <
                    todayString
            ) {

                alert(
                    "Please choose today or a future date."
                );


                dateInput.focus();


                scheduleSubmissionLocked =
                    false;


                return;
            }


            if (
                backupDateInput &&
                backupDateInput.value &&
                backupDateInput.value <
                    todayString
            ) {

                alert(
                    "Please choose today or a future date."
                );


                backupDateInput.focus();


                scheduleSubmissionLocked =
                    false;


                return;
            }


            /* -----------------------------------------
               COLLECT FORM DATA
            ----------------------------------------- */

            const formData =
                new FormData(
                    scheduleForm
                );


            const reservationData =
                {};


            formData.forEach(
                (value, key) => {

                    reservationData[key] =
                        value;
                }
            );


            /* -----------------------------------------
               INCLUDE FRONTEND PRICE FOR DISPLAY /
               REFERENCE ONLY
               
               The Edge Function remains
               authoritative.
            ----------------------------------------- */

            const selectedGame =
                formData.get(
                    "game"
                );


            const numberOfPlayers =
                Number(
                    formData.get(
                        "players"
                    )
                );


            if (selectedGame) {

                getGamePrice(
                    selectedGame,
                    numberOfPlayers
                )
                    .then(
                        priceData => {

                            if (
                                priceData &&
                                priceData.price !== null
                            ) {

                                reservationData.price =
                                    priceData.price;
                            }


                            submitReservationToSupabase(
                                reservationData,
                                scheduleForm,
                                scheduleSuccess
                            );
                        }
                    )
                    .catch(
                        error => {

                            console.error(
                                "Could not determine game price:",
                                error
                            );


                            submitReservationToSupabase(
                                reservationData,
                                scheduleForm,
                                scheduleSuccess
                            );
                        }
                    );


                return;
            }


            submitReservationToSupabase(
                reservationData,
                scheduleForm,
                scheduleSuccess
            );
        }
    );
}


/* =========================================
   GAME PLAYER OPTIONS + PRICE
========================================= */

function initializeGamePlayerOptions() {

    const gameSelect =
        document.getElementById(
            "game"
        );


    const playersSelect =
        document.getElementById(
            "players"
        );


    const playerHelp =
        document.getElementById(
            "playerHelp"
        );


    const priceAmount =
        document.getElementById(
            "schedule-price-amount"
        );


    if (
        !gameSelect ||
        !playersSelect
    ) {

        return;
    }


    /* =========================================
       POPULATE GAMES
    ========================================= */

    function populateGameOptions() {

        const currentValue =
            gameSelect.value;


        gameSelect.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =
            "Choose a game";


        gameSelect.appendChild(
            placeholder
        );


        AVAILABLE_GAMES.forEach(
            game => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    game.name;


                option.textContent =
                    game.name;


                gameSelect.appendChild(
                    option
                );
            }
        );


        if (
            currentValue &&
            AVAILABLE_GAMES.some(
                game =>
                    game.name ===
                    currentValue
            )
        ) {

            gameSelect.value =
                currentValue;
        }
    }


    /* =========================================
       UPDATE PRICE
    ========================================= */

    async function updateSchedulePrice(
        game
    ) {

        if (!priceAmount) {
            return;
        }


        if (!game) {

            priceAmount.textContent =
                "";


            return;
        }


        const gameRecord =
            getGameRecord(
                game
            );


        if (!gameRecord) {

            priceAmount.textContent =
                "";


            return;
        }


        let numberOfPlayers =
            null;


        if (
            gameRecord.pricing_type ===
            "player_based"
        ) {

            numberOfPlayers =
                Number(
                    playersSelect.value
                );


            if (
                !Number.isInteger(
                    numberOfPlayers
                )
            ) {

                priceAmount.textContent =
                    "";


                return;
            }
        }


        const priceData =
            await getGamePrice(
                game,
                numberOfPlayers
            );


        if (!priceData) {

            priceAmount.textContent =
                "";


            return;
        }


        priceAmount.textContent =
            "$" +
            priceData.price.toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }
            );
    }


    /* =========================================
       UPDATE PLAYER OPTIONS
    ========================================= */

    function updatePlayerOptions(
        game
    ) {

        playersSelect.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =
            "Select number of players";


        placeholder.disabled =
            true;


        placeholder.selected =
            true;


        playersSelect.appendChild(
            placeholder
        );


        if (!game) {

            if (playerHelp) {

                playerHelp.textContent =
                    "Select a game to see the available player numbers.";
            }


            return;
        }


        const gameRecord =
            getGameRecord(
                game
            );


        if (!gameRecord) {
            return;
        }


        let minimum =
            gameRecord.minimum_players;


        let maximum =
            gameRecord.maximum_players;


        let genderRequirement =
            "";


        /* -----------------------------------------
           SPELLBOUND
        ----------------------------------------- */

        if (
            game === "Spellbound"
        ) {

            minimum =
                minimum || 13;


            maximum =
                maximum || 17;


            genderRequirement =
                "At least 5 female and 4 male players are required.";
        }


        /* -----------------------------------------
           WAY OUT WEST
        ----------------------------------------- */

        else if (
            game === "Way Out West"
        ) {

            minimum =
                minimum || 10;


            maximum =
                maximum || 14;


            genderRequirement =
                "10 players - at least 3 Female · 5 Male<br>" +
                "11 players - at least 4 Female · 5 Male<br>" +
                "12+ players - at least 4 Female · 6 Male";
        }


        /* -----------------------------------------
           A DEAD MAN'S CHEST
        ----------------------------------------- */

        else if (
            game === "A Dead Man's Chest"
        ) {

            minimum =
                minimum || 12;


            maximum =
                maximum || 16;


            genderRequirement =
                "At least 4 female and 6 male players are required.";
        }


        /* -----------------------------------------
           CREATE OPTIONS
        ----------------------------------------- */

        if (
            minimum !== null &&
            maximum !== null &&
            !Number.isNaN(
                Number(minimum)
            ) &&
            !Number.isNaN(
                Number(maximum)
            )
        ) {

            minimum =
                Number(minimum);


            maximum =
                Number(maximum);


            for (
                let number = minimum;
                number <= maximum;
                number++
            ) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    number;


                option.textContent =
                    number +
                    " players";


                playersSelect.appendChild(
                    option
                );
            }
        }


        /* -----------------------------------------
           HELP TEXT
        ----------------------------------------- */

        if (playerHelp) {

            if (
                genderRequirement
            ) {

                playerHelp.innerHTML =
                    genderRequirement;
            }


            else if (
                minimum !== null &&
                maximum !== null
            ) {

                playerHelp.textContent =
                    "This game can accommodate " +
                    minimum +
                    "–" +
                    maximum +
                    " players.";
            }


            else {

                playerHelp.textContent =
                    "";
            }
        }
    }


    /* =========================================
       PLAYER COUNT CHANGE
    ========================================= */

    playersSelect.addEventListener(
        "change",
        async function () {

            const game =
                gameSelect.value;


            await updateSchedulePrice(
                game
            );
        }
    );


    /* =========================================
       GAME CHANGE
    ========================================= */

    gameSelect.addEventListener(
        "change",
        async function () {

            const game =
                this.value;


            updatePlayerOptions(
                game
            );


            await updateSchedulePrice(
                game
            );
        }
    );


    /* =========================================
       LOAD GAMES FIRST
    ========================================= */

    if (
        AVAILABLE_GAMES.length === 0
    ) {

        loadGamesFromSupabase()
            .then(
                () => {

                    populateGameOptions();


                    if (
                        gameSelect.value
                    ) {

                        gameSelect.dispatchEvent(
                            new Event(
                                "change"
                            )
                        );
                    }
                }
            );

    }


    else {

        populateGameOptions();


        if (
            gameSelect.value
        ) {

            gameSelect.dispatchEvent(
                new Event(
                    "change"
                )
            );
        }
    }
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
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );
}


/* =========================================
   VALIDATE DATE INPUT
========================================= */

function validateDateInput(
    input
) {

    if (
        !input ||
        !input.value
    ) {

        if (input) {

            input.setCustomValidity(
                ""
            );
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


    input.setCustomValidity(
        "");


    return true;
}


/* =========================================
   CONTACT FORM
========================================= */

function initializeContactForm() {

    const contactForm =
        document.getElementById(
            "contact-form"
        );


    const contactSuccess =
        document.getElementById(
            "contact-success"
        );


    if (!contactForm) {
        return;
    }


    const contactFormLoadedAt =
        Date.now();


    let contactSubmissionLocked =
        false;


    contactForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /* -----------------------------------------
               HONEYPOT
            ----------------------------------------- */

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


            /* -----------------------------------------
               MINIMUM SUBMISSION TIME
            ----------------------------------------- */

            const timeOnPage =
                Date.now() -
                contactFormLoadedAt;


            if (
                timeOnPage < 3000
            ) {

                console.warn(
                    "Suspiciously fast contact submission blocked."
                );


                return;
            }


            /* -----------------------------------------
               DUPLICATE SUBMISSION
            ----------------------------------------- */

            if (
                contactSubmissionLocked
            ) {

                console.warn(
                    "Duplicate contact submission blocked."
                );


                return;
            }


            contactSubmissionLocked =
                true;


            /* -----------------------------------------
               BUTTON
            ----------------------------------------- */

            const submitButton =
                contactForm.querySelector(
                    "button[type='submit']"
                );


            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "Send Message";


            if (submitButton) {

                submitButton.textContent =
                    "Sending...";


                submitButton.disabled =
                    true;
            }


            /* -----------------------------------------
               FORM DATA
            ----------------------------------------- */

            const formData =
                new FormData(
                    contactForm
                );


            const contactData = {

                name:
                    formData.get(
                        "name"
                    ),

                email:
                    formData.get(
                        "email"
                    ),

                message:
                    formData.get(
                        "message"
                    ),

                _gotcha:
                    formData.get(
                        "_gotcha"
                    )
            };


            /* -----------------------------------------
               SEND TO SUPABASE
            ----------------------------------------- */

            try {

                const response =
                    await fetch(
                        SUPABASE_URL +
                        "/functions/v1/send-contact-message",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    contactData
                                )
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Unable to send your message."
                    );
                }


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

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


                    submitButton.disabled =
                        false;
                }


                contactSubmissionLocked =
                    false;
            }
        }
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


    if (
        !("IntersectionObserver" in window)
    ) {

        sections.forEach(
            section => {

                section.style.opacity =
                    "1";


                section.style.transform =
                    "translateY(0)";
            }
        );


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
   INITIALIZE EVERYTHING
========================================= */

async function initializePage() {

    /*
     * IMPORTANT:
     *
     * Everything that depends on page HTML
     * happens here, after DOMContentLoaded.
     */

    initializeFAQ();

    initializeContactForm();

    initializeFadeInAnimations();


    /*
     * Load games before initializing
     * pricing and scheduling.
     */

    await loadGamesFromSupabase();


    /*
     * Load shared site components.
     */

    await Promise.all([
        loadSharedHeader(),
        loadSharedFooter(),
        loadSchedulingModal()
    ]);


    /*
     * Game prices on individual pages.
     */

    await initializeGamePrices();
}


/* =========================================
   START APPLICATION
========================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePage,
        {
            once: true
        }
    );

}


else {

    initializePage();
}