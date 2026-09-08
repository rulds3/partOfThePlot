/* =========================================================
   PART OF THE PLOT
   A DEAD MAN'S CHEST
   ADMIN CREW RESULTS
   ========================================================= */

import {
    createClient
} from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

import {
    requireAdminSession,
    logoutAdmin
} from "../../admin.js";


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
   CONSTANTS
========================================================= */

const GAME_NAME =
    "A Dead Man's Chest";


const STORAGE_KEY =
    "partOfThePlot_deadMansChest_votes";


/* =========================================================
   ELEMENTS
========================================================= */

const voteList =
    document.getElementById(
        "vote-list"
    );


const voteCount =
    document.getElementById(
        "vote-count"
    );


const calculateButton =
    document.getElementById(
        "calculate-button"
    );


const clearButton =
    document.getElementById(
        "clear-button"
    );


const results =
    document.getElementById(
        "results"
    );


const message =
    document.getElementById(
        "admin-message"
    );


const logoutButton =
    document.getElementById(
        "logout-button"
    );


/* =========================================================
   STATE
========================================================= */

let characters = [];

let savedVotes = {};


/* =========================================================
   INITIALIZE
========================================================= */

initialize();


async function initialize() {

    const session =
        await requireAdminSession();

    if (!session) {
        return;
    }


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


    loadSavedVotes();

    await loadCharacters();

}


/* =========================================================
   LOAD CHARACTERS
========================================================= */

async function loadCharacters() {

    try {

        message.textContent =
            "Loading characters...";


        const {
            data,
            error
        } =
            await supabase
                .from("game_characters")
                .select(
                    "id, character_name"
                )
                .eq(
                    "game",
                    GAME_NAME
                )
                .eq(
                    "active",
                    true
                )
                .order(
                    "character_name",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        characters =
            data || [];


        /*
         * Remove saved votes for characters
         * that are no longer in the active list.
         */

        cleanSavedVotes();


        renderVoteList();

        updateVoteCount();


        message.textContent =
            "";


    }
    catch (error) {

        console.error(
            "Could not load characters:",
            error
        );


        message.textContent =
            "Could not load the characters. Please try again.";

    }

}


/* =========================================================
   LOAD SAVED VOTES
========================================================= */

function loadSavedVotes() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            savedVotes = {};

            return;

        }


        savedVotes =
            JSON.parse(saved);


        if (
            !savedVotes ||
            typeof savedVotes !== "object"
        ) {

            savedVotes = {};

        }

    }
    catch (error) {

        console.error(
            "Could not load saved votes:",
            error
        );

        savedVotes = {};

    }

}


/* =========================================================
   CLEAN SAVED VOTES
========================================================= */

function cleanSavedVotes() {

    const validIds =
        new Set(
            characters.map(
                character =>
                    character.id
            )
        );


    const cleanedVotes = {};


    Object.entries(
        savedVotes
    ).forEach(
        function([voterId, targetId]) {

            if (
                validIds.has(voterId) &&
                validIds.has(targetId)
            ) {

                cleanedVotes[voterId] =
                    targetId;

            }

        }
    );


    savedVotes =
        cleanedVotes;


    saveVotes();

}


/* =========================================================
   SAVE VOTES
========================================================= */

function saveVotes() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedVotes)
    );

}


/* =========================================================
   RENDER VOTE LIST
========================================================= */

