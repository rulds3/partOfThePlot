/* =========================================
   PART OF THE PLOT
   scheduling.js

   Scheduling-specific JavaScript:
   - Schedule modal
   - Schedule buttons
   - Game selection
   - Player options
   - Game pricing
   - Character assignment
   - Date validation
   - Reservation submission

   Depends on:
   - supabase.js
   - site.js
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const CREATE_RESERVATION_FUNCTION =
    "https://fqcabbpvevtlzzwsvezi.supabase.co/functions/v1/create-reservation";


/* =========================================
   SCHEDULING STATE
========================================= */

let schedulingInitialized =
    false;

let schedulingFormInitialized =
    false;

let gamePlayerOptionsInitialized =
    false;


/* =========================================
   GET GAME FROM LOADED SUPABASE DATA
========================================= */

function getSchedulingGame(
    gameName
) {

    if (!gameName) {
        return null;
    }


    /*
     * Use getGameRecord() from supabase.js.
     *
     * AVAILABLE_GAMES is maintained by
     * supabase.js and does not need to be
     * attached to window.
     */

    if (
        typeof getGameRecord ===
        "function"
    ) {

        return getGameRecord(
            gameName
        );

    }


    return null;

}


/* =========================================
   GET GAME PRICE
========================================= */

/*
 * This function uses getGamePrice()
 * from supabase.js.
 */

async function getSchedulingGamePrice(
    gameName,
    numberOfPlayers = null
) {

    if (
        typeof getGamePrice !==
        "function"
    ) {

        return null;
    }


    try {

        return await getGamePrice(
            gameName,
            numberOfPlayers
        );

    }

    catch (error) {

        console.error(
            "Unable to get game price:",
            error
        );

        return null;

    }

}


/* =========================================
   SCHEDULING MODAL
========================================= */

