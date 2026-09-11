/* =========================================================
   PART OF THE PLOT
   CONFIRM & PAY PAGE
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const CONFIRM_RESERVATION_URL =
    "https://fqcabbpvevtlzzwsvezi.supabase.co/functions/v1/confirm-reservation";


const CREATE_STRIPE_CHECKOUT_URL =
    "https://fqcabbpvevtlzzwsvezi.supabase.co/functions/v1/create-stripe-checkout";


/* =========================================================
   PAGE ELEMENTS
   ========================================================= */

const loadingMessage =
    document.getElementById("loading-message");


const reservationSummary =
    document.getElementById("reservation-summary");


const confirmationBox =
    document.getElementById("confirmation-box");


const confirmationForm =
    document.getElementById("confirmation-form");


const confirmationMessage =
    document.getElementById("confirmation-message");


const paymentSection =
    document.getElementById("payment-section");


const paymentStatus =
    document.getElementById("payment-status");


const paymentStatusHeading =
    document.getElementById("payment-status-heading");


const paymentStatusMessage =
    document.getElementById("payment-status-message");


const stripePaymentButton =
    document.getElementById("stripe-payment-button");


const venmoPaymentButton =
    document.getElementById("venmo-payment-button");


const cashPaymentButton =
    document.getElementById("cash-payment-button");


const finalBalanceDisplay =
    document.getElementById("final-balance-display");


const displayRemaining =
    document.getElementById("display-remaining");


const reservationStatusText =
    document.getElementById("reservation-status-text");


const paidInFullMessage =
    document.getElementById("paid-in-full-message");


/*
 * Tracks whether the required agreements have already
 * been accepted for the reservation currently loaded.
 */

let agreementsAlreadyAccepted = false;


/*
 * Tracks whether the reservation is already confirmed
 * and the payment button should therefore pay the
 * remaining balance rather than a deposit.
 */

let confirmedPaymentMode = false;


/* =========================================================
   GET URL PARAMETERS
   ========================================================= */

function getUrlParameter(name) {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get(name);

}


/* =========================================================
   GET CONFIRMATION TOKEN
   ========================================================= */

function getConfirmationToken() {

    return getUrlParameter("token");

}


/* =========================================================
   GET PAYMENT RESULT
   ========================================================= */

function getPaymentResult() {

    return getUrlParameter("payment");

}


/* =========================================================
   GET PAYMENT MODE
   ========================================================= */

function getPaymentMode() {

    const type =
        getUrlParameter("type");


    if (type === "balance") {

        return "balance";

    }


    return "initial";

}


/* =========================================================
   CHECK WHETHER PAGE IS IN FINAL BALANCE MODE
   ========================================================= */

function isBalanceMode() {

    return (
        getPaymentMode() ===
        "balance"
    );

}


/* =========================================================
   GET SELECTED PAYMENT TYPE
   ========================================================= */

function getSelectedPaymentType() {

    /*
     * A confirmed reservation or a page specifically
     * opened for final payment must always use
     * the balance payment type.
     */

    if (
        isBalanceMode() ||
        confirmedPaymentMode
    ) {

        return "balance";

    }


    const selectedPayment =
        document.querySelector(
            'input[name="payment_amount"]:checked'
        );


    if (
        selectedPayment &&
        selectedPayment.value === "full"
    ) {

        return "full";

    }


    return "deposit";

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {

        return "—";

    }


    const value =
        String(dateValue).trim();


    if (!value) {

        return "—";

    }


    const isoMatch =
        value.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (isoMatch) {

        const year =
            Number(isoMatch[1]);


        const month =
            Number(isoMatch[2]);


        const day =
            Number(isoMatch[3]);


        const date =
            new Date(
                year,
                month - 1,
                day
            );


        if (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        ) {

            return date.toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

        }


        return value;

    }


    const slashMatch =
        value.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (slashMatch) {

        const month =
            Number(slashMatch[1]);


        const day =
            Number(slashMatch[2]);


        const year =
            Number(slashMatch[3]);


        const date =
            new Date(
                year,
                month - 1,
                day
            );


        if (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        ) {

            return date.toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

        }


        return value;

    }


    const parsedDate =
        new Date(value);


    if (
        !Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return parsedDate.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    }


    return value;

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(timeValue) {

    if (!timeValue) {

        return "—";

    }


    const value =
        String(timeValue).trim();


    if (!value) {

        return "—";

    }


    const match =
        value.match(
            /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
        );


    if (match) {

        let hours =
            Number(match[1]);


        const minutes =
            Number(match[2]);


        if (
            hours >= 0 &&
            hours <= 23 &&
            minutes >= 0 &&
            minutes <= 59
        ) {

            const period =
                hours >= 12
                    ? "PM"
                    : "AM";


            const displayHour =
                hours % 12 || 12;


            return (
                displayHour +
                ":" +
                String(minutes).padStart(2, "0") +
                " " +
                period
            );

        }

    }


    return value;

}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(amount) {

    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {

        return "$0.00";

    }


    const number =
        Number(amount);


    if (Number.isNaN(number)) {

        return "$0.00";

    }


    return number.toLocaleString(
        "en-US",
        {
            style: "currency",
            currency: "USD"
        }
    );

}


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(
    elementId,
    value,
    fallback = "—"
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        element.textContent =
            fallback;

        return;

    }


    element.textContent =
        String(value);

}


