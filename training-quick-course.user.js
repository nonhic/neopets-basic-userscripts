// ==UserScript==
// @name         Training Quick Course
// @namespace    neopets
// @version      2026-11-14
// @description  Bypass the homepage and go straight to training, add buttons for quickly activating a course (*sets up course page for Ninja school)
// @author       nonhic [senerio]
// @match        *://*.neopets.com/island/training.phtml*
// @match        *://*.neopets.com/pirates/academy.phtml*
// @match        *://*.neopets.com/island/fight_training.phtml*
// @icon         https://images.neopets.com/themes/h5/basic/images/prizepass-icon.png
// @grant		 GM.setValue
// @grant		 GM.getValue
// ==/UserScript==
/* globals $ */
(function() {
    'use strict';
	const path = location.pathname.split('/').pop();
    if (!location.search.length) {
        location.replace(location.pathname + '?type=status');
	} else if (path.includes("fight") && location.search.includes('courses')) {
		(async function() {
			let trainData = await GM.getValue("temp_ninja", "");
			if (trainData) {
				window.scrollTo(0, document.documentElement.scrollHeight);
				document.querySelector(`select[name='pet_name'] > option[value='${trainData[0]}']`).selected = true;
				document.querySelector(`select[name='course_type'] > option[value='${trainData[1]}`).selected = true;
				await GM.setValue("temp_ninja","");
				console.log("Cleared storage");
			}
		})();
    } else if (location.search.includes('status')) {
        const course = ['Level', 'Strength', 'Defence', 'Agility', 'Endurance'];
        document.querySelectorAll("table > tbody > tr > td.content table > tbody > tr:nth-child(even)").forEach((v,i) => {
            const trainTable = v.querySelector('td:nth-child(2)');
            if (trainTable.innerText.includes("This course has not been paid for yet") ||
                trainTable.innerText.includes("Time till course finishes") ||
                trainTable.innerText.includes("Course complete")) {
                return;
            }
            const statNodes = v.querySelectorAll('td:first-child b');
            const petStats = [...statNodes].map(el => parseInt(el.innerText, 10));
            const petName = v.querySelector('img').getAttribute('src').match(/(?<=\/cpn\/).*?(?=\/[0-9]\/[0-9].png)/)[0];
            statNodes.forEach((v, i) => {
                const courseType = course[i];
                let plus = '+';
				if (path.includes("fight")) {
					v.insertAdjacentHTML('afterend',`<a id="add_link" href="https://www.neopets.com/island/fight_training.phtml?type=courses"`
						+` class="${petName}_${courseType}" style="margin-left: 5; font-size: larger; font-weight: bolder;">${plus}</a>`);
				} else {
					v.insertAdjacentHTML('afterend',`<a id="add_link" href="process_${path}`
						+`?type=start&course_type=${courseType}&pet_name=${petName}" style=`
						+`"margin-left: 5; font-size: larger; font-weight: bolder;">${plus}</a>`);
				}
            });
			if (path.includes("fight")) {
				$("a[id='add_link']").on("click", function() {
					let tempData = $(this).attr("class").split("_");
					(async function() {
						await GM.setValue("temp_ninja",tempData);
						console.log("Stored "+tempData[1]+" course for "+tempData[0]);
					})();
				});
			}
        });
    }
})();
