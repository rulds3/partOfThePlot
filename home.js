
/* =========================================
PART OF THE PLOT
home.js

Homepage-specific functionality:
* Upcoming public games
* Public game registration buttons
========================================= */

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;


/* =========================================
LOAD UPCOMING PUBLIC GAMES
========================================= */

async function loadUpcomingGames() {

    const gamesList =
        document.getElementById(
            "upcoming-games-list"
        );

    if (!gamesList) {
        return;
    }

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/upcoming_public_games" +
                "?select=id,game,reservation_date,reservation_time,location,ticket_price,number_of_guests,registration_deadline,registration_open,event_type,spots_available,public_description" +
                "&event_type=eq.ticketed" +
                "&registration_open=eq.true" +
                "&order=reservation_date.asc,reservation_time.asc",
                {
                    headers: {
                        "apikey": SUPABASE_ANON_KEY,
                        "Authorization": "Bearer " + SUPABASE_ANON_KEY
                    }
                }
            );

        if (!response.ok) {
            throw new Error(
                "Could not load upcoming games."
            );
        }

        const games = await response.json();

        const now = new Date();

        const upcomingGames =
            games.filter(game => {

                const gameDate =
                    new Date(
                        `${game.reservation_date}T${game.reservation_time}`
                    );

                if (Number.isNaN(gameDate.getTime())) {
                    return false;
                }

                // Hide the game once its scheduled start time has passed.
                if (gameDate <= now) {
                    return false;
                }

                // Keep games visible after the registration deadline.
                return true;

            });

        if (upcomingGames.length === 0) {

            gamesList.innerHTML = `
                <p class="upcoming-games-empty">
                    No upcoming public games are currently scheduled.
                    Check back soon!
                </p>
            `;

            return;

        }

        window.upcomingPublicGames = upcomingGames;
        gamesList.innerHTML = "";

        upcomingGames.forEach(game => {

            const card =
                document.createElement("article");

            card.className = "upcoming-game-card";

            const date =
                new Date(
                    `${game.reservation_date}T12:00:00`
                );

            const formattedDate =
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "long",
                        month: "long",
                        day: "numeric"
                    }
                );

            const spots =
                Math.max(
                    0,
                    Number(game.spots_available) || 0
                );

            const registrationClosed =
                !game.registration_open ||
                (
                    game.registration_deadline &&
                    new Date(game.registration_deadline) <= now
                );

            const registrationControl =
                registrationClosed
                    ? `
                        <span class="upcoming-game-closed">
                            Registration Closed
                        </span>
                    `
                    : `
                        <button
                            type="button"
                            class="button upcoming-game-register"
                            data-event-id="${escapeHtml(game.id)}"
                        >
                            Register
                        </button>
                    `;

            card.innerHTML = `
                <div class="upcoming-game-date">
                    ${formattedDate}
                </div>

                <div class="upcoming-game-info">

                    <h3>
                        ${escapeHtml(game.game)}
                    </h3>


					<p class="upcoming-game-details">
						${formatEventTime(game.reservation_time)}
						&nbsp;·&nbsp;
						${escapeHtml(game.location)}
						&nbsp;·&nbsp; Ages 18+
						${
							formatTicketPrice(game.ticket_price)
								? `&nbsp;·&nbsp; ${formatTicketPrice(game.ticket_price)}`
								: ""
						}
					</p>


                    ${
                        registrationClosed
                            ? ""
                            : `
                                <div class="upcoming-game-availability">
                                    <p class="upcoming-game-spots">
                                        ${spots} spots available
                                    </p>

                                    ${
                                        game.public_description
                                            ? `<p class="upcoming-game-description">
                                                ${escapeHtml(game.public_description)}
                                               </p>`
                                            : ""
                                    }
                                </div>
                            `
                    }


                </div>

                ${registrationControl}
            `;

            gamesList.appendChild(card);

        });

        initializeRegistrationButtons();

    }
    catch (error) {

        console.error(
            "Upcoming games error:",
            error
        );

        gamesList.innerHTML = `
            <p class="upcoming-games-error">
                Upcoming games could not be loaded right now.
            </p>
        `;

    }

}