/* =========================================================
   SET RESERVATION STATUS
   ========================================================= */

function setReservationStatus(
    status
) {

    if (!reservationStatusText) {

        return;

    }


    reservationStatusText.innerHTML =
        status;

}


/* =========================================================
   CHECK WHETHER A DATABASE VALUE MEANS "YES"
   ========================================================= */

function isAcceptedValue(value) {

    if (value === true) {

        return true;

    }


    if (value === false) {

        return false;

    }


    if (
        value === null ||
        value === undefined
    ) {

        return false;

    }


    const normalized =
        String(value)
            .trim()
            .toLowerCase();


    return (
        normalized === "yes" ||
        normalized === "true"
    );

}


/* =========================================================
   CHECK WHETHER ALL REQUIRED AGREEMENTS ARE ACCEPTED
   ========================================================= */

function reservationHasAcceptedAgreements(
    reservation
) {

    if (!reservation) {

        return false;

    }


    const clientAgreementAccepted =
        isAcceptedValue(
            reservation.client_agreement_accepted
        );


    const cancellationPolicyAccepted =
        isAcceptedValue(
            reservation.cancellation_policy_acknowledged
        );


    const reservationConfirmationAccepted =
        isAcceptedValue(
            reservation.reservation_confirmation
        );


    return (
        clientAgreementAccepted &&
        cancellationPolicyAccepted &&
        reservationConfirmationAccepted
    );

}


/* =========================================================
   DISPLAY RESERVATION
   ========================================================= */

function displayReservation(
    reservation
) {

    setText(
        "display-game",
        reservation.game
    );


    setText(
        "display-date",
        formatDate(
            reservation.reservation_date
        )
    );


    setText(
        "display-time",
        formatTime(
            reservation.reservation_time
        )
    );


    setText(
        "display-location",
        reservation.location
    );


    setText(
        "display-guests",
        reservation.number_of_guests
    );


    setText(
        "display-organizer",
        reservation.organizer_name
    );


    setText(
        "display-email",
        reservation.organizer_email
    );


    setText(
        "display-phone",
        reservation.organizer_phone
    );


    setText(
        "display-total",
        formatCurrency(
            reservation.total
        ) + " + tax"
    );


    setText(
        "display-deposit",
        formatCurrency(
            reservation.deposit_due
        ) + " + tax"
    );


    setText(
        "display-remaining",
        formatCurrency(
            reservation.remaining_balance
        ) + " + tax"
    );


    /*
     * Populate optional payment choice elements
     * if they exist.
     */

    const depositChoice =
        document.getElementById(
            "payment-deposit-choice"
        );


    const fullChoice =
        document.getElementById(
            "payment-full-choice"
        );


    if (depositChoice) {

        depositChoice.textContent =
            formatCurrency(
                reservation.deposit_due
            ) + " + tax";

    }


    if (fullChoice) {

        fullChoice.textContent =
            formatCurrency(
                reservation.total
            ) + " + tax";

    }

}


/* =========================================================
   DISPLAY FINAL BALANCE
   ========================================================= */

function displayFinalBalance(
    reservation
) {

    if (!reservation) {

        return;

    }


    const remainingBalance =
        Number(
            reservation.remaining_balance
        );


    if (
        !Number.isFinite(
            remainingBalance
        ) ||
        remainingBalance <= 0
    ) {

        if (finalBalanceDisplay) {

            finalBalanceDisplay.style.display =
                "none";

        }


        return;

    }


    if (displayRemaining) {

        displayRemaining.textContent =
            formatCurrency(
                remainingBalance
            ) + " + tax";

    }


    if (finalBalanceDisplay) {

        finalBalanceDisplay.style.display =
            "block";

    }

}


