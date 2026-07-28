document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".template-card");
    const continueBtn = document.getElementById("continueBtn");
    const selectedCount = document.getElementById("selectedCount");

    const STORAGE_KEY = "floorsenseDeskTemplates";

    // ---------------------------------------
    // Restore previous selection
    // ---------------------------------------

    const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
    );

    if(saved.selected){

        saved.selected.forEach(name=>{

            const card = document.querySelector(
                `[data-template="${name}"]`
            );

            if(card){

                card.classList.add("selected");

            }

        });

    }

    if(saved.assignments){

        restoreAssignments(saved.assignments);

    }

    updateSelectionCount();

    // ---------------------------------------
    // Card selection
    // ---------------------------------------

    cards.forEach(card=>{

        card.addEventListener("click",e=>{

            if(
                e.target.closest("input") ||
                e.target.closest("button")
            ){
                return;
            }

            card.classList.toggle("selected");

            updateSelectionCount();

            saveData();

        });

    });

    // ---------------------------------------
    // Add neighbourhood
    // ---------------------------------------

    document.querySelector(".add-bank")
        .addEventListener("click",e=>{

        e.stopPropagation();

        addAssignmentRow();

        saveData();

    });

    // ---------------------------------------
    // Continue
    // ---------------------------------------

    continueBtn.addEventListener("click",()=>{

        if(continueBtn.disabled){

            return;

        }

        saveData();

        window.location.href =
            "floorsense-wizard.html";

    });

    // ---------------------------------------
    // Helpers
    // ---------------------------------------

    function updateSelectionCount(){

        const selected =
            document.querySelectorAll(
                ".template-card.selected"
            );

        selectedCount.textContent =
            selected.length;

        continueBtn.disabled =
            selected.length===0;

        document
            .querySelectorAll(".template-card")
            .forEach(card=>{

                card.classList.remove(
                    "show-assignment"
                );

            });

        const adhoc =
            document.querySelector(
                '[data-template="adhoc"]'
            );

        if(
            adhoc &&
            adhoc.classList.contains("selected")
        ){

            adhoc.classList.add(
                "show-assignment"
            );

        }

    }

    function addAssignmentRow(
        neighbourhood="",
        desks=""
    ){

        const list =
            document.querySelector(
                ".assignment-list"
            );

        const row =
            document.createElement("div");

        row.className =
            "assignment-row";

        row.innerHTML = `

            <div class="field">

                <label>

                    Desk Neighbourhood

                </label>

                <input
                    type="text"
                    value="${neighbourhood}"
                    placeholder="Example: Level 2 West">

            </div>

            <div class="field">

                <label>

                    Desk Numbers

                </label>

                <input
                    type="text"
                    value="${desks}"
                    placeholder="Example: 1-48">

            </div>

            <button
                type="button"
                class="remove-bank">

                ×

            </button>

        `;

        list.appendChild(row);

        attachRemove(row);

    }

    function attachRemove(row){

        row.querySelector(".remove-bank")
            .addEventListener("click",e=>{

            e.stopPropagation();

            const rows =
                document.querySelectorAll(
                    ".assignment-row"
                );

            if(rows.length===1){

                return;

            }

            row.remove();

            saveData();

        });

        row.querySelectorAll("input")
            .forEach(input=>{

                input.addEventListener(
                    "input",
                    saveData
                );

            });

    }

    document
        .querySelectorAll(".assignment-row")
        .forEach(attachRemove);

    function saveData(){

        const selected=[];

        document
            .querySelectorAll(
                ".template-card.selected"
            )
            .forEach(card=>{

                selected.push(
                    card.dataset.template
                );

            });

        const assignments=[];

        document
            .querySelectorAll(".assignment-row")
            .forEach(row=>{

                const inputs =
                    row.querySelectorAll("input");

                if(
                    inputs[0].value ||
                    inputs[1].value
                ){

                    assignments.push({

                        neighbourhood:
                            inputs[0].value,

                        desks:
                            inputs[1].value

                    });

                }

            });

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({

                selected,
                assignments

            })
        );

    }

    function restoreAssignments(assignments){

        const list =
            document.querySelector(
                ".assignment-list"
            );

        list.innerHTML="";

        assignments.forEach(item=>{

            addAssignmentRow(

                item.neighbourhood,

                item.desks

            );

        });

        if(assignments.length===0){

            addAssignmentRow();

        }

    }

});