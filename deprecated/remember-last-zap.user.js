// ==UserScript==
// @name         Remember Last Zap
// @namespace    neopets
// @version      2026-07-03
// @description  Fork of senerio's Remember Last Zap for new page updates
// @author       nonhic
// @match        *://*.neopets.com/petpetlab.phtml
// @match        *://*.neopets.com/lab.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.co
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    const loc = location.pathname.split(/\/|\./).at(-2);
    const storageKey = 'np_' + loc;
    // Selectors stored as strings so we can query them dynamically later
    // selectSelector -> pet name dropdown, buttonSelector -> "go" button;
    //     one selector for pet lab and one for P2 lab
    const selectSelector = "select[class='lab-select lab-as-native'], .h5-input[onchange='selectPetpet(this)']";
    const buttonSelector = ".lab-actions > button.np-button, button#PPLButton";
    // Function runs only when petSelect exists
    function init (petSelect) {
        const petButton = document.querySelector(buttonSelector);
        // Find the saved pet name (if it exists)
        function applySavedPet () {
            const savedName = localStorage.getItem(storageKey);
            if (savedName) {
                const option = petSelect.querySelector(`option[value="${savedName}"]`);
                if (option) {
                    // Select the saved pet name (if it exists)
                    option.selected = true;
                    // Create and fire a native 'change' event to trick the page into thinking a human clicked it
                    const event = new Event('change', { bubbles: true });
                    petSelect.dispatchEvent(event);
                    console.log(`Successfully auto-selected saved pet: ${savedName}`);
                    // Return true to let the observer (below) know it can stop
                    return true;
                }
            }
            // Return false to let the observer know it needs to wait for petSelect to appear
            return false;
        }

        function setupSaveListener() {
            // Listen for the press of the "go" button to store the selection
            if (petButton) {
                petButton.addEventListener('click', () => {
                    const currentSelection = petSelect.value;
                    localStorage.setItem(storageKey, currentSelection);
                    console.log(`Saved selection on button click: ${currentSelection}`);
                });
            }
        }
        // Try to apply the saved pet immediately
        const success = applySavedPet();
        // If options aren't fully populated inside the dropdown yet,
        // watch the petSelect element itself for child list updates
        if (!success) {
            const dropdownObserver = new MutationObserver(() => {
                console.log("Dropdown internal options changed, retrying select...");
                const retrySuccess = applySavedPet();
                if (retrySuccess) {
                    dropdownObserver.disconnect();
                }
            });
            dropdownObserver.observe(petSelect, { childList: true });
        }
        setupSaveListener();
    }
    // --- EXECUTION FLOW CONTROL ---
    // Check if the petSelect element exists
    let immediateSelect = document.querySelector(selectSelector);
    if (immediateSelect) {
        init(immediateSelect);
    } else {
        // Since petSelect has not been found, set up the page observer
        // Watch the entire page body for the injection of our element
        const pageObserver = new MutationObserver((mutations, observer) => {
            const dynamicSelect = document.querySelector(selectSelector);
            if (dynamicSelect) {
                init(dynamicSelect);
                observer.disconnect(); // Stop watching the entire page body
            }
        });
        // subtree: true is required to scan deep down into the body changes
        pageObserver.observe(document.body, { childList: true, subtree: true });
    }
})();