/* =========================================================
   HIDE INITIAL PAYMENT CHOICES
   ========================================================= */

function hideInitialPaymentChoices() {

    const paymentAmountChoice =
        document.querySelector(
            ".payment-amount-choice"
        );


    if (paymentAmountChoice) {

        paymentAmountChoice.style.display =
            "none";

    }

}


/* =========================================================
   SHOW INITIAL PAYMENT CHOICES
   ========================================================= */

function showInitialPaymentChoices() {

    const paymentAmountChoice =
        document.querySelector(
            ".payment-amount-choice"
        );


    if (paymentAmountChoice) {

        paymentAmountChoice.style.display =
            "block";

    }

}


/* =========================================================
   HIDE PAYMENT STATUS
   ========================================================= */

function hidePaymentStatus() {

    if (paymentStatus) {

        paymentStatus.style.display =
            "none";

    }

}


/* =========================================================
   HIDE FINAL BALANCE
   ========================================================= */

function hideFinalBalance() {

    if (finalBalanceDisplay) {

        finalBalanceDisplay.style.display =
            "none";

    }

}


/* =========================================================
   HIDE PAID-IN-FULL MESSAGE
   ========================================================= */

function hidePaidInFullMessage() {

    if (paidInFullMessage) {

        paidInFullMessage.style.display =
            "none";

    }

}


/* =========================================================
   SHOW PAID-IN-FULL MESSAGE
   ========================================================= */

function showPaidInFullState() {

    confirmedPaymentMode = true;


    setReservationStatus(
        "Paid in Full"
    );


    hidePaymentStatus();


    hideFinalBalance();


    hideInitialPaymentChoices();


    if (confirmationBox) {

        confirmationBox.style.display =
            "none";

    }


    if (paymentSection) {

        paymentSection.style.display =
            "none";

    }


    if (paidInFullMessage) {

        paidInFullMessage.innerHTML = `
            <h2>
                Paid in Full!
            </h2>

            <p>
                Your reservation is officially confirmed and
                your balance has been paid in full.
            </p>

            <p>
                Your reservation is now on the books with
                Part of the Plot.
            </p>

            <p>
                If you need to make a change to your reservation,
                please contact Part of the Plot.
            </p>
        `;


        paidInFullMessage.style.display =
            "block";

    }

}


/* =========================================================
   SHOW CONFIRMED / DEPOSIT PAID STATE
   ========================================================= */

function showConfirmedState(
    reservation
) {

    confirmedPaymentMode = true;


    setReservationStatus(
        "Confirmed - Your deposit has been paid, and your date has been reserved.<br>Full payment is due 7 days before your scheduled date."
    );


    hidePaymentStatus();


    hidePaidInFullMessage();


    if (confirmationBox) {

        confirmationBox.style.display =
            "none";

    }


    if (paymentSection) {

        paymentSection.style.display =
            "block";

    }


    hideInitialPaymentChoices();


    displayFinalBalance(
        reservation
    );


    /*
     * Change the payment heading.
     */

    const paymentHeading =
        document.getElementById(
            "payment-heading"
        );


    if (paymentHeading) {

        paymentHeading.textContent =
            "Final Balance";

    }


    /*
     * Change the Stripe description.
     */

    const stripeParagraph =
        document.querySelector(
            ".payment-option p"
        );


    if (stripeParagraph) {

        stripeParagraph.textContent =
            "Pay your remaining balance securely online using a credit or debit card.";

    }


    updatePaymentButtonText();

}


/* =========================================================
   SHOW APPROVED PAYMENT STATE
   ========================================================= */

function showApprovedPaymentState() {

    confirmedPaymentMode = false;


    setReservationStatus(
        "Approved - your chosen date is available. <br> A deposit is required to reserve it."
    );


    hidePaidInFullMessage();


    hidePaymentStatus();


    hideFinalBalance();


    if (paymentSection) {

        paymentSection.style.display =
            "block";

    }


    showInitialPaymentChoices();


    const paymentHeading =
        document.getElementById(
            "payment-heading"
        );


    if (paymentHeading) {

        paymentHeading.textContent =
            "Payment";

    }


    const stripeParagraph =
        document.querySelector(
            ".payment-option p"
        );


    if (stripeParagraph) {

        stripeParagraph.textContent =
            "Pay securely by credit or debit card through Stripe. Applicable sales tax is included in your payment total.";

    }


    updatePaymentButtonText();

}


