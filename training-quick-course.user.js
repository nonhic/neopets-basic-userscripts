// ==UserScript==
// @name         Training Quick Course
// @namespace    neopets
// @version      2026-11-24
// @description  Bypass the homepage and go straight to training, add buttons for quickly activating a course (*sets up course page for Ninja school)
// @author       nonhic
// @match        *://*.neopets.com/island/training.phtml*
// @match        *://*.neopets.com/pirates/academy.phtml*
// @match        *://*.neopets.com/island/fight_training.phtml*
// @icon         https://images.neopets.com/themes/h5/basic/images/prizepass-icon.png
// @updateURL	 https://github.com/nonhic/neopets-basic-userscripts/raw/refs/heads/main/training-quick-course.user.js
// @downloadURL	 https://github.com/nonhic/neopets-basic-userscripts/raw/refs/heads/main/training-quick-course.user.js
// @grant		 GM.setValue
// @grant		 GM.getValue
// ==/UserScript==
(function() {
    'use strict';
	const path = location.pathname.split('/').pop();
	// Redirect to Status page
    if (!location.search.length) {
        location.replace(location.pathname + '?type=status');
	// Ninja Course Select page handling
	} else if (path.includes("fight") && location.search.includes('courses')) {
		function dispatch(dropdown) {
			const event = new Event('change', {bubbles: true});
			dropdown.dispatchEvent(event);
		}
		// Apply stored values to the Ninja course select page (if they exist)
		(async function() {
			let tempData = await GM.getValue("temp_ninja", "");
			if (tempData) {
				console.log("Found stored course selections: "+tempData[1]+" course for "+tempData[0]);
				window.scrollTo(0, document.documentElement.scrollHeight);
				let dropdownPetName = document.querySelector("select[name='pet_name']");
				dropdownPetName.querySelector(`option[value='${tempData[0]}']`).selected = true;
				dispatch(dropdownPetName);
				let dropdownCourseType = document.querySelector("select[name='course_type']");
				dropdownCourseType.querySelector(`option[value='${tempData[1]}'`).selected = true;
				dispatch(dropdownCourseType);
			}
		})();
		// Add an EventListener to the form that will clear the stored values upon submission
		async function handleCourseSubmit(event) {
			try {
				event.preventDefault();
				await GM.setValue("temp_ninja","");
				console.log("Cleared storage");
				event.currentTarget.submit();
			} catch (error) {
				console.error("Error, submission halted.", error);
			}
		}
		const startCourseForm = document.querySelector('form[action="process_fight_training.phtml"]');
		startCourseForm.addEventListener("submit", handleCourseSubmit);
	// Status page for all three schools handling
    } else if (location.search.includes('status')) {
		const selector = "td.content table > tbody > tr:nth-child(even):has(td > img ~ font)";
        const course = ['Level', 'Strength', 'Defence', 'Agility', 'Endurance'];
		// Move through each pet's training school section
        document.querySelectorAll(selector).forEach((v,i) => {
            const trainText = v.querySelector('td:nth-child(2)').innerText;
			// If a course is pending, ongoing, or finished, don't add shortcut buttons
            if (trainText) {
                return;
            }
            const statNodes = v.querySelectorAll('td:first-child b');
            const petName = v.querySelector('img').getAttribute('src').match(/(?<=\/cpn\/).*?(?=\/[0-9]\/[0-9].png)/)[0];
			// Add a shortcut button for every stat
            statNodes.forEach((v, i) => {
                const courseType = course[i];
                let plus = "+";
				// Change the Ninja shortcuts to links to the course select page (cannot directly start a course from a link)
				if (path.includes("fight")) {
					v.insertAdjacentHTML('afterend',`<a id="add_link" href="https://www.neopets.com/island/fight_training.phtml?type=courses"`
						+` class="${petName}_${courseType}" style="margin-left: 5; font-size: larger; font-weight: bolder;">${plus}</a>`);
					let shortcutNode = v.nextElementSibling;
					// Add an EventListener for the shortcut buttons to store the selected pet/course for use on the next page
					async function handleStoreTrainingData(event) {
						try {
							event.preventDefault(); // Stop the page from navigating until the promise is delivered
							let tempData = event.currentTarget.className.split("_");
							await GM.setValue("temp_ninja",tempData);
							console.log("Stored "+tempData[1]+" course for "+tempData[0]);
							window.location.href = event.currentTarget.href;
						} catch (error) {
							console.error("Error, link navigation halted.", error);
						}
					}
					shortcutNode.addEventListener("click", handleStoreTrainingData);
				// Make shortcuts for the other two schools using direct links to start a course
				} else {
					v.insertAdjacentHTML('afterend',`<a id="add_link" href="process_${path}`
						+`?type=start&course_type=${courseType}&pet_name=${petName}" style=`
						+`"margin-left: 5; font-size: larger; font-weight: bolder;">${plus}</a>`);
				}
            });
        });
    }
})();
