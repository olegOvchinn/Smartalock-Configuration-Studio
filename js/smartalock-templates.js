document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".template-card");
    const continueBtn = document.getElementById("continueBtn");
    const selectedCount = document.getElementById("selectedCount");

    // ----------------------------------------------------
    // Restore previous selections (if any)
    // ----------------------------------------------------

    const saved = JSON.parse(localStorage.getItem("smartalockTemplates") || "[]");

    saved.forEach(name => {

        const card = document.querySelector(`[data-template="${name}"]`);

        if(card){

            card.classList.add("selected");

        }

    });

    updateSelectionCount();

    // ----------------------------------------------------
    // Card selection
    // ----------------------------------------------------

    cards.forEach(card => {

        card.addEventListener("click", e => {

            if(
                e.target.closest("input") ||
                e.target.closest("button")
            ){
                return;
            }

            card.classList.toggle("selected");

            saveSelections();

            updateSelectionCount();

        });

    });

    // ----------------------------------------------------
    // Add locker bank
    // ----------------------------------------------------

    document.querySelectorAll(".add-bank").forEach(button => {

        button.addEventListener("click", e => {

            e.stopPropagation();

            const panel = button.closest(".assignment-panel");

            const list = panel.querySelector(".assignment-list");

            const row = document.createElement("div");

            row.className = "assignment-row";

            row.innerHTML = `

                <div class="field">

                    <label>Locker Bank</label>

                    <input
                        type="text"
                        placeholder="Example: Level 1 East">

                </div>

                <div class="field">

                    <label>Locker Numbers</label>

                    <input
                        type="text"
                        placeholder="Example: 1-24">

                </div>

                <button
                    type="button"
                    class="remove-bank">

                    ×

                </button>

            `;

            list.appendChild(row);

            attachRemove(row);

        });

    });

    // ----------------------------------------------------
    // Remove locker bank
    // ----------------------------------------------------

    document.querySelectorAll(".assignment-row").forEach(row => {

        attachRemove(row);

    });

    function attachRemove(row){

        const remove = row.querySelector(".remove-bank");

        remove.addEventListener("click", e => {

            e.stopPropagation();

            const rows = row.parentElement.querySelectorAll(".assignment-row");

            if(rows.length===1){

                return;

            }

            row.remove();

        });

    }

    // ----------------------------------------------------
    // Continue
    // ----------------------------------------------------

    continueBtn.addEventListener("click",()=>{

        if(continueBtn.disabled){

            return;

        }

        window.location.href="smartalock-wizard.html";

    });

    // ----------------------------------------------------
    // Helpers
    // ----------------------------------------------------

    function updateSelectionCount(){

        const selected =
            document.querySelectorAll(".template-card.selected");
    
        const count = selected.length;
    
        selectedCount.textContent = count;
    
        continueBtn.disabled = count === 0;
    
        // Hide Apply to on all cards first
        document.querySelectorAll(".template-card").forEach(card=>{
    
            card.classList.remove("show-assignment");
    
        });
    
        // Only show Apply to if more than one template selected
        if(count > 1){
    
            selected.forEach(card=>{
    
                card.classList.add("show-assignment");
    
            });
    
        }
    
    }

    function saveSelections(){

        const selected=[];

        document.querySelectorAll(".template-card.selected").forEach(card=>{

            selected.push(card.dataset.template);

        });

        localStorage.setItem(
            "smartalockTemplates",
            JSON.stringify(selected)
        );

    }

});