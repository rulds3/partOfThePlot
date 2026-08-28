import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://fqcabbpvevtlzzwsvezi.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_5FNoD9eo9A29lEjvsSKgkQ_sZdRqXQ7";


const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   PAGE DETECTION
   ========================================================= */

const loginForm =
    document.getElementById(
        "admin-login-form"
    );


const reservationList =
    document.getElementById(
        "reservation-list"
    );


/*
 * admin.html contains #admin-login-form.
 *
 * admin-dashboard.html contains #reservation-list.
 *
 * This allows the SAME JavaScript file to be used
 * on both pages.
 */

if (loginForm) {

    initializeLogin();

}


if (reservationList) {

    initializeDashboard();

}


/* =========================================================
   LOGIN PAGE
   ========================================================= */

async function initializeLogin() {

    const message =
        document.getElementById(
            "admin-message"
        );


    /* -----------------------------------------------------
       CHECK EXISTING LOGIN
    ----------------------------------------------------- */

    try {

        const {
            data: {
                session
            }
        } =
            await supabase.auth.getSession();


        if (session) {

            window.location.href =
                "admin-dashboard.html";

            return;

        }

    }

    catch (error) {

        console.error(
            "Could not check login:",
            error
        );

    }


    /* -----------------------------------------------------
       LOGIN FORM
    ----------------------------------------------------- */

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (message) {

                message.textContent =
                    "Signing in...";

            }


            const email =
                document.getElementById(
                    "admin-email"
                ).value.trim();


            const password =
                document.getElementById(
                    "admin-password"
                ).value;


            try {

                const {
                    error
                } =
                    await supabase.auth.signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


                if (error) {

                    console.error(
                        "Admin login error:",
                        error
                    );


                    if (message) {

                        message.textContent =
                            "The email address or password is incorrect.";

                    }


                    return;

                }


                window.location.href =
                    "admin-dashboard.html";

            }

            catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                if (message) {

                    message.textContent =
                        "Unable to sign in. Please try again.";

                }

            }

        }
    );

}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function initializeDashboard() {

    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    /* -----------------------------------------------------
       CHECK LOGIN
    ----------------------------------------------------- */

    const {
        data: {
            session
        }
    } =
        await supabase.auth.getSession();


    if (!session) {

        window.location.href =
            "admin.html";

        return;

    }


    /* -----------------------------------------------------
       LOG OUT
    ----------------------------------------------------- */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function() {

                await supabase.auth.signOut();


                window.location.href =
                    "admin.html";

            }
        );

    }


    /* -----------------------------------------------------
       LOAD RESERVATIONS
    ----------------------------------------------------- */

    await loadReservations();

}


/* =========================================================
   LOAD RESERVATIONS
   ========================================================= */

async function loadReservations() {

    const message =
        document.getElementById(
            "admin-message"
        );


    const reservationList =
        document.getElementById(
            "reservation-list"
        );


    if (!reservationList) {

        return;

    }


    try {

        if (message) {

            message.textContent =
                "Loading reservations...";

        }


        /* -------------------------------------------------
           GET CURRENT SESSION
        ------------------------------------------------- */

        const {
            data: {
                session
            }
        } =
            await supabase.auth.getSession();


        if (!session) {

            window.location.href =
                "admin.html";

            return;

        }


        /* -------------------------------------------------
           CALL EDGE FUNCTION
        ------------------------------------------------- */

        const response =
            await fetch(

                SUPABASE_URL +
                "/functions/v1/admin-reservations",

                {

                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            session.access_token,

                        "apikey":
                            SUPABASE_PUBLISHABLE_KEY,

                        "Accept":
                            "application/json"

                    }

                }

            );


        const result =
            await response.json();


        /* -------------------------------------------------
           CHECK RESPONSE
        ------------------------------------------------- */

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Could not load reservations."
            );

        }


        const reservations =
            result.reservations || [];


        /* -------------------------------------------------
           CLEAR CURRENT LIST
        ------------------------------------------------- */

        reservationList.innerHTML =
            "";


        /* -------------------------------------------------
           NO RESERVATIONS
        ------------------------------------------------- */

        if (
            reservations.length === 0
        ) {

            if (message) {

                message.textContent =
                    "";

            }


            reservationList.innerHTML = `

                <div class="empty-message">

                    No reservations have been submitted yet.

                </div>

            `;


            return;

        }


        /* -------------------------------------------------
           RESERVATION COUNT
        ------------------------------------------------- */

        if (message) {

            message.textContent =
                reservations.length +
                " reservation" +
                (
                    reservations.length === 1
                        ? ""
                        : "s"
                );

        }


        /* -------------------------------------------------
           CREATE RESERVATION CARDS
        ------------------------------------------------- */

        reservations.forEach(
            function(reservation) {

                createReservationCard(
                    reservation
                );

            }
        );

    }


    catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );


        if (message) {

            message.textContent =
                error.message ||
                "Could not load reservations.";

        }

    }

}