/* =========================================================
   SHOW REVIEW / ACKNOWLEDGE STATE
   ========================================================= */

function showReviewState(
    reservation
) {

    confirmedPaymentMode = false;


    setReservationStatus(
        "Approved - your chosen date is available. <br> A deposit is required to reserve it."
    );


    hidePaidInFullMessage();


    hidePaymentStatus();


    hideFinalBalance();


    if (paymentSection) {

        paymentSection.style.display =
            "none";

    }


    if (confirmationBox) {

        confirmationBox.style.display =
            "block";

    }


    const organizerName =
        document.getElementById(
            "organizer-name"
        );


    const organizerEmail =
        document.getElementById(
            "organizer-email"
        );


    if (
        organizerName &&
        reservation.organizer_name
    ) {

        organizerName.value =
            reservation.organizer_name;

    }


    if (
        organizerEmail &&
        reservation.organizer_email
    ) {

        organizerEmail.value =
            reservation.organizer_email;

    }

}


/* =========================================================
   PREPARE FINAL BALANCE MODE
   ========================================================= */

function setupBalanceMode(
    reservation
) {

    if (!isBalanceMode()) {

        return;

    }


    confirmedPaymentMode = true;


    setReservationStatus(
        "Confirmed - Your deposit has been paid, and your date has been reserved.<br>Full payment is due 7 days before your scheduled date."
    );


    hidePaidInFullMessage();


    hidePaymentStatus();


    if (confirmationBox) {

        confirmationBox.style.display =
            "none";

    }


    if (paymentSection) {

        paymentSection.style.display =
            "block";

    }


    hideInitialPaymentChoices();


    displayFinalBalance(
        reservation
    );


    const paymentHeading =
        document.getElementById(
            "payment-heading"
        );


    if (paymentHeading) {

        paymentHeading.textContent =
            "Final Balance";

    }


    const stripeParagraph =
        document.querySelector(
            ".payment-option p"
        );


    if (stripeParagraph) {

        stripeParagraph.textContent =
            "Pay your remaining balance securely online using a credit or debit card.";

    }


    updatePaymentButtonText();

}


/* =========================================================
   UPDATE PAYMENT BUTTON TEXT
   ========================================================= */

function updatePaymentButtonText() {

    const paymentType =
        getSelectedPaymentType();


    /*
     * FINAL BALANCE
     */

    if (paymentType === "balance") {

        if (stripePaymentButton) {

            stripePaymentButton.textContent =
                "Pay Remaining Balance by Card";

        }


        if (venmoPaymentButton) {

            venmoPaymentButton.textContent =
                "Pay Final Balance with Venmo";

        }


        if (cashPaymentButton) {

            cashPaymentButton.textContent =
                "Pay Final Balance with Cash";

        }


        return;

    }


    /*
     * FULL PAYMENT
     */

    if (paymentType === "full") {

        if (stripePaymentButton) {

            stripePaymentButton.textContent =
                "Pay in Full by Card";

        }


        if (venmoPaymentButton) {

            venmoPaymentButton.textContent =
                "Pay in Full with Venmo";

        }


        if (cashPaymentButton) {

            cashPaymentButton.textContent =
                "Pay in Full with Cash";

        }


        return;

    }


    /*
     * DEPOSIT
     */

    if (stripePaymentButton) {

        stripePaymentButton.textContent =
            "Pay Deposit by Card";

    }


    if (venmoPaymentButton) {

        venmoPaymentButton.textContent =
            "Pay Deposit with Venmo";

    }


    if (cashPaymentButton) {

        cashPaymentButton.textContent =
            "Pay Deposit with Cash";

    }

}


/* =========================================================
   SHOW PAYMENT PROCESSING STATE
   ========================================================= */