function renderVoteList() {

    voteList.innerHTML =
        "";


    if (
        characters.length === 0
    ) {

        voteList.innerHTML = `
            <div class="vote-empty">
                No active characters were found.
            </div>
        `;

        return;

    }


    characters.forEach(
        function(character) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "vote-row";


            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "vote-character";


            name.textContent =
                character.character_name;


            const select =
                document.createElement(
                    "select"
                );


            select.className =
                "vote-select";


            select.dataset.voterId =
                character.id;


            /*
             * No Vote is the default.
             * This means the character is not playing.
             */

            const noVoteOption =
                document.createElement(
                    "option"
                );


            noVoteOption.value =
                "";


            noVoteOption.textContent =
                "No Vote";


            select.appendChild(
                noVoteOption
            );


            /*
             * Every active character is available,
             * including the voter themselves.
             */

            characters.forEach(
                function(candidate) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        candidate.id;


                    option.textContent =
                        candidate.character_name;


                    select.appendChild(
                        option
                    );

                }
            );


            /*
             * Restore saved vote.
             */

            if (
                savedVotes[
                    character.id
                ]
            ) {

                select.value =
                    savedVotes[
                        character.id
                    ];

            }


            select.addEventListener(
                "change",
                function() {

                    if (
                        select.value
                    ) {

                        savedVotes[
                            character.id
                        ] =
                            select.value;

                    }
                    else {

                        delete savedVotes[
                            character.id
                        ];

                    }


                    saveVotes();

                    updateVoteCount();


                    /*
                     * Results are no longer current
                     * after a vote changes.
                     */

                    results.hidden =
                        true;

                    message.textContent =
                        "";

                }
            );


            row.appendChild(
                name
            );


            row.appendChild(
                select
            );


            voteList.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   UPDATE VOTE COUNT
========================================================= */

function updateVoteCount() {

    const total =
        characters.length;


    let entered =
        0;


    characters.forEach(
        function(character) {

            if (
                savedVotes[
                    character.id
                ]
            ) {

                entered++;

            }

        }
    );


    voteCount.textContent =
        `${entered} of ${total} votes entered`;


    /*
     * At least two active players are required
     * to determine two captains.
     */

    calculateButton.disabled =
        entered < 2;

}


/* =========================================================
   CALCULATE RESULTS
========================================================= */

calculateButton.addEventListener(
    "click",
    calculateResults
);


function calculateResults() {

    message.textContent =
        "";


    results.hidden =
        true;


    /*
     * Active players are the characters
     * who actually entered a vote.
     */

    const activePlayers =
        characters.filter(
            character =>
                Boolean(
                    savedVotes[
                        character.id
                    ]
                )
        );


    if (
        activePlayers.length < 2
    ) {

        message.textContent =
            "At least two players are required.";

        return;

    }


    /*
     * Count direct votes.
     */

    const directVoteCounts =
        countDirectVotes(
            activePlayers
        );


    /*
     * Determine the two captains.
     *
     * The first captain is the player with
     * the most direct votes.
     *
     * If there is a tie for second place,
     * potential crew size is used to decide
     * the second captain.
     */

    const captainResult =
        determineCaptains(
            activePlayers,
            directVoteCounts
        );


    if (
        !captainResult.success
    ) {

        message.textContent =
            captainResult.message;

        return;

    }


    const captainOne =
        captainResult.captainOne;


    const captainTwo =
        captainResult.captainTwo;


    /*
     * Calculate the actual two crews using
     * the selected captains.
     */

    const crewOne =
        calculateCrew(
            captainOne.id,
            captainTwo.id,
            activePlayers
        );


    const crewTwo =
        calculateCrew(
            captainTwo.id,
            captainOne.id,
            activePlayers
        );


    /*
     * Calculate crew membership once,
     * so a player cannot accidentally
     * appear in both crews.
     */

    const crewOneIds =
        new Set(
            crewOne
        );


    const crewTwoIds =
        new Set(
            crewTwo
        );


    /*
     * Rank the captains.
     *
     * Larger crew wins.
     * If crew size ties, direct votes decide.
     */

    const captainData = [

        {
            captain:
                captainOne,

            crew:
                crewOne,

            directVotes:
                directVoteCounts[
                    captainOne.id
                ] || 0

        },

        {
            captain:
                captainTwo,

            crew:
                crewTwo,

            directVotes:
                directVoteCounts[
                    captainTwo.id
                ] || 0

        }

    ];


    captainData.sort(
        function(a, b) {

            if (
                a.crew.length !==
                b.crew.length
            ) {

                return (
                    b.crew.length -
                    a.crew.length
                );

            }


            if (
                a.directVotes !==
                b.directVotes
            ) {

                return (
                    b.directVotes -
                    a.directVotes
                );

            }


            return 0;

        }
    );


    /*
     * If absolutely everything is tied,
     * don't arbitrarily declare a winner.
     */

    if (
        captainData[0].crew.length ===
            captainData[1].crew.length &&
        captainData[0].directVotes ===
            captainData[1].directVotes
    ) {

        message.textContent =
            "The two captains are tied in both crew size and direct votes. A winner cannot be determined automatically.";

    }


    /*
     * Remaining active players stay on the island.
     */

    const islandPlayers =
        activePlayers.filter(
            character =>
                !crewOneIds.has(
                    character.id
                ) &&
                !crewTwoIds.has(
                    character.id
                )
        );


    renderWinner(
        "winner-one",
        captainData[0]
    );


    renderWinner(
        "winner-two",
        captainData[1]
    );


    renderIsland(
        islandPlayers
    );


    results.hidden =
        false;


    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   COUNT DIRECT VOTES
========================================================= */

function countDirectVotes(
    activePlayers
) {

    const counts = {};


    activePlayers.forEach(
        function(player) {

            counts[
                player.id
            ] = 0;

        }
    );


    activePlayers.forEach(
        function(player) {

            const targetId =
                savedVotes[
                    player.id
                ];


            /*
             * A player can vote for an active
             * player only for that vote to count.
             */

            if (
                targetId &&
                counts[
                    targetId
                ] !== undefined
            ) {

                counts[
                    targetId
                ]++;

            }

        }
    );


    return counts;

}


/* =========================================================
   DETERMINE CAPTAINS
========================================================= */

function determineCaptains(
    activePlayers,
    directVoteCounts
) {

    /*
     * Sort players from highest direct votes
     * to lowest.
     */

    const sorted =
        [...activePlayers].sort(
            function(a, b) {

                const votesA =
                    directVoteCounts[
                        a.id
                    ] || 0;


                const votesB =
                    directVoteCounts[
                        b.id
                    ] || 0;


                return (
                    votesB -
                    votesA
                );

            }
        );


    const firstVotes =
        directVoteCounts[
            sorted[0].id
        ] || 0;


    /*
     * If the highest vote total is zero,
     * nobody has received a direct vote.
     */

    if (
        firstVotes === 0
    ) {

        return {

            success:
                false,

            message:
                "No votes have been entered for any active player."

        };

    }


    /*
     * Captain #1 is always the person with
     * the most direct votes.
     */

    const captainOne =
        sorted[0];


    /*
     * Find everyone tied for the second-highest
     * direct vote total.
     */

    const secondVotes =
        directVoteCounts[
            sorted[1].id
        ] || 0;


    const tiedForSecond =
        sorted.filter(
            character =>
                (
                    directVoteCounts[
                        character.id
                    ] || 0
                ) === secondVotes
        );


    /*
     * No tie for second:
     *
     * Simply use the second-highest
     * direct vote getter.
     */

    if (
        tiedForSecond.length === 1
    ) {

        return {

            success:
                true,

            captainOne:
                captainOne,

            captainTwo:
                tiedForSecond[0]

        };

    }


    /*
     * There is a tie for second.
     *
     * Test each tied candidate as the
     * second captain and determine how
     * large their potential crew would be.
     */

    const potentialCaptains =
        tiedForSecond.map(
            function(candidate) {

                const potentialCrew =
                    calculateCrew(
                        captainOne.id,
                        candidate.id,
                        activePlayers
                    );


                return {

                    candidate:
                        candidate,

                    crewSize:
                        potentialCrew.length,

                    directVotes:
                        directVoteCounts[
                            candidate.id
                        ] || 0

                };

            }
        );


    /*
     * Sort the potential second captains:
     *
     * 1. Largest potential crew
     * 2. Most direct votes
     */

    potentialCaptains.sort(
        function(a, b) {

            if (
                a.crewSize !==
                b.crewSize
            ) {

                return (
                    b.crewSize -
                    a.crewSize
                );

            }


            if (
                a.directVotes !==
                b.directVotes
            ) {

                return (
                    b.directVotes -
                    a.directVotes
                );

            }


            return 0;

        }
    );


    /*
     * Check whether the best two candidates
     * are still completely tied.
     */

    const best =
        potentialCaptains[0];


    const secondBest =
        potentialCaptains[1];


    if (
        best.crewSize ===
            secondBest.crewSize &&
        best.directVotes ===
            secondBest.directVotes
    ) {

        return {

            success:
                false,

            message:
                "There is still a tie for the second captain position after comparing potential crew sizes. Please review the votes and resolve the tie manually."

        };

    }


    /*
     * The candidate with the largest potential
     * crew becomes Captain #2.
     */

    return {

        success:
            true,

        captainOne:
            captainOne,

        captainTwo:
            best.candidate

    };

}


/* =========================================================
   CALCULATE CREW
========================================================= */

function calculateCrew(
    captainId,
    otherCaptainId,
    activePlayers
) {

    const activeIds =
        new Set(
            activePlayers.map(
                player =>
                    player.id
            )
        );


    const crewIds =
        new Set();


    /*
     * The captain is always part of
     * their own crew.
     */

    crewIds.add(
        captainId
    );


    activePlayers.forEach(
        function(player) {

            /*
             * Captains have already been assigned.

             */

            if (
                player.id ===
                    captainId ||
                player.id ===
                    otherCaptainId
            ) {

                return;

            }


            const result =
                followVoteChain(
                    player.id,
                    captainId,
                    otherCaptainId,
                    activeIds
                );


            if (
                result === captainId
            ) {

                crewIds.add(
                    player.id
                );

            }

        }
    );


    return [
        ...crewIds
    ];

}


/* =========================================================
   FOLLOW VOTE CHAIN
========================================================= */

function followVoteChain(
    startingId,
    captainId,
    otherCaptainId,
    activeIds
) {

    let currentId =
        startingId;


    const visited =
        new Set();


    while (true) {

        /*
         * A captain ends the chain.
         */

        if (
            currentId ===
            captainId
        ) {

            return captainId;

        }


        if (
            currentId ===
            otherCaptainId
        ) {

            return otherCaptainId;

        }


        /*
         * A loop means the chain never reaches
         * either captain.
         */

        if (
            visited.has(
                currentId
            )
        ) {

            return null;

        }


        visited.add(
            currentId
        );


        /*
         * If the character isn't active,
         * they aren't playing and therefore
         * cannot be part of a crew chain.
         */

        if (
            !activeIds.has(
                currentId
            )
        ) {

            return null;

        }


        const nextId =
            savedVotes[
                currentId
            ];


        /*
         * No vote means the chain ends.

         */

        if (
            !nextId
        ) {

            return null;

        }


        /*
         * A vote for someone who isn't playing
         * also ends the chain.
         */

        if (
            !activeIds.has(
                nextId
            )
        ) {

            return null;

        }


        currentId =
            nextId;

    }

}


/* =========================================================
   RENDER WINNER
========================================================= */

function renderWinner(
    elementId,
    data
) {

    const card =
        document.getElementById(
            elementId
        );


    if (!card) {
        return;
    }


    const name =
        card.querySelector(
            ".winner-name"
        );


    const crewSize =
        card.querySelector(
            ".crew-size"
        );


    const directVotes =
        card.querySelector(
            ".direct-votes"
        );


    const list =
        card.querySelector(
            ".crew-members ul"
        );


    name.textContent =
        data.captain.character_name;


    crewSize.textContent =
        data.crew.length;


    directVotes.textContent =
        data.directVotes;


    list.innerHTML =
        "";


    const crewMembers =
        data.crew
            .map(
                id =>
                    characters.find(
                        character =>
                            character.id === id
                    )
            )
            .filter(
                Boolean
            )
            .sort(
                function(a, b) {

                    return a.character_name.localeCompare(
                        b.character_name
                    );

                }
            );


    crewMembers.forEach(
        function(character) {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                character.character_name;


            list.appendChild(
                li
            );

        }
    );

}


/* =========================================================
   RENDER ISLAND
========================================================= */

function renderIsland(
    players
) {

    const list =
        document.getElementById(
            "island-list"
        );


    list.innerHTML =
        "";


    if (
        players.length === 0
    ) {

        const li =
            document.createElement(
                "li"
            );


        li.textContent =
            "No active players remain on the island.";


        list.appendChild(
            li
        );


        return;

    }


    players
        .sort(
            function(a, b) {

                return a.character_name.localeCompare(
                    b.character_name
                );

            }
        )
        .forEach(
            function(character) {

                const li =
                    document.createElement(
                        "li"
                    );


                li.textContent =
                    character.character_name;


                list.appendChild(
                    li
                );

            }
        );

}


/* =========================================================
   CLEAR ALL VOTES
========================================================= */

clearButton.addEventListener(
    "click",
    function() {

        const confirmed =
            window.confirm(
                "Clear all entered votes? This cannot be undone."
            );


        if (!confirmed) {
            return;
        }


        savedVotes =
            {};


        saveVotes();


        document
            .querySelectorAll(
                ".vote-select"
            )
            .forEach(
                function(select) {

                    select.value =
                        "";

                }
            );


        results.hidden =
            true;


        message.textContent =
            "";


        updateVoteCount();

    }
);