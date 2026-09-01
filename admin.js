/* =========================================================
   PART OF THE PLOT
   Admin Authentication
   Shared by admin.html and admin-dashboard.html
   ========================================================= */

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


export const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   SUPABASE URL
   ========================================================= */

export {
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
};


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

const loginForm =
    document.getElementById(
        "admin-login-form"
    );


if (loginForm) {

    initializeLogin();

}


/* =========================================================
   LOGIN
   ========================================================= */

async function initializeLogin() {

    const message =
        document.getElementById(
            "admin-message"
        );


    /* -----------------------------------------------------
       CHECK EXISTING SESSION
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
                )?.value.trim();


            const password =
                document.getElementById(
                    "admin-password"
                )?.value;


            if (!email || !password) {

                if (message) {

                    message.textContent =
                        "Please enter your email address and password.";

                }

                return;

            }


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
   REQUIRE LOGIN
   =========================================================

   Used by admin-dashboard.js.

   Returns the current session if logged in.

   Redirects to admin.html if not logged in.
   ========================================================= */

export async function requireAdminSession() {

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

            return null;

        }


        return session;

    }

    catch (error) {

        console.error(
            "Could not verify admin session:",
            error
        );


        window.location.href =
            "admin.html";

        return null;

    }

}


/* =========================================================
   LOG OUT
   ========================================================= */

export async function logoutAdmin() {

    try {

        await supabase.auth.signOut();

    }

    catch (error) {

        console.error(
            "Admin logout error:",
            error
        );

    }


    window.location.href =
        "admin.html";

}


/* =========================================================
   AUTHENTICATED EDGE FUNCTION REQUEST
   =========================================================

   This keeps all of the repeated fetch authentication
   code in ONE place.

   Example:

   const result = await adminRequest(
       "admin-approve-reservation",
       {
           reservation_id: reservation.id
       }
   );

   ========================================================= */

export async function adminRequest(
    functionName,
    options = {}
) {

    const session =
        await requireAdminSession();


    if (!session) {

        throw new Error(
            "Your admin session has expired."
        );

    }


    const method =
        options.method ||
        "POST";


    const headers = {

        "Authorization":
            "Bearer " +
            session.access_token,

        "apikey":
            SUPABASE_PUBLISHABLE_KEY,

        "Accept":
            "application/json"

    };


    if (
        options.body !== undefined
    ) {

        headers[
            "Content-Type"
        ] =
            "application/json";

    }


    const response =
        await fetch(

            SUPABASE_URL +
            "/functions/v1/" +
            functionName,

            {

                method:
                    method,

                headers:
                    headers,

                body:
                    options.body !== undefined
                        ? JSON.stringify(
                            options.body
                        )
                        : undefined

            }

        );


    let result;


    try {

        result =
            await response.json();

    }

    catch (error) {

        throw new Error(
            "The server returned an invalid response."
        );

    }


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.error ||
            "The request could not be completed."
        );

    }


    return result;

}