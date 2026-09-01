/* =========================================================
   PART OF THE PLOT
   supabase.js

   Supabase configuration and game/pricing data.

   Contains:
   - Supabase connection
   - Supabase request helper
   - Game data
   - Load games
   - Get game records
   - Get game prices
   - Display game prices

   Does NOT contain:
   - Header/footer
   - Navigation
   - FAQ
   - Animations
   - Scheduling modal
   - Reservation submission
   ========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
   ========================================================= */

const SUPABASE_URL =
    "https://fqcabbpvevtlzzwsvezi.supabase.co";


const SUPABASE_ANON_KEY =
    "sb_publishable_5FNoD9eo9A29lEjvsSKgkQ_sZdRqXQ7";


/* =========================================================
   SUPABASE HELPER
   ========================================================= */

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


    const text =
        await response.text();


    if (!text) {
        return null;
    }


    return JSON.parse(text);
}


/* =========================================================
   GAME DATA
   ========================================================= */

let AVAILABLE_GAMES = [];


/* =========================================================
   LOAD GAMES FROM SUPABASE
   ========================================================= */

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


/* =========================================================
   GET GAME RECORD
   ========================================================= */

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


/* =========================================================
   GET GAME PRICE
   ========================================================= */

async function getGamePrice(
    gameName,
    numberOfPlayers = null
) {

    /*
     * Make sure games are loaded.
     */

    if (
        AVAILABLE_GAMES.length === 0
    ) {

        await loadGamesFromSupabase();
    }


    const gameRecord =
        getGameRecord(
            gameName
        );


    if (!gameRecord) {

        return null;
    }


    /*
     * Get the current price stage.
     */

    const currentStage =
        gameRecord.current_price_stage;


    /*
     * Load all active prices for this game.
     *
     * We intentionally do not filter by
     * price stage in the initial query.
     * This allows the function to gracefully
     * handle a missing or mismatched stage.
     */

    let endpoint =
        "/rest/v1/game_prices" +
        "?select=id,game_id,price_stage,price,active,starts_at,ends_at,minimum_players,maximum_players" +
        `&game_id=eq.${encodeURIComponent(gameRecord.id)}` +
        "&active=eq.true";


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


        /* =================================================
           CURRENT DATE
           ================================================= */

        const now =
            new Date();


        /* =================================================
           FILTER BY DATE
           ================================================= */

        let validPrices =
            prices.filter(
                priceRecord => {

                    if (
                        priceRecord.starts_at &&
                        new Date(
                            priceRecord.starts_at
                        ) > now
                    ) {

                        return false;
                    }


                    if (
                        priceRecord.ends_at &&
                        new Date(
                            priceRecord.ends_at
                        ) < now
                    ) {

                        return false;
                    }


                    return true;
                }
            );


        if (
            validPrices.length === 0
        ) {

            return null;
        }


        /* =================================================
           FILTER BY CURRENT PRICE STAGE
           ================================================= */

        if (currentStage) {

            const stagePrices =
                validPrices.filter(
                    priceRecord =>
                        priceRecord.price_stage ===
                        currentStage
                );


            if (
                stagePrices.length > 0
            ) {

                validPrices =
                    stagePrices;
            }

            /*
             * If no price matches the current stage,
             * continue using the valid active price
             * when there is only one available.
             */

            else if (
                validPrices.length > 1
            ) {

                return null;
            }
        }


        /* =================================================
           PLAYER-BASED PRICING
           ================================================= */

        if (
            gameRecord.pricing_type ===
            "player_based"
        ) {

            if (
                numberOfPlayers === null ||
                numberOfPlayers === undefined ||
                numberOfPlayers === ""
            ) {

                return null;
            }


            const players =
                Number(
                    numberOfPlayers
                );


            if (
                !Number.isInteger(
                    players
                )
            ) {

                return null;
            }


            validPrices =
                validPrices.filter(
                    priceRecord => {

                        const minimum =
                            priceRecord.minimum_players;


                        const maximum =
                            priceRecord.maximum_players;


                        return (

                            (
                                minimum === null ||
                                players >=
                                    Number(
                                        minimum
                                    )
                            )

                            &&

                            (
                                maximum === null ||
                                players <=
                                    Number(
                                        maximum
                                    )
                            )

                        );
                    }
                );
        }


        /* =================================================
           FIXED PRICING
           ================================================= */

        else if (
            gameRecord.pricing_type ===
            "fixed"
        ) {

            /*
             * Prefer fixed-price records that
             * do not have a player range.
             */

            const fixedPrices =
                validPrices.filter(
                    priceRecord =>
                        priceRecord.minimum_players === null &&
                        priceRecord.maximum_players === null
                );


            if (
                fixedPrices.length > 0
            ) {

                validPrices =
                    fixedPrices;
            }
        }


        /* =================================================
           UNKNOWN PRICING TYPE
           ================================================= */

        else {

            return null;
        }


        /* =================================================
           NO MATCHING PRICE
           ================================================= */

        if (
            validPrices.length === 0
        ) {

            return null;
        }


        /* =================================================
           CHOOSE MOST SPECIFIC PRICE
           ================================================= */

        validPrices.sort(
            (
                a,
                b
            ) => {

                const aMinimum =
                    a.minimum_players === null
                        ? -1
                        : Number(
                            a.minimum_players
                        );


                const bMinimum =
                    b.minimum_players === null
                        ? -1
                        : Number(
                            b.minimum_players
                        );


                return (
                    bMinimum -
                    aMinimum
                );
            }
        );


        const priceRecord =
            validPrices[0];


        const price =
            Number(
                priceRecord.price
            );


        if (
            Number.isNaN(
                price
            )
        ) {

            return null;
        }


        /* =================================================
           RETURN PRICE DATA
           ================================================= */

        return {

            price:
                price,

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


/* =========================================================
   DISPLAY GAME PRICES
   ========================================================= */

/*
 * Finds price elements on the page and fills them
 * with the current Supabase price.
 *
 * Supported elements:
 *
 *     .game-price
 *     .spellbound-price-amount
 *
 * Each element must have:
 *
 *     data-game="Game Name"
 *
 * For player-based pricing, it may also have:
 *
 *     data-players="13"
 */

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


    /*
     * Make sure games are loaded.
     */

    if (
        AVAILABLE_GAMES.length === 0
    ) {

        await loadGamesFromSupabase();
    }


    /*
     * Process every price element.
     */

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

            continue;
        }


        /*
         * Display the price.
         */

        element.textContent =
            "$" +
            priceData.price.toLocaleString(
                "en-US",
                {
                    minimumFractionDigits:
                        0,

                    maximumFractionDigits:
                        2
                }
            );
    }
}


/* =========================================================
   AUTO-INITIALIZE GAME PRICES
   ========================================================= */

function initializeSupabasePrices() {

    initializeGamePrices()
        .catch(
            error => {

                console.error(
                    "Game price initialization error:",
                    error
                );

            }
        );
}


/*
 * Wait for the page HTML.
 */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSupabasePrices,
        {
            once: true
        }
    );

}

else {

    initializeSupabasePrices();

}