function showPaymentProcessingState() {

    setReservationStatus(
        isBalanceMode() ||
        confirmedPaymentMode
            ? "Final Payment Processing"
            : "Payment Processing"
    );


    hidePaidInFullMessage();


    if (confirmationBox) {

        confirmationBox.style.display =
            "none";

    }


    if (paymentSection) {

        paymentSection.style.display =
            "block";

    }


    if (
        isBalanceMode() ||
        confirmedPaymentMode
    ) {

        hideInitialPaymentChoices();


        if (finalBalanceDisplay) {

            finalBalanceDisplay.style.display =
                "none";

        }


        const paymentHeading =
            document.getElementById(
                "payment-heading"
            );


        if (paymentHeading) {

            paymentHeading.textContent =
                "Payment Processing";

        }


        const stripeParagraph =
            document.querySelector(
                ".payment-option p"
            );


        if (stripeParagraph) {

            stripeParagraph.textContent =
                "Stripe has received your final balance payment. We are confirming your payment now.";

        }

    }
    else {

        showInitialPaymentChoices();


        const paymentHeading =
            document.getElementById(
                "payment-heading"
            );


        if (paymentHeading) {

            paymentHeading.textContent =
                "Payment Processing";

        }


        const stripeParagraph =
            document.querySelector(
                ".payment-option p"
            );


        if (stripeParagraph) {

            stripeParagraph.textContent =
                "Stripe has received your payment. We are confirming your reservation now.";

        }

    }


    if (stripePaymentButton) {

        stripePaymentButton.disabled =
            true;


        stripePaymentButton.textContent =
            "Payment Processing...";

    }

}


/* =========================================================
   CHECK WHETHER RESERVATION IS PAID IN FULL
   ========================================================= */

function reservationIsPaidInFull(
    reservation
) {

    if (!reservation) {

        return false;

    }


    if (
        reservation.final_payment_paid_at
    ) {

        return true;

    }


    const remainingBalance =
        Number(
            reservation.remaining_balance
        );


    return (
        Number.isFinite(remainingBalance) &&
        remainingBalance <= 0
    );

}


/* =========================================================
   CHECK PAYMENT STATUS
   ========================================================= */

async function checkPaymentStatus() {

    const token =
        getConfirmationToken();


    if (!token) {

        return null;

    }


    try {

        const response =
            await fetch(
                CONFIRM_RESERVATION_URL +
                "?token=" +
                encodeURIComponent(token)
            );


        let data = null;


        try {

            data =
                await response.json();

        }
        catch (jsonError) {

            data = null;

        }


        if (!response.ok) {

            return null;

        }


        return (
            data &&
            data.reservation
                ? data.reservation
                : data
        );

    }
    catch (error) {

        console.error(
            "Payment status check error:",
            error
        );


        return null;

    }

}


/* =========================================================
   WAIT FOR STRIPE WEBHOOK
   ========================================================= */

async function waitForPaymentConfirmation() {

    const maxAttempts =
        10;


    const delay =
        2000;


    for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt++
    ) {

        const reservation =
            await checkPaymentStatus();


        if (reservation) {

            displayReservation(
                reservation
            );


            /*
             * FINAL BALANCE PAYMENT
             */

            if (
                isBalanceMode() ||
                confirmedPaymentMode
            ) {

                if (
                    reservationIsPaidInFull(
                        reservation
                    )
                ) {

                    showPaidInFullState();

                    return true;

                }

            }
            else {

                /*
                 * INITIAL DEPOSIT / FULL PAYMENT
                 */

                if (
                    reservation.status ===
                    "confirmed" &&
                    reservation.deposit_paid_at
                ) {

                    if (
                        reservationIsPaidInFull(
                            reservation
                        )
                    ) {

                        showPaidInFullState();

                    }
                    else {

                        showConfirmedState(
                            reservation
                        );

                    }


                    return true;

                }

            }

        }


        if (
            attempt <
            maxAttempts - 1
        ) {

            await new Promise(
                function(resolve) {

                    setTimeout(
                        resolve,
                        delay
                    );

                }
            );

        }

    }


    /*
     * Payment was submitted but the webhook has
     * not completed yet.
     */

    setReservationStatus(
        isBalanceMode() ||
        confirmedPaymentMode
            ? "Final Payment Processing"
            : "Payment Processing"
    );


    if (paymentSection) {

        paymentSection.style.display =
            "block";

    }


    if (stripePaymentButton) {

        stripePaymentButton.disabled =
            true;


        stripePaymentButton.textContent =
            "Payment Submitted";

    }


    const paymentHeading =
        document.getElementById(
            "payment-heading"
        );


    if (paymentHeading) {

        paymentHeading.textContent =
            "Payment Submitted";

    }


    const stripeParagraph =
        document.querySelector(
            ".payment-option p"
        );


    if (stripeParagraph) {

        if (
            isBalanceMode() ||
            confirmedPaymentMode
        ) {

            stripeParagraph.textContent =
                "Your final payment has been submitted successfully. We are finalizing your payment now. You do not need to pay again. If your reservation does not show as paid in full shortly, please contact Part of the Plot.";

        }
        else {

            stripeParagraph.textContent =
                "Your payment has been submitted successfully. We are finalizing your reservation now. You do not need to pay again. If your reservation does not show as confirmed shortly, please contact Part of the Plot.";

        }

    }


    return false;

}