/* =========================================================
   CREATE RESERVATION CARD
   ========================================================= */

function createReservationCard(
    reservation
) {

    const reservationList =
        document.getElementById(
            "reservation-list"
        );


    if (!reservationList) {

        return;

    }


    const item =
        document.createElement(
            "article"
        );


    item.className =
        "reservation-item";


    /* =====================================================
       SUMMARY ROW
    ===================================================== */

    const summaryButton =
        document.createElement(
            "button"
        );


    summaryButton.type =
        "button";


    summaryButton.className =
        "reservation-summary-row";


    summaryButton.setAttribute(
        "aria-expanded",
        "false"
    );


    summaryButton.innerHTML = `

        <div class="summary-field">

            <span>Status</span>

            <strong>

                <span class="reservation-status">

                    ${escapeHtml(
                        reservation.status
                    )}

                </span>

            </strong>

        </div>


        <div class="summary-field">

            <span>Game</span>

            <strong>

                ${escapeHtml(
                    reservation.game
                )}

            </strong>

        </div>


        <div class="summary-field">

            <span>Date</span>

            <strong>

                ${escapeHtml(
                    reservation.reservation_date
                )}

            </strong>

        </div>


        <div class="summary-field">

            <span>Organizer</span>

            <strong>

                ${escapeHtml(
                    reservation.organizer_name
                )}

            </strong>

        </div>


        <div class="summary-field">

            <span>Guests</span>

            <strong>

                ${escapeHtml(
                    reservation.number_of_guests
                )}

            </strong>

        </div>


        <div class="expand-icon">

            ▼

        </div>

    `;


    /* =====================================================
       EXPANDED PANEL
    ===================================================== */

    const detailsPanel =
        document.createElement(
            "div"
        );


    detailsPanel.className =
        "reservation-details-panel";


    /* =====================================================
       PLAYER / CHARACTER ASSIGNMENT SECTION
    ===================================================== */

    let playerSection =
        "";


    const players =
        Array.isArray(
            reservation.players
        )
            ? reservation.players
            : [];


    const characters =
        Array.isArray(
            reservation.characters
        )
            ? reservation.characters
            : [];


    if (
        players.length > 0
    ) {

        const assignedCount =
            players.filter(
                function(player) {

                    return Boolean(
                        player.assigned_character_id
                    );

                }
            ).length;


        playerSection = `

            <section class="details-section">

                <h3>
                    Players & Character Assignments
                </h3>


                <div
                    class="player-list"
                    data-player-list
                >

                    ${players.map(
                        function(player, index) {

                            return `

                                <div
                                    class="player-row"
                                    data-player-id="${escapeHtml(
                                        player.id
                                    )}"
                                >

                                    <div class="player-number">

                                        ${index + 1}

                                    </div>


                                    <div>

                                        <strong
                                            style="
                                                display:block;
                                                color:var(--cream);
                                                font-size:13px;
                                                font-weight:400;
                                                margin-bottom:4px;
                                            "
                                        >

                                            ${escapeHtml(
                                                player.player_name
                                            )}

                                        </strong>


                                        <span>

                                            ${escapeHtml(
                                                player.player_email
                                            )}

                                        </span>

                                    </div>


									<div class="character-email-status">

										<span>

											${
												player.character_email_sent_at
													? "Character email sent"
													: "Character email not sent"
											}

										</span>


										<button
											type="button"
											class="button character-email-button"
											data-action="resend-character-email"
											data-player-id="${escapeHtml(player.id)}"
											${
												player.assigned_character_id
													? ""
													: "disabled"
											}
										>

											Resend Character Email

										</button>


										<span
											class="character-email-message"
											data-character-email-message
											aria-live="polite"
										></span>

									</div>


                                    <div class="character-assignment">

                                        <label>
                                            Character
                                        </label>


                                        <select
                                            class="character-select"
                                            data-character-select
                                            data-player-id="${escapeHtml(
                                                player.id
                                            )}"
                                        >

                                            <option value="">
                                                Not assigned
                                            </option>


                                            ${characters.map(
                                                function(character) {

                                                    const selected =
                                                        String(
                                                            player.assigned_character_id || ""
                                                        ) ===
                                                        String(
                                                            character.id
                                                        )
                                                            ? "selected"
                                                            : "";


                                                    return `

                                                        <option
                                                            value="${escapeHtml(
                                                                character.id
                                                            )}"
                                                            ${selected}
                                                        >

                                                            ${escapeHtml(
                                                                character.character_name
                                                            )}

                                                        </option>

                                                    `;

                                                }
                                            ).join("")}

                                        </select>

                                    </div>

                                </div>

                            `;

                        }
                    ).join("")}

                </div>


                <div
                    class="character-assignment-status"
                    data-assignment-status
                >

                    ${assignedCount}
                    of
                    ${players.length}
                    players assigned

                </div>


                <div class="character-save-row">

                    <button
                        type="button"
                        class="button"
                        data-action="save-characters"
                    >

                        Save Character Assignments

                    </button>


                    <span
                        class="character-save-message"
                        data-character-save-message
                        aria-live="polite"
                    ></span>

                </div>

            </section>

        `;

    }

    /* =====================================================
       DETAILS
    ===================================================== */

	detailsPanel.innerHTML = `

		<!-- RESERVATION -->

		<section class="details-section">

			<h3>
				Reservation Details
			</h3>

			<div class="details-grid">

				${detail(
					"Organizer",
					reservation.organizer_name
				)}

				${detail(
					"Email",
					reservation.organizer_email
				)}

				${detail(
					"Phone",
					reservation.organizer_phone
				)}

				${detail(
					"Game",
					reservation.game
				)}

				${detail(
					"Date",
					reservation.reservation_date
				)}

				${detail(
					"Time",
					reservation.reservation_time
				)}

				${detail(
					"Location",
					reservation.location
				)}

				${detail(
					"Guests",
					reservation.number_of_guests
				)}

				${detail(
					"Total",
					formatMoney(reservation.total)
				)}

				${detail(
					"Deposit Due",
					formatMoney(reservation.deposit_due)
				)}

				${detail(
					"Remaining Balance",
					formatMoney(reservation.remaining_balance)
				)}

			</div>

		</section>


		<!-- NOTES -->

		<section class="details-section">

			<h3>
				Notes
			</h3>

			<div class="notes-grid">

				<div class="notes-box">

					<h4>
						Private Notes
					</h4>

					<p>
						${escapeHtml(
							reservation.private_notes || "No private notes."
						)}
					</p>

				</div>


				<div class="notes-box">

					<h4>
						Organizer Notes
					</h4>

					<p>
						${escapeHtml(
							reservation.organizer_notes || "No organizer notes."
						)}
					</p>

				</div>

			</div>

		</section>


		<!-- PLAYER / CHARACTER ASSIGNMENTS -->

		${playerSection}


		<!-- ACTIONS -->

		<div class="reservation-actions">

			<button
				type="button"
				class="button"
				data-action="edit"
			>
				Edit Reservation
			</button>


			<button
				type="button"
				class="button"
				data-action="approve"
				${
					reservation.status === "approved"
						? "disabled"
						: ""
				}
			>
				${
					reservation.status === "approved"
						? "Approved"
						: "Approve Reservation"
				}
			</button>


			<button
				type="button"
				class="button"
				data-action="decline"
				${
					reservation.status === "declined"
						? "disabled"
						: ""
				}
			>
				${
					reservation.status === "declined"
						? "Declined"
						: "Decline Reservation"
				}
			</button>

		</div>

	`;


    /* =====================================================
       RESEND CHARACTER EMAIL
    ===================================================== */

    const resendCharacterEmailButtons =
        detailsPanel.querySelectorAll(
            '[data-action="resend-character-email"]'
        );


    resendCharacterEmailButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                async function(event) {

                    event.stopPropagation();


                    const playerId =
                        button.dataset.playerId;


                    if (!playerId) {

                        return;

                    }


                    const player =
                        players.find(
                            function(item) {

                                return String(item.id) ===
                                    String(playerId);

                            }
                        );


                    if (!player) {

                        return;

                    }


                    if (!player.assigned_character_id) {

                        alert(
                            "This player does not have a character assigned."
                        );

                        return;

                    }


                    const confirmed =
                        confirm(
                            "Resend the character email to " +
                            (player.player_name || player.player_email) +
                            "?"
                        );


                    if (!confirmed) {

                        return;

                    }


                    const originalText =
                        button.textContent;


                    const message =
                        button
                            .parentElement
                            .querySelector(
                                "[data-character-email-message]"
                            );


                    button.disabled =
                        true;


                    button.textContent =
                        "Sending...";


                    if (message) {

                        message.textContent =
                            "";

                    }


                    try {

                        /* -----------------------------------------
                           GET SESSION
                        ----------------------------------------- */

                        const {
                            data: {
                                session
                            }
                        } =
                            await supabase.auth.getSession();


                        if (!session) {

                            window.location.href =
                                "admin.html";

                            return;

                        }


                        /* -----------------------------------------
                           SEND REQUEST
                        ----------------------------------------- */

                        const response =
                            await fetch(

                                SUPABASE_URL +
                                "/functions/v1/admin-resend-character-email",

                                {

                                    method:
                                        "POST",

                                    headers: {

                                        "Authorization":
                                            "Bearer " +
                                            session.access_token,

                                        "apikey":
                                            SUPABASE_PUBLISHABLE_KEY,

                                        "Content-Type":
                                            "application/json"

                                    },

                                    body:
                                        JSON.stringify({

                                            reservation_id:
                                                reservation.id,

                                            player_id:
                                                player.id

                                        })

                                }

                            );


                        const result =
                            await response.json();


                        /* -----------------------------------------
                           CHECK RESPONSE
                        ----------------------------------------- */

                        if (
                            !response.ok ||
                            !result.success
                        ) {

                            throw new Error(
                                result.error ||
                                "Could not resend character email."
                            );

                        }


                        /* -----------------------------------------
                           SUCCESS
                        ----------------------------------------- */

                        if (message) {

                            message.textContent =
                                "Email sent.";

                        }


                        button.textContent =
                            "Sent";


                        setTimeout(
                            function() {

                                loadReservations();

                            },
                            1000
                        );

                    }


                    catch (error) {

                        console.error(
                            "Resend character email error:",
                            error
                        );


                        if (message) {

                            message.textContent =
                                error.message ||
                                "Could not resend character email.";

                        }


                        button.disabled =
                            false;


                        button.textContent =
                            originalText;

                    }

                }
            );

        }
    );


    /* =====================================================
       APPEND CARD
    ===================================================== */

    item.appendChild(
        summaryButton
    );

    item.appendChild(
        detailsPanel
    );

    reservationList.appendChild(
        item
    );


    /* =====================================================
       EXPAND / COLLAPSE
    ===================================================== */

    summaryButton.addEventListener(
        "click",
        function() {

            const expanded =
                item.classList.toggle(
                    "expanded"
                );


            summaryButton.setAttribute(
                "aria-expanded",
                String(expanded)
            );

        }
    );


    /* =====================================================
       EDIT
    ===================================================== */

    const editButton =
        detailsPanel.querySelector(
            '[data-action="edit"]'
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();


                showEditForm(
                    reservation,
                    item,
                    detailsPanel
                );

            }
        );

    }


    /* =====================================================
       APPROVE
    ===================================================== */

    const approveButton =
        detailsPanel.querySelector(
            '[data-action="approve"]'
        );


    if (approveButton) {

        approveButton.addEventListener(
            "click",
            async function(event) {

                event.stopPropagation();


                const confirmed =
                    confirm(
                        "Are you sure you want to approve this reservation?"
                    );


                if (!confirmed) {

                    return;

                }


                approveButton.disabled =
                    true;


                approveButton.textContent =
                    "Approving...";


                try {

                    const {
                        data: {
                            session
                        }
                    } =
                        await supabase.auth.getSession();


                    if (!session) {

                        window.location.href =
                            "admin.html";

                        return;

                    }


                    const response =
                        await fetch(

                            SUPABASE_URL +
                            "/functions/v1/admin-approve-reservation",

                            {

                                method:
                                    "POST",

                                headers: {

                                    "Authorization":
                                        "Bearer " +
                                        session.access_token,

                                    "apikey":
                                        SUPABASE_PUBLISHABLE_KEY,

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        reservation_id:
                                            reservation.id

                                    })

                            }

                        );


                    const result =
                        await response.json();


                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.error ||
                            "Could not approve reservation."
                        );

                    }


                    await loadReservations();

                }


                catch (error) {

                    console.error(
                        "Approve reservation error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Could not approve reservation."
                    );


                    approveButton.disabled =
                        false;


                    approveButton.textContent =
                        "Approve Reservation";

                }

            }
        );

    }


    /* =====================================================
       DECLINE
    ===================================================== */

    const declineButton =
        detailsPanel.querySelector(
            '[data-action="decline"]'
        );


    if (declineButton) {

        declineButton.addEventListener(
            "click",
            async function(event) {

                event.stopPropagation();


                const confirmed =
                    confirm(
                        "Are you sure you want to decline this reservation?"
                    );


                if (!confirmed) {

                    return;

                }


                declineButton.disabled =
                    true;


                declineButton.textContent =
                    "Declining...";


                try {

                    const {
                        data: {
                            session
                        }
                    } =
                        await supabase.auth.getSession();


                    if (!session) {

                        window.location.href =
                            "admin.html";

                        return;

                    }


                    const response =
                        await fetch(

                            SUPABASE_URL +
                            "/functions/v1/admin-decline-reservation",

                            {

                                method:
                                    "POST",

                                headers: {

                                    "Authorization":
                                        "Bearer " +
                                        session.access_token,

                                    "apikey":
                                        SUPABASE_PUBLISHABLE_KEY,

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        reservation_id:
                                            reservation.id

                                    })

                            }

                        );


                    const result =
                        await response.json();


                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.error ||
                            "Could not decline reservation."
                        );

                    }


                    alert(
                        "Reservation declined. The organizer has been notified."
                    );


                    await loadReservations();

                }


                catch (error) {

                    console.error(
                        "Decline reservation error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Could not decline reservation."
                    );


                    declineButton.disabled =
                        false;


                    declineButton.textContent =
                        "Decline Reservation";

                }

            }
        );

    }


    /* =====================================================
       CHARACTER ASSIGNMENTS
    ===================================================== */

    const characterSelects =
        detailsPanel.querySelectorAll(
            "[data-character-select]"
        );


    const assignmentStatus =
        detailsPanel.querySelector(
            "[data-assignment-status]"
        );


    const saveCharactersButton =
        detailsPanel.querySelector(
            '[data-action="save-characters"]'
        );


    const characterSaveMessage =
        detailsPanel.querySelector(
            "[data-character-save-message]"
        );


    /* -----------------------------------------------------
       UPDATE ASSIGNMENT COUNT
    ----------------------------------------------------- */

    function updateAssignmentCount() {

        if (!assignmentStatus) {

            return;

        }


        let assignedCount =
            0;


        characterSelects.forEach(
            function(select) {

                if (
                    select.value
                ) {

                    assignedCount++;

                }

            }
        );


        assignmentStatus.textContent =
            assignedCount +
            " of " +
            characterSelects.length +
            " players assigned";

    }


    /* -----------------------------------------------------
       PREVENT DUPLICATE CHARACTERS
    ----------------------------------------------------- */

    function updateCharacterOptions() {

        const selectedCharacters =
            new Set();


        characterSelects.forEach(
            function(select) {

                if (
                    select.value
                ) {

                    selectedCharacters.add(
                        select.value
                    );

                }

            }
        );


        characterSelects.forEach(
            function(select) {

                const currentValue =
                    select.value;


                Array.from(
                    select.options
                ).forEach(
                    function(option) {

                        if (
                            !option.value
                        ) {

                            return;

                        }


                        option.disabled =
                            option.value !==
                            currentValue &&
                            selectedCharacters.has(
                                option.value
                            );

                    }
                );

            }
        );

    }


    /* -----------------------------------------------------
       CHARACTER SELECTION CHANGE
    ----------------------------------------------------- */

    characterSelects.forEach(
        function(select) {

            select.addEventListener(
                "change",
                function() {

                    updateCharacterOptions();

                    updateAssignmentCount();


                    if (
                        characterSaveMessage
                    ) {

                        characterSaveMessage.textContent =
                            "";

                    }

                }
            );

        }
    );


    /* -----------------------------------------------------
       INITIALIZE CHARACTER ASSIGNMENTS
    ----------------------------------------------------- */

    updateCharacterOptions();

    updateAssignmentCount();


    /* -----------------------------------------------------
       SAVE CHARACTER ASSIGNMENTS
    ----------------------------------------------------- */

    if (
        saveCharactersButton
    ) {

        saveCharactersButton.addEventListener(
            "click",
            async function(event) {

                event.stopPropagation();


                saveCharactersButton.disabled =
                    true;


                saveCharactersButton.textContent =
                    "Saving...";


                if (
                    characterSaveMessage
                ) {

                    characterSaveMessage.textContent =
                        "";

                }


                try {

                    /* -----------------------------------------
                       GET SESSION
                    ----------------------------------------- */

                    const {
                        data: {
                            session
                        }
                    } =
                        await supabase.auth.getSession();


                    if (!session) {

                        window.location.href =
                            "admin.html";

                        return;

                    }


                    /* -----------------------------------------
                       BUILD ASSIGNMENTS
                    ----------------------------------------- */

                    const assignments =
                        Array.from(
                            characterSelects
                        ).map(
                            function(select) {

                                return {

                                    player_id:
                                        select.dataset.playerId,

                                    character_id:
                                        select.value ||
                                        null

                                };

                            }
                        );


                    /* -----------------------------------------
                       SEND TO EDGE FUNCTION
                    ----------------------------------------- */

                    const response =
                        await fetch(

                            SUPABASE_URL +
                            "/functions/v1/admin-assign-characters",

                            {

                                method:
                                    "POST",

                                headers: {

                                    "Authorization":
                                        "Bearer " +
                                        session.access_token,

                                    "apikey":
                                        SUPABASE_PUBLISHABLE_KEY,

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        reservation_id:
                                            reservation.id,

                                        assignments:
                                            assignments

                                    })

                            }

                        );


                    const result =
                        await response.json();


                    /* -----------------------------------------
                       CHECK RESULT
                    ----------------------------------------- */

                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.error ||
                            "Could not save character assignments."
                        );

                    }


                    /* -----------------------------------------
                       SUCCESS
                    ----------------------------------------- */

                    if (
                        characterSaveMessage
                    ) {

                        characterSaveMessage.textContent =
                            "Character assignments saved.";

                    }


                    saveCharactersButton.textContent =
                        "Saved";


                    /*
                     * Reload the dashboard after a short delay.
                     */

                    setTimeout(
                        function() {

                            loadReservations();

                        },
                        700
                    );

                }


                catch (error) {

                    console.error(
                        "Character assignment error:",
                        error
                    );


                    if (
                        characterSaveMessage
                    ) {

                        characterSaveMessage.textContent =
                            error.message ||
                            "Could not save character assignments.";

                    }


                    saveCharactersButton.disabled =
                        false;


                    saveCharactersButton.textContent =
                        "Save Character Assignments";

                }

            }
        );

    }

}