function initializeScheduling() {

    /*
     * Prevent duplicate initialization.
     */

    if (schedulingInitialized) {
        return;
    }


    schedulingInitialized =
        true;


    /* -----------------------------------------
       OPEN SCHEDULE MODAL
    ----------------------------------------- */

    function openScheduleModal(
        requestedGame = null
    ) {

        const scheduleModal =
            document.getElementById(
                "scheduleModal"
            );


        if (!scheduleModal) {
            return;
        }


        /*
         * If a game was supplied by the
         * button, select it.
         */

        if (requestedGame) {

            const gameSelect =
                document.getElementById(
                    "game"
                );


            if (gameSelect) {

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
                            "change",
                            {
                                bubbles: true
                            }
                        )
                    );

                }

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
       CLOSE SCHEDULE MODAL
    ----------------------------------------- */

    function closeScheduleModal() {

        const scheduleModal =
            document.getElementById(
                "scheduleModal"
            );


        if (!scheduleModal) {
            return;
        }


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


    /*
     * Make functions available globally.
     */

    window.openScheduleModal =
        openScheduleModal;

    window.closeScheduleModal =
        closeScheduleModal;


    /* -----------------------------------------
       SCHEDULE BUTTONS
       
       Event delegation is used because the
       header is loaded dynamically.
    ----------------------------------------- */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "#scheduleButton, .schedule-button"
                );


            if (!button) {
                return;
            }


            event.preventDefault();


            const requestedGame =
                button.dataset.game ||
                null;


            openScheduleModal(
                requestedGame
            );

        }
    );


    /* -----------------------------------------
       CLOSE BUTTON
    ----------------------------------------- */

    document.addEventListener(
        "click",
        event => {

            const closeButton =
                event.target.closest(
                    "#closeModal"
                );


            if (!closeButton) {
                return;
            }


            event.preventDefault();


            closeScheduleModal();

        }
    );


    /* -----------------------------------------
       CLICK OUTSIDE MODAL
    ----------------------------------------- */

    document.addEventListener(
        "click",
        event => {

            const scheduleModal =
                document.getElementById(
                    "scheduleModal"
                );


            if (
                scheduleModal &&
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
                event.key !==
                "Escape"
            ) {

                return;

            }


            const scheduleModal =
                document.getElementById(
                    "scheduleModal"
                );


            if (
                scheduleModal &&
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

    /*
     * Prevent duplicate initialization.
     */

    if (
        schedulingFormInitialized
    ) {

        return;

    }


    const scheduleForm =
        document.getElementById(
            "scheduleForm"
        );


    /*
     * schedule.html may not have loaded yet.
     */

    if (!scheduleForm) {
        return;
    }


    schedulingFormInitialized =
        true;


    /* -----------------------------------------
       FORM ELEMENTS
    ----------------------------------------- */

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


    const playersSelect =
        document.getElementById(
            "players"
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


        /*
         * Character information is always
         * available.
         */

        if (characterInfo) {

            characterInfo.style.display =
                "block";

        }


        if (characterNotes) {

            characterNotes.style.display =
                "block";

        }


        /*
         * If characters are not being assigned
         * ahead of time, hide player information.
         */

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


        /*
         * Characters are being assigned ahead
         * of time.
         */

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


        /*
         * Create one character information
         * section for each player.
         */

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
       SUBMIT RESERVATION
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
                    CREATE_RESERVATION_FUNCTION,
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


            /*
             * Parse JSON safely.
             */

            let result = {};


            try {

                result =
                    await response.json();

            }

            catch {

                result = {};

            }


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


            /*
             * Rebuild/reset dynamic fields.
             */

            updateCharacterFields();


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


        /* -----------------------------------------
           ERROR
        ----------------------------------------- */

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


    /* =========================================
       ASSIGNMENT RADIO WATCHERS
    ========================================= */

    assignmentRadios.forEach(
        radio => {

            radio.addEventListener(
                "change",
                updateCharacterFields
            );

        }
    );


    /* =========================================
       PLAYER COUNT WATCHER
    ========================================= */

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


    /* =========================================
       INITIAL CHARACTER STATE
    ========================================= */

    updateCharacterFields();


    /* =========================================
       MINIMUM DATES
    ========================================= */

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


    /* =========================================
       DATE VALIDATION
    ========================================= */

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
        async event => {

            event.preventDefault();


            /* -----------------------------------------
               HONEYPOT CHECK
            ----------------------------------------- */

            const honeypot =
                scheduleForm.querySelector(
                    'input[name="_gotcha"]'
                );


            if (
                honeypot &&
                honeypot.value.trim() !== ""
            ) {

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

                return;

            }


            /* -----------------------------------------
               SUBMISSION COOLDOWN
            ----------------------------------------- */

            if (
                scheduleSubmissionLocked
            ) {

                return;

            }


            scheduleSubmissionLocked =
                true;


            /* -----------------------------------------
               VALIDATE PREFERRED DATE
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


            /* -----------------------------------------
               VALIDATE BACKUP DATE
            ----------------------------------------- */

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
               VALIDATE CUSTOM DATE RULES
            ----------------------------------------- */

            if (
                dateInput &&
                !validateDateInput(
                    dateInput
                )
            ) {

                scheduleSubmissionLocked =
                    false;


                return;

            }


            if (
                backupDateInput &&
                !validateDateInput(
                    backupDateInput
                )
            ) {

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
               GET SELECTED GAME
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


            /*
             * A game must be selected.
             */

            if (!selectedGame) {

                alert(
                    "Please choose a game."
                );


                scheduleSubmissionLocked =
                    false;


                return;

            }


            /*
             * Find the actual Supabase game record.
             */

            const gameRecord =
                getSchedulingGame(
                    selectedGame
                );


            if (!gameRecord) {

                alert(
                    "Unable to verify the selected game. Please refresh the page and try again."
                );


                scheduleSubmissionLocked =
                    false;


                return;

            }


            /*
             * Include the Supabase game ID.
             */

            reservationData.game_id =
                gameRecord.id;


            /*
             * Get the current price.
             *
             * The Edge Function remains authoritative
             * and should recalculate/verify pricing.
             */

            const priceData =
                await getSchedulingGamePrice(
                    selectedGame,
                    numberOfPlayers
                );


            if (priceData) {

                reservationData.price =
                    priceData.price;

            }


            /* -----------------------------------------
               SEND RESERVATION
            ----------------------------------------- */

            await submitReservationToSupabase(
                reservationData,
                scheduleForm,
                scheduleSuccess
            );

        }
    );

}


/* =========================================
   GAME PLAYER OPTIONS
========================================= */

async function initializeGamePlayerOptions() {

    /*
     * Prevent duplicate initialization.
     */

    if (
        gamePlayerOptionsInitialized
    ) {

        return;

    }


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


    gamePlayerOptionsInitialized =
        true;


    /* =========================================
       MAKE SURE GAMES ARE LOADED
    ========================================= */

    if (
        typeof loadGamesFromSupabase ===
        "function"
    ) {

        /*
         * Always make sure the latest game
         * data is available before populating
         * the scheduling form.
         */

        if (
            typeof AVAILABLE_GAMES ===
                "undefined" ||
            !Array.isArray(
                AVAILABLE_GAMES
            ) ||
            AVAILABLE_GAMES.length === 0
        ) {

            await loadGamesFromSupabase();

        }

    }


    /* =========================================
       POPULATE GAME SELECT
    ========================================= */

    function populateGameSelect() {

        /*
         * Preserve the current selection.
         */

        const currentValue =
            gameSelect.value;


        /*
         * Preserve placeholder text.
         */

        const existingPlaceholder =
            Array.from(
                gameSelect.options
            ).find(
                option =>
                    !option.value
            );


        const placeholderText =
            existingPlaceholder
                ? existingPlaceholder.textContent
                : "Choose a game";


        /*
         * Clear the select.
         */

        gameSelect.innerHTML =
            "";


        /*
         * Add placeholder.
         */

        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =
            placeholderText ||
            "Choose a game";


        placeholder.disabled =
            true;


        placeholder.selected =
            !currentValue;


        gameSelect.appendChild(
            placeholder
        );


        /*
         * Get games directly from
         * supabase.js.
         */

        const games =
            typeof AVAILABLE_GAMES !==
                "undefined" &&
            Array.isArray(
                AVAILABLE_GAMES
            )
                ? AVAILABLE_GAMES
                : [];


        /*
         * Add active games.
         */

        games.forEach(
            game => {

                if (
                    !game ||
                    game.active === false
                ) {

                    return;

                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    game.name;


                option.textContent =
                    game.name;


                option.dataset.gameId =
                    game.id;


                option.dataset.pricingType =
                    game.pricing_type;


                if (
                    game.minimum_players !==
                        null &&
                    game.minimum_players !==
                        undefined
                ) {

                    option.dataset.minimumPlayers =
                        game.minimum_players;

                }


                if (
                    game.maximum_players !==
                        null &&
                    game.maximum_players !==
                        undefined
                ) {

                    option.dataset.maximumPlayers =
                        game.maximum_players;

                }


                gameSelect.appendChild(
                    option
                );

            }
        );


        /*
         * Restore previous selection.
         */

        if (currentValue) {

            const matchingOption =
                Array.from(
                    gameSelect.options
                ).find(
                    option =>
                        option.value ===
                        currentValue
                );


            if (matchingOption) {

                gameSelect.value =
                    currentValue;

            }

        }

    }


    populateGameSelect();


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
            getSchedulingGame(
                game
            );


        if (!gameRecord) {

            priceAmount.textContent =
                "";

            return;

        }


        /*
         * Fixed-price games don't need a
         * player count.
         */

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
                !numberOfPlayers ||
                !Number.isInteger(
                    numberOfPlayers
                )
            ) {

                priceAmount.textContent =
                    "";

                return;

            }

        }


        priceAmount.textContent =
            "Loading...";


        const priceData =
            await getSchedulingGamePrice(
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
            Number(
                priceData.price
            ).toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }
            );

    }


    /* =========================================
       GET PLAYER RANGE
    ========================================= */

    function getGamePlayerRange(
        gameRecord
    ) {

        if (!gameRecord) {

            return {
                minimum: null,
                maximum: null
            };

        }


        let minimum =
            gameRecord.minimum_players;


        let maximum =
            gameRecord.maximum_players;


        /*
         * Convert database values to numbers.
         */

        if (
            minimum !== null &&
            minimum !== undefined
        ) {

            minimum =
                Number(
                    minimum
                );

        }


        if (
            maximum !== null &&
            maximum !== undefined
        ) {

            maximum =
                Number(
                    maximum
                );

        }


        /*
         * Game-specific fallbacks.
         */

        if (
            minimum === null ||
            maximum === null ||
            Number.isNaN(minimum) ||
            Number.isNaN(maximum)
        ) {

            switch (
                gameRecord.name
            ) {

                case "Spellbound":

                    minimum =
                        13;

                    maximum =
                        17;

                    break;


                case "Way Out West":

                    minimum =
                        10;

                    maximum =
                        14;

                    break;


                case "A Dead Man's Chest":

                    minimum =
                        12;

                    maximum =
                        16;

                    break;

            }

        }


        return {
            minimum,
            maximum
        };

    }


    /* =========================================
       GET GAME REQUIREMENTS
    ========================================= */

    function getGameRequirements(
        gameRecord
    ) {

        if (!gameRecord) {
            return "";
        }


        switch (
            gameRecord.name
        ) {

            case "Spellbound":

                return (
                    "At least 5 female and 4 male players are required."
                );


            case "Way Out West":

                return (
                    "10 players - at least 3 Female · 5 Male<br>" +
                    "11 players - at least 4 Female · 5 Male<br>" +
                    "12+ players - at least 4 Female · 6 Male"
                );


            case "A Dead Man's Chest":

                return (
                    "At least 4 female and 6 male players are required."
                );


            default:

                return "";

        }

    }


    /* =========================================
       UPDATE PLAYER OPTIONS
    ========================================= */

    async function updatePlayerOptions(
        game
    ) {

        /*
         * Clear existing options.
         */

        playersSelect.innerHTML =
            "";


        /*
         * Placeholder.
         */

        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =
            game
                ? "Select number of players"
                : "Choose number of players";


        placeholder.disabled =
            true;


        placeholder.selected =
            true;


        playersSelect.appendChild(
            placeholder
        );


        /*
         * No game selected.
         */

        if (!game) {

            if (playerHelp) {

                playerHelp.textContent =
                    "Select a game to see the available player numbers.";

            }


            if (priceAmount) {

                priceAmount.textContent =
                    "";

            }


            return;

        }


        const gameRecord =
            getSchedulingGame(
                game
            );


        if (!gameRecord) {

            if (playerHelp) {

                playerHelp.textContent =
                    "";

            }


            if (priceAmount) {

                priceAmount.textContent =
                    "";

            }


            return;

        }


        const range =
            getGamePlayerRange(
                gameRecord
            );


        const minimum =
            range.minimum;


        const maximum =
            range.maximum;


        const genderRequirement =
            getGameRequirements(
                gameRecord
            );


        /*
         * Create player options.
         */

        if (
            minimum !== null &&
            maximum !== null &&
            Number.isInteger(
                minimum
            ) &&
            Number.isInteger(
                maximum
            ) &&
            maximum >= minimum
        ) {

            for (
                let number =
                    minimum;

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


        /*
         * Help text.
         */

        if (playerHelp) {

            if (genderRequirement) {

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


        /*
         * Player-based pricing waits until
         * a player count is selected.
         */

        if (
            gameRecord.pricing_type ===
            "player_based"
        ) {

            if (priceAmount) {

                priceAmount.textContent =
                    "";

            }

        }

        else {

            await updateSchedulePrice(
                game
            );

        }

    }


    /* =========================================
       PLAYER COUNT CHANGE
    ========================================= */

    playersSelect.addEventListener(
        "change",
        async () => {

            const game =
                gameSelect.value;


            if (!game) {
                return;
            }


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
        async () => {

            const game =
                gameSelect.value;


            await updatePlayerOptions(
                game
            );


            /*
             * Character fields depend on
             * player count.
             */

            const assignment =
                document.querySelector(
                    'input[name="characterAssignment"]:checked'
                );


            if (
                assignment &&
                assignment.value ===
                    "ahead"
            ) {

                playersSelect.dispatchEvent(
                    new Event(
                        "change",
                        {
                            bubbles: true
                        }
                    )
                );

            }

        }
    );


    /* =========================================
       INITIAL GAME
    ========================================= */

    if (gameSelect.value) {

        await updatePlayerOptions(
            gameSelect.value
        );

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
        ""
    );


    return true;

}


/* =========================================
   INITIALIZE SCHEDULING SYSTEM
========================================= */

async function initializeSchedulingSystem() {

    /*
     * Initialize modal handling first.
     */

    initializeScheduling();


    /*
     * Wait for schedule.html to exist.
     */

    const scheduleForm =
        document.getElementById(
            "scheduleForm"
        );


    if (!scheduleForm) {
        return;
    }


    /*
     * Load games and build the selector.
     */

    await initializeGamePlayerOptions();


    /*
     * Initialize the reservation form.
     */

    initializeSchedulingForm();

}


/* =========================================
   MAKE PUBLIC
========================================= */

window.initializeScheduling =
    initializeScheduling;


window.initializeSchedulingForm =
    initializeSchedulingForm;


window.initializeGamePlayerOptions =
    initializeGamePlayerOptions;


window.initializeSchedulingSystem =
    initializeSchedulingSystem;


window.getTodayString =
    getTodayString;


window.validateDateInput =
    validateDateInput;


/* =========================================
   INITIALIZE MODAL HANDLING IMMEDIATELY
========================================= */

/*
 * This is safe to run before schedule.html
 * exists because the Schedule button
 * listener uses event delegation.
 */

initializeScheduling();