/* =========================================================
   LOAD RESERVATION
   ========================================================= */

async function loadReservation() {

    const token =
        getConfirmationToken();


    if (!token) {

        setReservationStatus(
            "Unavailable"
        );


        loadingMessage.innerHTML = `
            <h2>
                Reservation Link Invalid
            </h2>

            <p>
                This confirmation link is missing the reservation
                token. Please use the confirmation link from the
                email you received from Part of the Plot.
            </p>
        `;


        return;

    }


    try {

        const response =
            await fetch(
                CONFIRM_RESERVATION_URL +
                "?token=" +
                encodeURIComponent(token)
            );


        let data = null;


        try {

            data =
                await response.json();

        }
        catch (jsonError) {

            data = null;

        }


        if (!response.ok) {

            const errorMessage =
                data &&
                data.error
                    ? data.error
                    : "We were unable to retrieve your reservation.";


            throw new Error(
                errorMessage
            );

        }


        const reservation =
            data &&
            data.reservation
                ? data.reservation
                : data;


        if (!reservation) {

            throw new Error(
                "No reservation information was returned."
            );

        }


        /*
         * Determine whether the required agreements
         * have already been recorded.
         */

        agreementsAlreadyAccepted =
            reservationHasAcceptedAgreements(
                reservation
            );


        const tokenField =
            document.getElementById(
                "confirmation-token"
            );


        if (tokenField) {

            tokenField.value =
                token;

        }


        displayReservation(
            reservation
        );


        loadingMessage.style.display =
            "none";


        reservationSummary.style.display =
            "block";


        hidePaidInFullMessage();


        /* =================================================
           FINAL BALANCE MODE
           ================================================= */

        if (isBalanceMode()) {

            if (
                reservationIsPaidInFull(
                    reservation
                )
            ) {

                showPaidInFullState();

                return;

            }


            if (
                reservation.status ===
                "confirmed"
            ) {

                setupBalanceMode(
                    reservation
                );

                return;

            }


            setReservationStatus(
                "Unavailable"
            );


            confirmationBox.innerHTML = `
                <h2>
                    Final Payment Unavailable
                </h2>

                <p>
                    This reservation is not currently available
                    for final payment.
                </p>

                <p>
                    Please contact Part of the Plot if you believe
                    you received this message in error.
                </p>
            `;


            confirmationBox.style.display =
                "block";


            return;

        }


        /* =================================================
           CONFIRMED RESERVATION
           ================================================= */

        if (
            reservation.status ===
            "confirmed" &&
            reservation.deposit_paid_at
        ) {

            if (
                reservationIsPaidInFull(
                    reservation
                )
            ) {

                showPaidInFullState();

            }
            else {

                showConfirmedState(
                    reservation
                );

            }


            return;

        }


        /* =================================================
           PAYMENT RETURN
           ================================================= */

        const paymentResult =
            getPaymentResult();


        if (
            paymentResult ===
            "success"
        ) {

            agreementsAlreadyAccepted =
                true;


            if (confirmationBox) {

                confirmationBox.style.display =
                    "none";

            }


            showPaymentProcessingState();


            setTimeout(
                function() {

                    waitForPaymentConfirmation();

                },
                1000
            );


            return;

        }


        if (
            paymentResult ===
            "cancelled"
        ) {

            setReservationStatus(
                "Approved - your chosen date is available. <br> A deposit is required to reserve it."
            );


            showApprovedPaymentState();


            /*
             * If the agreements have already been accepted,
             * keep the review form hidden.
             */

            if (agreementsAlreadyAccepted) {

                if (confirmationBox) {

                    confirmationBox.style.display =
                        "none";

                }


                const stripeParagraph =
                    document.querySelector(
                        ".payment-option p"
                    );


                if (stripeParagraph) {

                    stripeParagraph.textContent =
                        "Your reservation is still being held for you. The card payment was cancelled, so your payment has not yet been received.";

                }

            }


            return;

        }


        /* =================================================
           DEPOSIT ALREADY RECORDED
           ================================================= */

        if (
            reservation.deposit_paid_at
        ) {

            if (
                reservation.status ===
                "confirmed"
            ) {

                if (
                    reservationIsPaidInFull(
                        reservation
                    )
                ) {

                    showPaidInFullState();

                }
                else {

                    showConfirmedState(
                        reservation
                    );

                }


                return;

            }


            agreementsAlreadyAccepted =
                true;


            showPaymentProcessingState();

            waitForPaymentConfirmation();

            return;

        }


        /* =================================================
           RESERVATION APPROVED
           ================================================= */

        if (
            reservation.status ===
            "approved"
        ) {

            if (
                agreementsAlreadyAccepted
            ) {

                if (confirmationBox) {

                    confirmationBox.style.display =
                        "none";

                }


                showApprovedPaymentState();

                return;

            }


            showReviewState(
                reservation
            );


            return;

        }


        /* =================================================
           UNEXPECTED STATUS
           ================================================= */

        setReservationStatus(
            "Unavailable"
        );


        confirmationBox.innerHTML = `
            <h2>
                Reservation Unavailable
            </h2>

            <p>
                This reservation is not currently available
                for confirmation.
            </p>

            <p>
                Please contact Part of the Plot if you believe
                you received this message in error.
            </p>
        `;


        confirmationBox.style.display =
            "block";

    }
    catch (error) {

        console.error(
            "Reservation loading error:",
            error
        );


        setReservationStatus(
            "Unavailable"
        );


        loadingMessage.innerHTML = `
            <h2>
                Unable to Load Reservation
            </h2>

            <p>
                ${escapeHtml(
                    error.message ||
                    "We were unable to retrieve your reservation."
                )}
            </p>

            <p>
                Please make sure you are using the complete
                confirmation link from your email. If the problem
                continues, please contact Part of the Plot.
            </p>
        `;

    }

}