/* =========================================================
   EDIT RESERVATION
   ========================================================= */

function showEditForm(
    reservation,
    item,
    detailsPanel
) {

    if (
        detailsPanel.querySelector(
            "[data-edit-form]"
        )
    ) {

        return;

    }


    const editForm =
        document.createElement(
            "form"
        );


    editForm.setAttribute(
        "data-edit-form",
        ""
    );


    editForm.style.marginTop =
        "30px";


    editForm.style.paddingTop =
        "30px";


    editForm.style.borderTop =
        "1px solid rgba(198, 161, 91, 0.15)";


    editForm.innerHTML = `

        <section class="details-section">

            <h3>
                Edit Reservation
            </h3>


            <div class="details-grid">

                <div class="detail-field">

                    <span>
                        Date
                    </span>


                    <input
                        type="text"
                        name="reservation_date"
                        value="${escapeHtml(
                            reservation.reservation_date || ""
                        )}"
                        required
                    >

                </div>


                <div class="detail-field">

                    <span>
                        Time
                    </span>


                    <input
                        type="text"
                        name="reservation_time"
                        value="${escapeHtml(
                            reservation.reservation_time || ""
                        )}"
                        required
                    >

                </div>


                <div class="detail-field">

                    <span>
                        Location
                    </span>


                    <input
                        type="text"
                        name="location"
                        value="${escapeHtml(
                            reservation.location || ""
                        )}"
                        required
                    >

                </div>


                <div class="detail-field">

                    <span>
                        Number of Guests
                    </span>


                    <input
                        type="number"
                        name="number_of_guests"
                        min="1"
                        value="${escapeHtml(
                            reservation.number_of_guests || ""
                        )}"
                        required
                    >

                </div>


                <div class="detail-field">

                    <span>
                        Total
                    </span>


                    <input
                        type="number"
                        name="total"
                        min="0"
                        step="0.01"
                        value="${escapeHtml(
                            reservation.total || 0
                        )}"
                        required
                    >

                </div>


                <div class="detail-field">

                    <span>
                        Deposit Due
                    </span>


                    <input
                        type="number"
                        name="deposit_due"
                        min="0"
                        step="0.01"
                        value="${escapeHtml(
                            reservation.deposit_due || 0
                        )}"
                        required
                    >

                </div>


                <div class="detail-field">

                    <span>
                        Remaining Balance
                    </span>


                    <input
                        type="number"
                        name="remaining_balance"
                        min="0"
                        step="0.01"
                        value="${escapeHtml(
                            reservation.remaining_balance || 0
                        )}"
                        required
                    >

                </div>

            </div>

        </section>


        <section class="details-section">

            <h3>
                Notes
            </h3>


            <div class="notes-grid">


                <div class="notes-box">

                    <h4>
                        Private Notes
                    </h4>


                    <textarea
                        name="private_notes"
                        rows="6"
                        placeholder="Notes only you can see..."
                    >${escapeHtml(
                        reservation.private_notes || ""
                    )}</textarea>

                </div>


                <div class="notes-box">

                    <h4>
                        Organizer Notes
                    </h4>


                    <textarea
                        name="organizer_notes"
                        rows="6"
                        placeholder="Notes that can be sent to the organizer..."
                    >${escapeHtml(
                        reservation.organizer_notes || ""
                    )}</textarea>

                </div>


            </div>

        </section>


        <div class="reservation-actions">

            <button
                type="submit"
                class="button"
            >

                Save Changes

            </button>


            <button
                type="button"
                class="button"
                data-action="cancel-edit"
            >

                Cancel

            </button>


            <p
                data-edit-message
                class="admin-message"
                aria-live="polite"
                style="width:100%; margin:0;"
            ></p>

        </div>

    `;


    detailsPanel.appendChild(
        editForm
    );


    /* =====================================================
       CANCEL EDIT
    ===================================================== */

    const cancelButton =
        editForm.querySelector(
            '[data-action="cancel-edit"]'
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function() {

                editForm.remove();

            }
        );

    }


    /* =====================================================
       SAVE EDIT
    ===================================================== */

    editForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const editMessage =
                editForm.querySelector(
                    "[data-edit-message]"
                );


            const formData =
                new FormData(
                    editForm
                );


            const updatedData = {

                reservation_id:
                    reservation.id,

                reservation_date:
                    formData.get(
                        "reservation_date"
                    ),

                reservation_time:
                    formData.get(
                        "reservation_time"
                    ),

                location:
                    formData.get(
                        "location"
                    ),

                number_of_guests:
                    Number(
                        formData.get(
                            "number_of_guests"
                        )
                    ),

                total:
                    Number(
                        formData.get(
                            "total"
                        )
                    ),

                deposit_due:
                    Number(
                        formData.get(
                            "deposit_due"
                        )
                    ),

                remaining_balance:
                    Number(
                        formData.get(
                            "remaining_balance"
                        )
                    ),

                private_notes:
                    formData.get(
                        "private_notes"
                    ),

                organizer_notes:
                    formData.get(
                        "organizer_notes"
                    )

            };


            /* =================================================
               SPELLBOUND BETA PRICE
            ================================================= */

            if (
                reservation.game ===
                "Spellbound"
            ) {

                /*
                 * Spellbound currently has a flat
                 * $300 beta price.
                 */

                updatedData.total =
                    300;


                updatedData.deposit_due =
                    150;


                updatedData.remaining_balance =
                    150;


                const totalInput =
                    editForm.querySelector(
                        '[name="total"]'
                    );


                const depositInput =
                    editForm.querySelector(
                        '[name="deposit_due"]'
                    );


                const balanceInput =
                    editForm.querySelector(
                        '[name="remaining_balance"]'
                    );


                if (totalInput) {

                    totalInput.value =
                        "300.00";

                }


                if (depositInput) {

                    depositInput.value =
                        "150.00";

                }


                if (balanceInput) {

                    balanceInput.value =
                        "150.00";

                }

            }


            /* =================================================
               VALIDATION
            ================================================= */

            if (
                !updatedData.reservation_date ||
                !updatedData.reservation_time ||
                !updatedData.location ||
                !updatedData.number_of_guests ||
                updatedData.number_of_guests < 1
            ) {

                editMessage.textContent =
                    "Please complete the required reservation information.";

                return;

            }


            editMessage.textContent =
                "Saving changes...";


            try {

                /* ---------------------------------------------
                   GET SESSION
                --------------------------------------------- */

                const {
                    data: {
                        session
                    }
                } =
                    await supabase.auth.getSession();


                if (!session) {

                    window.location.href =
                        "admin.html";

                    return;

                }


                /* ---------------------------------------------
                   UPDATE RESERVATION
                --------------------------------------------- */

                const response =
                    await fetch(

                        SUPABASE_URL +
                        "/functions/v1/admin-update-reservation",

                        {

                            method:
                                "POST",

                            headers: {

                                "Authorization":
                                    "Bearer " +
                                    session.access_token,

                                "apikey":
                                    SUPABASE_PUBLISHABLE_KEY,

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    updatedData
                                )

                        }

                    );


                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.error ||
                        "Could not save reservation."
                    );

                }


                editMessage.textContent =
                    "Reservation saved.";


                /* ---------------------------------------------
                   RELOAD
                --------------------------------------------- */

                setTimeout(
                    function() {

                        loadReservations();

                    },
                    500
                );

            }


            catch (error) {

                console.error(
                    "Update reservation error:",
                    error
                );


                editMessage.textContent =
                    error.message ||
                    "Could not save reservation.";

            }

        }
    );

}


/* =========================================================
   DETAIL FIELD
   ========================================================= */

function detail(
    label,
    value
) {

    return `

        <div class="detail-field">

            <span>

                ${escapeHtml(
                    label
                )}

            </span>


            <strong>

                ${escapeHtml(
                    value ?? ""
                )}

            </strong>

        </div>

    `;

}


/* =========================================================
   MONEY
   ========================================================= */

function formatMoney(
    value
) {

    return "$" +
        Number(
            value || 0
        ).toFixed(2);

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}