/* =========================================
REGISTER BUTTONS
========================================= */

function initializeRegistrationButtons() {

    const buttons =
        document.querySelectorAll(
            ".upcoming-game-register"
        );

    const modal =
        document.getElementById(
            "public-registration-modal"
        );

    const eventInfo =
        document.getElementById(
            "public-registration-event-info"
        );

    const registrationForm =
        document.getElementById(
            "public-registration-form"
        );

    const registrationMessage =
        document.getElementById(
            "public-registration-message"
        );

    const playerCountSelect =
        document.getElementById(
            "public-player-count"
        );

    const playerFieldsContainer =
        document.getElementById(
            "public-player-fields"
        );


    /* =========================================
    RENDER PLAYER FIELDS
    ========================================= */

    function renderPlayerFields() {

        if (!playerCountSelect || !playerFieldsContainer) {
            return;
        }

        // Preserve entered information when the player count changes.
        const savedPlayers = [];

        playerFieldsContainer
            .querySelectorAll(".public-player-fields")
            .forEach(section => {

                const index =
                    Number(section.dataset.playerIndex);

                savedPlayers[index] = {

                    name:
                        section.querySelector(
                            `[name="player_${index}_name"]`
                        )?.value || "",

                    email:
                        section.querySelector(
                            `[name="player_${index}_email"]`
                        )?.value || "",

                    // Read the selected radio button, not the first radio.
                    gender:
                        section.querySelector(
                            `input[name="player_${index}_gender"]:checked`
                        )?.value || "",

                    personality:
                        Array.from(
                            section.querySelectorAll(
                                `input[name="player_${index}_personality"]:checked`
                            )
                        ).map(input => input.value),

                    attendingWith:
                        section.querySelector(
                            `[name="player_${index}_attending_with"]`
                        )?.value || ""

                };

            });

        const count =
            Number(playerCountSelect.value);

        playerFieldsContainer.innerHTML = "";

        for (let i = 0; i < count; i++) {

            const saved = savedPlayers[i] || {};

            const section =
                document.createElement("fieldset");

            section.className = "public-player-fields";
            section.dataset.playerIndex = String(i);

            section.innerHTML = `
                <legend>Player ${i + 1}</legend>

                <div class="form-field">
                    <label for="public-player-${i}-name">
                        Full Name
                    </label>

                    <input
                        id="public-player-${i}-name"
                        name="player_${i}_name"
                        type="text"
                        autocomplete="${i === 0 ? "name" : "off"}"
                        maxlength="120"
                        required
                        value="${escapeHtml(saved.name || "")}"
                    >
                </div>

                <div class="form-field">
                    <label for="public-player-${i}-email">
                        Email Address
                    </label>

                    <input
                        id="public-player-${i}-email"
                        name="player_${i}_email"
                        type="email"
                        autocomplete="${i === 0 ? "email" : "off"}"
                        maxlength="254"
                        required
                        value="${escapeHtml(saved.email || "")}"
                    >

                    <p class="form-help">
                        Game information will be sent to this address.
                    </p>
                </div>

                <fieldset class="registration-checkbox-group">
                    <legend>Character Preference</legend>

                    <div class="registration-radio-options">

                        <label class="registration-checkbox">
                            <input
                                type="radio"
                                name="player_${i}_gender"
                                value="female"
                                ${saved.gender === "female" ? "checked" : ""}
                                required
                            >
                            <span>Female</span>
                        </label>

                        <label class="registration-checkbox">
                            <input
                                type="radio"
                                name="player_${i}_gender"
                                value="male"
                                ${saved.gender === "male" ? "checked" : ""}
                                required
                            >
                            <span>Male</span>
                        </label>

                    </div>
                </fieldset>

                <fieldset class="registration-checkbox-group">
                    <legend>What sounds most like you?</legend>

                    <div class="registration-radio-options">

                        <label class="registration-checkbox">
                            <input
                                type="radio"
                                name="player_${i}_personality"
                                value="Outgoing"
                                ${(saved.personality || []).includes("Outgoing") ? "checked" : ""}
                                required
                            >
                            <span>Outgoing</span>
                        </label>

                        <label class="registration-checkbox">
                            <input
                                type="radio"
                                name="player_${i}_personality"
                                value="More reserved"
                                ${(saved.personality || []).includes("More reserved") ? "checked" : ""}
                                required
                            >
                            <span>More reserved</span>
                        </label>

                    </div>
                </fieldset>

                <div class="form-field">
                    <label for="public-player-${i}-attending-with">
                        My significant other is attending...
                        <span class="optional">(optional)</span>
                    </label>

                    <input
                        id="public-player-${i}-attending-with"
                        name="player_${i}_attending_with"
                        type="text"
                        maxlength="200"
                        placeholder="Name of significant other"
                        value="${escapeHtml(saved.attendingWith || "")}"
                    >
                </div>
            `;

            playerFieldsContainer.appendChild(section);

        }

    }


    if (playerCountSelect && playerFieldsContainer) {

        playerCountSelect.addEventListener(
            "change",
            renderPlayerFields
        );

        renderPlayerFields();

    }


    /* =========================================
    MODAL CONTROLS
    ========================================= */

    const closeButton =
        document.getElementById(
            "close-public-registration"
        );

    const cancelButton =
        document.getElementById(
            "cancel-public-registration"
        );

    if (!modal) {

        console.error(
            "Public registration modal was not found."
        );

        return;

    }


    function closeModal() {

        modal.hidden = true;

        document.body.classList.remove(
            "public-registration-open"
        );

    }


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const eventId =
                    button.dataset.eventId;

                modal.dataset.eventId = eventId;

                if (!eventId) {
                    return;
                }

                const selectedEvent =
                    window.upcomingPublicGames?.find(
                        event =>
                            String(event.id) === String(eventId)
                    );

                if (selectedEvent) {

                    const date =
                        new Date(
                            `${selectedEvent.reservation_date}T12:00:00`
                        );

                    const formattedDate =
                        date.toLocaleDateString(
                            "en-US",
                            {
                                weekday: "long",
                                month: "long",
                                day: "numeric"
                            }
                        );

                    eventInfo.textContent =
                        `${formattedDate} · ${formatEventTime(selectedEvent.reservation_time)} · ${selectedEvent.location}`;

                }
                else {

                    eventInfo.textContent =
                        "Please enter your information below.";

                }

                modal.hidden = false;

                document.body.classList.add(
                    "public-registration-open"
                );

                const nameInput =
                    document.getElementById(
                        "public-player-0-name"
                    );

                if (nameInput) {

                    setTimeout(
                        () => nameInput.focus(),
                        50
                    );

                }

            }
        );

    });


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                closeModal();
            }

        }
    );


    /* =========================================
    REGISTRATION FORM SUBMISSION
    ========================================= */

    if (registrationForm) {

        registrationForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const submitButton =
                    registrationForm.querySelector(
                        'button[type="submit"]'
                    );

                if (submitButton?.disabled) {
                    return;
                }

                if (submitButton) {

                    submitButton.disabled = true;
                    submitButton.textContent =
                        "Checking Availability...";

                }

                if (registrationMessage) {

                    registrationMessage.textContent = "";
                    registrationMessage.className =
                        "admin-message";

                }

                try {

                    const eventId =
                        modal.dataset.eventId;

                    if (!eventId) {

                        throw new Error(
                            "The game information could not be found. Please close this window and try again."
                        );

                    }

                    const count =
                        Number(playerCountSelect?.value);

                    if (
                        !Number.isInteger(count) ||
                        count < 1 ||
                        count > 4
                    ) {

                        throw new Error(
                            "Please select between 1 and 4 players."
                        );

                    }

                    const players = [];

                    for (let i = 0; i < count; i++) {

                        const getValue = name =>
                            registrationForm.elements
                                .namedItem(name)
                                ?.value?.trim() || "";

                        const personality =
                            Array.from(
                                registrationForm.querySelectorAll(
                                    `input[name="player_${i}_personality"]:checked`
                                )
                            ).map(input => input.value);

                        players.push({

                            player_name:
                                getValue(`player_${i}_name`),

                            player_email:
                                getValue(`player_${i}_email`),

                            requested_gender:
                                getValue(`player_${i}_gender`),

                            personality,

                            attending_with:
                                getValue(`player_${i}_attending_with`)

                        });

                    }

                    const bookingNotes =
                        registrationForm.elements
                            .namedItem("booking_notes")
                            ?.value?.trim() || "";

                    if (registrationMessage) {

                        registrationMessage.textContent =
                            "Registering your group...";

                    }

                    const response =
                        await fetch(
                            SUPABASE_URL +
                            "/functions/v1/public-register-player",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type": "application/json",
                                    "apikey": SUPABASE_ANON_KEY,
                                    "Authorization":
                                        "Bearer " + SUPABASE_ANON_KEY
                                },

                                body: JSON.stringify({
                                    event_id: eventId,
                                    players,
                                    booking_notes: bookingNotes
                                })
                            }
                        );

                    const result =
                        await response.json();

                    if (!response.ok) {

                        throw new Error(
                            result.error ||
                            "We could not complete your registration."
                        );

                    }

                    const playerId =
                        result.anchor_player_id ||
                        result.player?.id ||
                        result.players?.[0]?.id;

                    if (!playerId) {

                        console.error(
                            "Registration response did not contain an anchor player ID:",
                            result
                        );

                        throw new Error(
                            "Your registration may have been created, but we could not prepare payment. Please contact us before registering again."
                        );

                    }

                    if (registrationMessage) {

                        registrationMessage.textContent =
                            "Your group's spots are being held. Preparing secure payment...";

                        registrationMessage.className =
                            "admin-message success";

                    }

                    if (submitButton) {

                        submitButton.textContent =
                            "Opening Payment...";

                    }

                    const stripeResponse =
                        await fetch(
                            SUPABASE_URL +
                            "/functions/v1/public-create-stripe-checkout",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type": "application/json",
                                    "apikey": SUPABASE_ANON_KEY,
                                    "Authorization":
                                        "Bearer " + SUPABASE_ANON_KEY
                                },

                                body: JSON.stringify({
                                    player_id: playerId
                                })
                            }
                        );

                    const stripeResult =
                        await stripeResponse.json();

                    if (!stripeResponse.ok) {

                        throw new Error(
                            stripeResult.error ||
                            "We could not prepare your payment. Your registration may still be holding spots; please contact us before trying again."
                        );

                    }

                    if (!stripeResult.checkout_url) {

                        throw new Error(
                            "Stripe did not provide a payment page. Please contact us before trying again."
                        );

                    }

                    window.location.href =
                        stripeResult.checkout_url;

                }
                catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );

                    if (registrationMessage) {

                        registrationMessage.textContent =
                            error instanceof Error
                                ? error.message
                                : "Something went wrong. Please try again.";

                        registrationMessage.className =
                            "admin-message error";

                    }

                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.textContent =
                            "Continue to Payment";

                    }

                }

            }
        );

    }


    /* =========================================
    CLOSE MODAL WITH ESCAPE
    ========================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !modal.hidden
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================
FORMAT TICKET PRICE
========================================= */

function formatTicketPrice(price) {

    const amount = Number(price);

    if (price === null || price === undefined || price === "" ||
        !Number.isFinite(amount)) {
        return "";
    }

    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
		minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + " per person";

}


/* =========================================
FORMAT EVENT TIME
========================================= */

function formatEventTime(time) {

    if (!time) {
        return "";
    }

    const parts =
        String(time).split(":");

    const hour =
        Number(parts[0]);

    const minute =
        parts[1] || "00";

    if (!Number.isFinite(hour)) {
        return "";
    }

    const displayHour =
        hour % 12 || 12;

    const period =
        hour >= 12
            ? "PM"
            : "AM";

    return `${displayHour}:${minute} ${period}`;

}


/* =========================================
ESCAPE HTML
========================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
START
========================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        loadUpcomingGames,
        {
            once: true
        }
    );

}
else {

    loadUpcomingGames();

}