/* =========================================================
   PAYMENT AMOUNT RADIO BUTTONS
   ========================================================= */

document
    .querySelectorAll(
        'input[name="payment_amount"]'
    )
    .forEach(
        function(radio) {

            radio.addEventListener(
                "change",
                function() {

                    updatePaymentButtonText();

                }
            );

        }
    );


/* =========================================================
   ACCEPT RESERVATION
   ========================================================= */

if (confirmationForm) {

    confirmationForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const confirmButton =
                document.getElementById(
                    "confirm-button"
                );


            const agreementAcknowledgment =
                document.getElementById(
                    "agreement-acknowledgment"
                );


            const cancellationAcknowledgment =
                document.getElementById(
                    "cancellation-acknowledgment"
                );


            const responsibilitiesAcknowledgment =
                document.getElementById(
                    "responsibilities-acknowledgment"
                );


            /*
             * Validate all three required checkboxes.
             */

            if (
                !agreementAcknowledgment ||
                !agreementAcknowledgment.checked ||
                !cancellationAcknowledgment ||
                !cancellationAcknowledgment.checked ||
                !responsibilitiesAcknowledgment ||
                !responsibilitiesAcknowledgment.checked
            ) {

                confirmationMessage.style.display =
                    "block";


                confirmationMessage.innerHTML = `
                    <p>
                        Please complete all three required
                        confirmations before continuing to payment.
                    </p>
                `;


                return;

            }


            /*
             * Build the payload expected by the
             * confirmation Edge Function.
             */

            const payload = {

                confirmation_token:
                    document.getElementById(
                        "confirmation-token"
                    ).value,

                organizer_name:
                    document.getElementById(
                        "organizer-name"
                    ).value,

                organizer_email:
                    document.getElementById(
                        "organizer-email"
                    ).value,

                client_agreement_acknowledged:
                    "Yes",

                cancellation_policy_acknowledged:
                    "Yes",

                reservation_confirmation:
                    "Yes"

            };


            confirmButton.disabled =
                true;


            confirmButton.textContent =
                "Submitting...";


            confirmationMessage.style.display =
                "none";


            try {

                const response =
                    await fetch(
                        CONFIRM_RESERVATION_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                let data = null;


                try {

                    data =
                        await response.json();

                }
                catch (jsonError) {

                    data = null;

                }


                if (!response.ok) {

                    const errorMessage =
                        data &&
                        data.error
                            ? data.error
                            : "We were unable to accept your reservation.";


                    throw new Error(
                        errorMessage
                    );

                }


                agreementsAlreadyAccepted =
                    true;


                confirmationForm.style.display =
                    "none";


                confirmationMessage.style.display =
                    "block";


                confirmationMessage.innerHTML = `
                    <h3>
                        Reservation Approved!
                    </h3>

                    <p>
                        Thank you! Your reservation has been approved
                        and is being held for you.
                    </p>

                    <p>
                        Your reservation will be officially confirmed
                        once your required deposit has been received.
                    </p>
                `;


                setReservationStatus(
					"Approved - your chosen date is available. <br> A deposit is required to reserve it."
                );


                hidePaymentStatus();


                hideFinalBalance();


                paymentSection.style.display =
                    "block";


                showInitialPaymentChoices();


                const paymentHeading =
                    document.getElementById(
                        "payment-heading"
                    );


                if (paymentHeading) {

                    paymentHeading.textContent =
                        "Payment";

                }


                const stripeParagraph =
                    document.querySelector(
                        ".payment-option p"
                    );


                if (stripeParagraph) {

                    stripeParagraph.textContent =
                        "Pay securely by credit or debit card through Stripe. Applicable sales tax is included in your payment total.";

                }


                updatePaymentButtonText();


                setTimeout(
                    function() {

                        paymentSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    },
                    150
                );

            }


            catch (error) {

                console.error(
                    "Reservation acceptance error:",
                    error
                );


                confirmationMessage.style.display =
                    "block";


                confirmationMessage.innerHTML = `
                    <p>
                        ${escapeHtml(
                            error.message ||
                            "We were unable to accept your reservation."
                        )}
                    </p>

                    <p>
                        Please try again. If the problem continues,
                        please contact Part of the Plot.
                    </p>
                `;


                confirmButton.disabled =
                    false;


                confirmButton.textContent =
                    "Continue to Payment";

            }

        }
    );

}


