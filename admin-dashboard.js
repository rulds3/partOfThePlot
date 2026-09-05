/* =========================================================
   PART OF THE PLOT
   Admin Dashboard
   Reservation management
   ========================================================= */

import {
    requireAdminSession,
    logoutAdmin,
    adminRequest
} from "./admin.js";


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

const reservationList =
    document.getElementById(
        "reservation-list"
    );


let activeReservationFilter =
    "all";


if (reservationList) {

    initializeDashboard();

}


/* =========================================================
   DASHBOARD INITIALIZATION
   ========================================================= */

async function initializeDashboard() {

    /* -----------------------------------------------------
       CHECK LOGIN
    ----------------------------------------------------- */

    const session =
        await requireAdminSession();


    if (!session) {

        return;

    }


    /* -----------------------------------------------------
       LOG OUT
    ----------------------------------------------------- */

    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function() {

                logoutButton.disabled =
                    true;


                logoutButton.textContent =
                    "Signing out...";


                await logoutAdmin();

            }
        );

    }


    /* -----------------------------------------------------
       RESERVATION FILTERS
    ----------------------------------------------------- */

    initializeReservationFilters();


    /* -----------------------------------------------------
       LOAD RESERVATIONS
    ----------------------------------------------------- */

    await loadReservations();

}


/* =========================================================
   RESERVATION FILTERS
   ========================================================= */

function initializeReservationFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".reservation-filter"
        );


    if (
        filterButtons.length === 0
    ) {

        return;

    }


    filterButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const filter =
                        button.dataset.filter ||
                        "all";


                    activeReservationFilter =
                        filter;


                    filterButtons.forEach(
                        function(item) {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        }
                    );


                    loadReservations();

                }
            );

        }
    );

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


        const result =
            await adminRequest(
                "admin-reservations",
                {
                    method: "GET"
                }
            );


        const reservations =
            Array.isArray(
                result.reservations
            )
                ? result.reservations
                : [];


        reservationList.innerHTML =
            "";


        /* -------------------------------------------------
           SORT BY EVENT DATE
        ------------------------------------------------- */

        reservations.sort(
            function(a, b) {

                return (
                    parseReservationDate(
                        a.reservation_date
                    ) -
                    parseReservationDate(
                        b.reservation_date
                    )
                );

            }
        );


        /* -------------------------------------------------
           APPLY FILTER
        ------------------------------------------------- */

        const filteredReservations =
            reservations.filter(
                function(reservation) {

                    return reservationMatchesFilter(
                        reservation,
                        activeReservationFilter
                    );

                }
            );


        /* -------------------------------------------------
           NO RESERVATIONS AT ALL
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
           NO RESERVATIONS FOR CURRENT FILTER
        ------------------------------------------------- */

        if (
            filteredReservations.length === 0
        ) {

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


            reservationList.innerHTML = `

                <div class="empty-message">

                    No reservations match this filter.

                </div>

            `;


            return;

        }


        /* -------------------------------------------------
           MESSAGE
        ------------------------------------------------- */

        if (message) {

            if (
                activeReservationFilter === "all"
            ) {

                message.textContent =
                    reservations.length +
                    " reservation" +
                    (
                        reservations.length === 1
                            ? ""
                            : "s"
                    );

            }

            else {

                message.textContent =
                    filteredReservations.length +
                    " of " +
                    reservations.length +
                    " reservations";

            }

        }


        /* -------------------------------------------------
           CREATE CARDS
        ------------------------------------------------- */

        filteredReservations.forEach(
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
   PARSE RESERVATION DATE
   ========================================================= */

function parseReservationDate(
    dateString
) {

    if (!dateString) {

        return 0;

    }


    const match =
        String(
            dateString
        ).trim().match(
            /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/
        );


    if (!match) {

        const fallback =
            new Date(
                dateString
            );


        return isNaN(
            fallback.getTime()
        )
            ? 0
            : fallback.getTime();

    }


    const monthName =
        match[1].toLowerCase();


    const day =
        Number(
            match[2]
        );


    const year =
        Number(
            match[3]
        );


    const months = {

        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11

    };


    if (
        months[monthName] === undefined
    ) {

        return 0;

    }


    return new Date(
        year,
        months[monthName],
        day
    ).getTime();

}


/* =========================================================
   RESERVATION FILTER
   ========================================================= */

function reservationMatchesFilter(
    reservation,
    filter
) {

    if (
        filter === "all"
    ) {

        return true;

    }


    const eventDate =
        parseReservationDate(
            reservation.reservation_date
        );


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const todayTime =
        today.getTime();


    /* -----------------------------------------------------
       UPCOMING
    ----------------------------------------------------- */

    if (
        filter === "upcoming"
    ) {

        return eventDate >= todayTime;

    }


    /* -----------------------------------------------------
       PAST
    ----------------------------------------------------- */

    if (
        filter === "past"
    ) {

        return (
            eventDate > 0 &&
            eventDate < todayTime
        );

    }


    /* -----------------------------------------------------
       NEEDS ATTENTION
    ----------------------------------------------------- */

    if (
        filter === "attention"
    ) {

        const depositPaid =
            Boolean(
                reservation.deposit_paid_at
            );


        const remainingBalance =
            Number(
                reservation.remaining_balance || 0
            );


        const finalPaid =
            Boolean(
                reservation.final_payment_paid_at
            ) ||
            (
                depositPaid &&
                remainingBalance <= 0
            );


        /* ---------------------------------------------
           Pending approval / action
        --------------------------------------------- */

        if (
            reservation.status ===
                "awaiting_confirmation" ||
            reservation.status ===
                "pending"
        ) {

            return true;

        }


        /* ---------------------------------------------
           Approved but deposit unpaid
        --------------------------------------------- */

        if (
            reservation.status === "approved" &&
            !depositPaid
        ) {

            return true;

        }


        /* ---------------------------------------------
           Confirmed but final balance unpaid
        --------------------------------------------- */

        if (
            reservation.status === "confirmed" &&
            depositPaid &&
            !finalPaid &&
            remainingBalance > 0
        ) {

            return true;

        }


        /* ---------------------------------------------
           Event has passed but reservation remains
           otherwise active
        --------------------------------------------- */

        if (
            eventDate > 0 &&
            eventDate < todayTime &&
            reservation.status !== "declined"
        ) {

            return true;

        }


        return false;

    }


    return true;

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


    const depositPaid =
        Boolean(
            reservation.deposit_paid_at
        );


    const remainingBalance =
        Number(
            reservation.remaining_balance || 0
        );


    const finalPaid =
        Boolean(
            reservation.final_payment_paid_at
        ) ||
        (
            depositPaid &&
            remainingBalance <= 0
        );


    const needsAttention =
        reservationMatchesFilter(
            reservation,
            "attention"
        );


    let paymentSummary =
        "Unpaid";


    if (
        depositPaid &&
        finalPaid
    ) {

        paymentSummary =
            "Paid in Full";

    }

    else if (
        depositPaid &&
        !finalPaid
    ) {

        paymentSummary =
            "Deposit Paid";

    }

    else if (
        !depositPaid
    ) {

        paymentSummary =
            "Deposit Unpaid";

    }


    summaryButton.innerHTML = `

        <div class="summary-field">

            <span>Status</span>

            <strong>

                <span class="reservation-status">

                    ${escapeHtml(
                        formatReservationStatus(
                            reservation.status
                        )
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


        <div class="summary-field payment-summary-field">

            <span>Payment</span>

            <strong>

                ${escapeHtml(
                    paymentSummary
                )}

            </strong>

        </div>


        ${
            needsAttention
                ? `
                    <div class="summary-attention">
                        Needs Attention
                    </div>
                  `
                : ""
        }


        <div class="expand-icon">

            ▼

        </div>

    `;


    /* =====================================================
       DETAILS PANEL
       ===================================================== */

    const detailsPanel =
        document.createElement(
            "div"
        );


    detailsPanel.className =
        "reservation-details-panel";


    /* =====================================================
       PLAYERS / CHARACTERS
       ===================================================== */

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


    let playerSection =
        "";


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
                                            class="player-name"
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
                                            data-player-id="${escapeHtml(
                                                player.id
                                            )}"
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
                    formatMoney(
                        reservation.total
                    )
                )}

                ${detail(
                    "Deposit Due",
                    formatMoney(
                        reservation.deposit_due
                    )
                )}

                ${detail(
                    "Remaining Balance",
                    formatMoney(
                        reservation.remaining_balance
                    )
                )}

            </div>

        </section>


        <!-- =================================================
             PAYMENT STATUS
        ================================================= -->

        <section class="details-section">

            <h3>
                Payment Status
            </h3>


            <div
                class="payment-status-panel"
                data-payment-panel
            >

                <div class="payment-status-summary">

                    <div class="detail-field">

                        <span>
                            Total
                        </span>

                        <strong>
                            ${formatMoney(
                                reservation.total
                            )}
                        </strong>

                    </div>


                    <div class="detail-field">

                        <span>
                            Deposit
                        </span>

                        <strong data-deposit-status>

                            ${
                                reservation.deposit_paid_at
                                    ? "Paid"
                                    : "Unpaid"
                            }

                        </strong>

                    </div>


                    <div class="detail-field">

                        <span>
                            Final Balance
                        </span>

                        <strong data-final-status>

                            ${
                                Number(
                                    reservation.remaining_balance || 0
                                ) <= 0 &&
                                reservation.deposit_paid_at
                                    ? "Paid"
                                    : "Unpaid"
                            }

                        </strong>

                    </div>

                </div>


                <div
                    class="payment-status-message"
                    data-payment-message
                    aria-live="polite"
                ></div>


                <div
                    class="payment-actions"
                    data-payment-actions
                ></div>

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


                    <p>

                        ${escapeHtml(
                            reservation.private_notes ||
                            "No private notes."
                        )}

                    </p>

                </div>


                <div class="notes-box">

                    <h4>
                        Organizer Notes
                    </h4>


                    <p>

                        ${escapeHtml(
                            reservation.organizer_notes ||
                            "No organizer notes."
                        )}

                    </p>

                </div>

            </div>

        </section>


        ${playerSection}


        <!-- =================================================
             EMAIL ORGANIZER
        ================================================= -->

        <section class="details-section">

            <h3>
                Email Organizer
            </h3>


            <div
                class="admin-email-composer"
                data-email-composer
            >

                <div class="detail-field">

                    <span>
                        To
                    </span>

                    <strong>
                        ${escapeHtml(
                            reservation.organizer_email || ""
                        )}
                    </strong>

                </div>


                <div class="admin-email-field">

                    <label
                        for="email-subject-${escapeHtml(
                            reservation.id
                        )}"
                    >
                        Subject
                    </label>


                    <input
                        type="text"
                        id="email-subject-${escapeHtml(
                            reservation.id
                        )}"
                        data-email-subject
                        maxlength="200"
                        placeholder="Email subject..."
                    >

                </div>


                <div class="admin-email-field">

                    <label
                        for="email-message-${escapeHtml(
                            reservation.id
                        )}"
                    >
                        Message
                    </label>


                    <textarea
                        id="email-message-${escapeHtml(
                            reservation.id
                        )}"
                        data-email-message
                        rows="9"
                        maxlength="10000"
                        placeholder="Write your message to the organizer..."
                    ></textarea>

                </div>


                <div class="reservation-actions">

                    <button
                        type="button"
                        class="button"
                        data-action="send-email"
                    >

                        Send Email

                    </button>


                    <span
                        class="admin-email-status"
                        data-email-status
                        aria-live="polite"
                    ></span>

                </div>

            </div>

        </section>


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
       EMAIL ORGANIZER
       ===================================================== */

    const emailSubject =
        detailsPanel.querySelector(
            "[data-email-subject]"
        );


    const emailMessage =
        detailsPanel.querySelector(
            "[data-email-message]"
        );


    const sendEmailButton =
        detailsPanel.querySelector(
            '[data-action="send-email"]'
        );


    const emailStatus =
        detailsPanel.querySelector(
            "[data-email-status]"
        );


    if (sendEmailButton) {

        sendEmailButton.addEventListener(
            "click",
            async function(event) {

                event.stopPropagation();


                const subject =
                    emailSubject?.value.trim() ||
                    "";


                const message =
                    emailMessage?.value.trim() ||
                    "";


                if (!subject) {

                    if (emailStatus) {

                        emailStatus.textContent =
                            "Please enter a subject.";

                    }


                    emailSubject?.focus();

                    return;

                }


                if (!message) {

                    if (emailStatus) {

                        emailStatus.textContent =
                            "Please enter a message.";

                    }


                    emailMessage?.focus();

                    return;

                }


                const confirmed =
                    confirm(
                        "Send this email to " +
                        (
                            reservation.organizer_name ||
                            reservation.organizer_email
                        ) +
                        "?"
                    );


                if (!confirmed) {

                    return;

                }


                sendEmailButton.disabled =
                    true;


                sendEmailButton.textContent =
                    "Sending...";


                if (emailStatus) {

                    emailStatus.textContent =
                        "";

                }


                try {

                    await adminRequest(
                        "admin-send-email",
                        {
                            body: {

                                reservation_id:
                                    reservation.id,

                                subject:
                                    subject,

                                message:
                                    message

                            }
                        }
                    );


                    if (emailStatus) {

                        emailStatus.textContent =
                            "Email sent successfully.";

                    }


                    sendEmailButton.textContent =
                        "Email Sent";


                    if (emailSubject) {

                        emailSubject.value =
                            "";

                    }


                    if (emailMessage) {

                        emailMessage.value =
                            "";

                    }


                    setTimeout(
                        function() {

                            if (sendEmailButton) {

                                sendEmailButton.disabled =
                                    false;

                                sendEmailButton.textContent =
                                    "Send Email";

                            }

                        },
                        2000
                    );

                }

                catch (error) {

                    console.error(
                        "Send organizer email error:",
                        error
                    );


                    if (emailStatus) {

                        emailStatus.textContent =
                            error.message ||
                            "Could not send email.";

                    }


                    sendEmailButton.disabled =
                        false;


                    sendEmailButton.textContent =
                        "Send Email";

                }

            }
        );

    }


    /* =====================================================
       RESEND CHARACTER EMAIL
       ===================================================== */

    const resendButtons =
        detailsPanel.querySelectorAll(
            '[data-action="resend-character-email"]'
        );


    resendButtons.forEach(
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

                                return String(
                                    item.id
                                ) ===
                                String(
                                    playerId
                                );

                            }
                        );


                    if (!player) {

                        return;

                    }


                    if (
                        !player.assigned_character_id
                    ) {

                        alert(
                            "This player does not have a character assigned."
                        );

                        return;

                    }


                    const confirmed =
                        confirm(
                            "Resend the character email to " +
                            (
                                player.player_name ||
                                player.player_email
                            ) +
                            "?"
                        );


                    if (!confirmed) {

                        return;

                    }


                    const originalText =
                        button.textContent;


                    const message =
                        button.parentElement.querySelector(
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

                        await adminRequest(
                            "admin-resend-character-email",
                            {
                                body: {

                                    reservation_id:
                                        reservation.id,

                                    player_id:
                                        player.id

                                }
                            }
                        );


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
                String(
                    expanded
                )
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

                    await adminRequest(
                        "admin-approve-reservation",
                        {
                            body: {

                                reservation_id:
                                    reservation.id

                            }
                        }
                    );


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

                    await adminRequest(
                        "admin-decline-reservation",
                        {
                            body: {

                                reservation_id:
                                    reservation.id

                            }
                        }
                    );


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

    initializeCharacterAssignments(
        detailsPanel,
        reservation
    );


    /* =====================================================
       PAYMENT CONTROLS
       ===================================================== */

    initializePaymentControls(
        detailsPanel,
        reservation
    );

}