/* =========================================================
   STRIPE PAYMENT
   ========================================================= */

if (stripePaymentButton) {

    stripePaymentButton.addEventListener(
        "click",
        async function() {

            const token =
                getConfirmationToken();


            if (!token) {

                alert(
                    "We could not identify your reservation. Please return to the confirmation link from your email and try again."
                );


                return;

            }


            const paymentType =
                getSelectedPaymentType();


            stripePaymentButton.disabled =
                true;


            stripePaymentButton.textContent =
                "Preparing Secure Payment...";


            try {

                const response =
                    await fetch(
                        CREATE_STRIPE_CHECKOUT_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    confirmation_token:
                                        token,

                                    payment_type:
                                        paymentType

                                })
                        }
                    );


                let data = null;


                try {

                    data =
                        await response.json();

                }
                catch (jsonError) {

                    data = null;

                }


                if (!response.ok) {

                    const errorMessage =
                        data &&
                        data.error
                            ? data.error
                            : "We were unable to prepare your payment.";


                    throw new Error(
                        errorMessage
                    );

                }


                if (
                    !data ||
                    !data.checkout_url
                ) {

                    throw new Error(
                        "Stripe did not return a payment link."
                    );

                }


                window.location.href =
                    data.checkout_url;

            }


            catch (error) {

                console.error(
                    "Stripe Checkout error:",
                    error
                );


                alert(
                    error.message ||
                    "We were unable to start the card payment. Please try again."
                );


                stripePaymentButton.disabled =
                    false;


                updatePaymentButtonText();

            }

        }
    );

}


/* =========================================================
   VENMO PAYMENT
   ========================================================= */

/*
 * Retained for possible future reuse.
 */

if (venmoPaymentButton) {

    venmoPaymentButton.addEventListener(
        "click",
        function() {

            const paymentType =
                getSelectedPaymentType();


            if (
                paymentType ===
                "balance"
            ) {

                alert(
                    "Venmo payment instructions for your final balance will be provided by Part of the Plot."
                );


                return;

            }


            if (
                paymentType ===
                "full"
            ) {

                alert(
                    "Venmo payment instructions for paying your reservation in full will be provided by Part of the Plot."
                );


                return;

            }


            alert(
                "Venmo payment instructions for your required deposit will be provided by Part of the Plot."
            );

        }
    );

}


/* =========================================================
   CASH PAYMENT
   ========================================================= */

/*
 * Retained for possible future reuse.
 */

if (cashPaymentButton) {

    cashPaymentButton.addEventListener(
        "click",
        function() {

            const paymentType =
                getSelectedPaymentType();


            if (
                paymentType ===
                "balance"
            ) {

                alert(
                    "Please contact Part of the Plot to arrange payment of your final balance in cash."
                );


                return;

            }


            if (
                paymentType ===
                "full"
            ) {

                alert(
                    "Please contact Part of the Plot to arrange payment of your reservation in full."
                );


                return;

            }


            alert(
                "Please contact Part of the Plot to arrange payment of your required deposit."
            );

        }
    );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setReservationStatus(
            "Loading..."
        );


        updatePaymentButtonText();


        loadReservation();

    }
);