/* =========================================================
   CHARACTER ASSIGNMENTS
   ========================================================= */

function initializeCharacterAssignments(
    detailsPanel,
    reservation
) {

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


    if (
        characterSelects.length === 0
    ) {

        return;

    }


    function updateAssignmentCount() {

        if (!assignmentStatus) {

            return;

        }


        let assignedCount =
            0;


        characterSelects.forEach(
            function(select) {

                if (select.value) {

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


    function updateCharacterOptions() {

        const selectedCharacters =
            new Set();


        characterSelects.forEach(
            function(select) {

                if (select.value) {

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

                        if (!option.value) {

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


    updateCharacterOptions();

    updateAssignmentCount();


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


                    await adminRequest(
                        "admin-assign-characters",
                        {
                            body: {

                                reservation_id:
                                    reservation.id,

                                assignments:
                                    assignments

                            }
                        }
                    );


                    if (
                        characterSaveMessage
                    ) {

                        characterSaveMessage.textContent =
                            "Character assignments saved.";

                    }


                    saveCharactersButton.textContent =
                        "Saved";


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
   PAYMENT CONTROLS
   ========================================================= */

function initializePaymentControls(
    detailsPanel,
    reservation
) {

    const paymentActions =
        detailsPanel.querySelector(
            "[data-payment-actions]"
        );


    const paymentMessage =
        detailsPanel.querySelector(
            "[data-payment-message]"
        );


    const depositStatus =
        detailsPanel.querySelector(
            "[data-deposit-status]"
        );


    const finalStatus =
        detailsPanel.querySelector(
            "[data-final-status]"
        );


    if (
        !paymentActions
    ) {

        return;

    }


    const depositPaid =
        Boolean(
            reservation.deposit_paid_at
        );


    const remainingBalance =
        Number(
            reservation.remaining_balance || 0
        );


    const finalPaid =
        Boolean(
            reservation.final_payment_paid_at
        ) ||
        (
            depositPaid &&
            remainingBalance <= 0
        );


    const paymentMethodName =
        function(method) {

            if (!method) {

                return "";

            }


            const normalized =
                String(
                    method
                ).toLowerCase();


            if (
                normalized === "stripe"
            ) {

                return "Stripe";

            }


            if (
                normalized === "venmo"
            ) {

                return "Venmo";

            }


            if (
                normalized === "cash"
            ) {

                return "Cash";

            }


            return method;

        };


    /* =====================================================
       DISPLAY PAYMENT METHODS
       ===================================================== */

    if (
        depositPaid &&
        reservation.deposit_payment_method
    ) {

        depositStatus.textContent =
            "Paid with " +
            paymentMethodName(
                reservation.deposit_payment_method
            );

    }


    if (
        finalPaid &&
        reservation.final_payment_method
    ) {

        finalStatus.textContent =
            "Paid with " +
            paymentMethodName(
                reservation.final_payment_method
            );

    }


    /* =====================================================
       PAID IN FULL
    ===================================================== */

    if (
        depositPaid &&
        finalPaid
    ) {

        paymentActions.innerHTML = `

            <div class="payment-paid-in-full">

                ✓ Paid in Full

            </div>

        `;


        return;

    }


    /* =====================================================
       FINAL BALANCE
    ===================================================== */

    if (
        depositPaid &&
        !finalPaid &&
        remainingBalance > 0
    ) {

        paymentActions.innerHTML = `

            <div class="payment-action-label">

                Record Final Balance Payment

            </div>


            <div class="payment-button-row">

                <button
                    type="button"
                    class="button"
                    data-payment-method="venmo"
                    data-payment-type="final"
                >

                    Paid with Venmo

                </button>


                <button
                    type="button"
                    class="button"
                    data-payment-method="cash"
                    data-payment-type="final"
                >

                    Paid with Cash

                </button>

            </div>

        `;

    }


    /* =====================================================
       DEPOSIT
    ===================================================== */

    if (
        !depositPaid
    ) {

        paymentActions.innerHTML = `

            <div class="payment-action-label">

                Record Deposit Payment

            </div>


            <div class="payment-button-row">

                <button
                    type="button"
                    class="button"
                    data-payment-method="venmo"
                    data-payment-type="deposit"
                >

                    Deposit Paid with Venmo

                </button>


                <button
                    type="button"
                    class="button"
                    data-payment-method="cash"
                    data-payment-type="deposit"
                >

                    Deposit Paid with Cash

                </button>

            </div>


            <div class="payment-action-label payment-full-label">

                Or record the entire reservation as paid in full

            </div>


            <div class="payment-button-row">

                <button
                    type="button"
                    class="button"
                    data-payment-method="venmo"
                    data-payment-type="full"
                >

                    Paid in Full with Venmo

                </button>


                <button
                    type="button"
                    class="button"
                    data-payment-method="cash"
                    data-payment-type="full"
                >

                    Paid in Full with Cash

                </button>

            </div>

        `;

    }


    /* =====================================================
       PAYMENT BUTTONS
    ===================================================== */

    const paymentButtons =
        paymentActions.querySelectorAll(
            "[data-payment-method]"
        );


    paymentButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                async function(event) {

                    event.stopPropagation();


                    const method =
                        button.dataset.paymentMethod;


                    const paymentType =
                        button.dataset.paymentType;


                    if (
                        !method ||
                        !paymentType
                    ) {

                        return;

                    }


                    let confirmationMessage =
                        "";


                    if (
                        paymentType === "deposit"
                    ) {

                        confirmationMessage =
                            "Record the $" +
                            Number(
                                reservation.deposit_due || 0
                            ).toFixed(2) +
                            " deposit as paid with " +
                            paymentMethodName(
                                method
                            ) +
                            "?";

                    }


                    else if (
                        paymentType === "final"
                    ) {

                        confirmationMessage =
                            "Record the $" +
                            remainingBalance.toFixed(2) +
                            " final balance as paid with " +
                            paymentMethodName(
                                method
                            ) +
                            "?";

                    }


                    else if (
                        paymentType === "full"
                    ) {

                        confirmationMessage =
                            "Record this reservation as paid in full with " +
                            paymentMethodName(
                                method
                            ) +
                            "?";

                    }


                    const confirmed =
                        confirm(
                            confirmationMessage
                        );


                    if (!confirmed) {

                        return;

                    }


                    paymentButtons.forEach(
                        function(item) {

                            item.disabled =
                                true;

                        }
                    );


                    button.textContent =
                        "Saving...";


                    if (paymentMessage) {

                        paymentMessage.textContent =
                            "";

                    }


                    try {

                        const now =
                            new Date().toISOString();


                        const updates = {

                            reservation_id:
                                reservation.id

                        };


                        /* ---------------------------------
                           DEPOSIT
                        --------------------------------- */

                        if (
                            paymentType === "deposit"
                        ) {

                            updates.deposit_payment_method =
                                method;


                            updates.deposit_paid_at =
                                now;

                        }


                        /* ---------------------------------
                           FINAL BALANCE
                        --------------------------------- */

                        if (
                            paymentType === "final"
                        ) {

                            updates.remaining_balance =
                                0;


                            updates.final_payment_paid_at =
                                now;


                            updates.final_payment_method =
                                method;

                        }


                        /* ---------------------------------
                           PAID IN FULL
                        --------------------------------- */

                        if (
                            paymentType === "full"
                        ) {

                            updates.deposit_payment_method =
                                method;


                            updates.deposit_paid_at =
                                now;


                            updates.remaining_balance =
                                0;


                            updates.final_payment_paid_at =
                                now;


                            updates.final_payment_method =
                                method;

                        }


                        await adminRequest(
                            "admin-update-reservation",
                            {
                                body:
                                    updates
                            }
                        );


                        if (paymentMessage) {

                            paymentMessage.textContent =
                                "Payment recorded successfully.";

                        }


                        setTimeout(
                            function() {

                                loadReservations();

                            },
                            500
                        );

                    }

                    catch (error) {

                        console.error(
                            "Record payment error:",
                            error
                        );


                        if (paymentMessage) {

                            paymentMessage.textContent =
                                error.message ||
                                "Could not record payment.";

                        }


                        paymentButtons.forEach(
                            function(item) {

                                item.disabled =
                                    false;

                            }
                        );


                        button.textContent =
                            paymentType === "deposit"
                                ? "Deposit Paid with " +
                                  paymentMethodName(
                                      method
                                  )
                                : paymentType === "final"
                                    ? "Paid with " +
                                      paymentMethodName(
                                          method
                                      )
                                    : "Paid in Full with " +
                                      paymentMethodName(
                                          method
                                      );

                    }

                }
            );

        }
    );

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


            if (
                !updatedData.reservation_date ||
                !updatedData.reservation_time ||
                !updatedData.location ||
                !updatedData.number_of_guests ||
                updatedData.number_of_guests < 1
            ) {

                if (editMessage) {

                    editMessage.textContent =
                        "Please complete the required reservation information.";

                }

                return;

            }


            if (editMessage) {

                editMessage.textContent =
                    "Saving changes...";

            }


            try {

                await adminRequest(
                    "admin-update-reservation",
                    {
                        body:
                            updatedData
                    }
                );


                if (editMessage) {

                    editMessage.textContent =
                        "Reservation saved.";

                }


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


                if (editMessage) {

                    editMessage.textContent =
                        error.message ||
                        "Could not save reservation.";

                }

            }

        }
    );

}


/* =========================================================
   RESERVATION STATUS DISPLAY
   ========================================================= */

function formatReservationStatus(
    status
) {

    if (!status) {

        return "";

    }


    const normalized =
        String(
            status
        ).toLowerCase();


    if (
        normalized ===
        "awaiting_confirmation"
    ) {

        return "Awaiting Approval";

    }


    if (
        normalized ===
        "approved"
    ) {

        return "Approved";

    }


    if (
        normalized ===
        "confirmed"
    ) {

        return "Confirmed";

    }


    if (
        normalized ===
        "declined"
    ) {

        return "Declined";

    }


    if (
        normalized ===
        "cancelled" ||
        normalized ===
        "canceled"
    ) {

        return "Cancelled";

    }


    return String(
        status
    )

        .replace(
            /_/g,
            " "
        )

        .replace(
            /\b\w/g,
            function(letter) {

                return letter.toUpperCase();

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