// ==UserScript==
// @name         Quick Pet Change (Wheels + Fishing)
// @namespace    neopets
// @version      2026-11-25
// @description  Creates buttons to change your pet when fishing and spinning wheels, also toggle on/off wheel sounds
// @author       nonhic
// @license		 The Unlicense
// @match        *://*.neopets.com/water/fishing.phtml
// @match        *://*.neopets.com/np25birthday*
// @match        *://*.neopets.com/faerieland/wheel*
// @match        *://*.neopets.com/desert/extravagance*
// @match        *://*.neopets.com/medieval/knowledge*
// @match        *://*.neopets.com/prehistoric/mediocrity*
// @match        *://*.neopets.com/halloween/wheel*
// @match        *://*.neopets.com/prehistoric/monotony*
// @match        *://*.neopets.com/premium/wheel*
// @icon         https://images.neopets.com/themes/h5/basic/images/prizepass-icon.png
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
	// SCRIPT OPTIONS:
	///////////////////////////////////////////////////////////
	// By default, this script works by opening up QuickRef in a new tab to change the active pet,
	// then closes that tab to return to your activity. If you mostly play on desktop you can opt for
	// Quickref to open in a tiny popup window instead by changing the below value to "true".
    const popup = false;
	///////////////////////////////////////////////////////////
	// By default, this script mutes your wheels (inspired by Saahphire's script), but you can
	// opt to have them unmuted by changing the below value to "false".
	const muteWheels = true;
	///////////////////////////////////////////////////////////
	// SCRIPT BODY
	if (!document.URL.includes("fishing") && muteWheels) {
        window.wheelSoundStatus = 0;
		document.querySelector("#wheelSoundControl").classList.add("wheelSound-off");
    }
	const targetButton = document.querySelector("form:has(INPUT[value='Reel In Your Line']), button#wheelButtonSpin");//, button.button-default__2020.button-yellow__2020.btn-single__2020
	if (targetButton) {
		const qrURL = "https://www.neopets.com/quickref.phtml";
		const curPet = document.querySelector("a.profile-dropdown-link").textContent;
		var buttonContainer = document.createElement("div");
		Object.assign(buttonContainer.style, {
			textAlign: "center",
			marginTop: "10px",
			justifyContent: "center",
			alignContent: "center",
			display: "grid"
		});
		var switchHeader = document.createElement('h3');
		Object.assign(switchHeader.style, {
			fontFamily: "'MuseoSansRounded700', 'Arial', sans-serif",
			textAlign: "center"
		});
		switchHeader.textContent = "Switch your active pet?";
		function handleAddPetClick(event) {
			event.preventDefault();
			const link = event.currentTarget;
			const href = link.getAttribute("href");
			const switchPage = popup
					? "popup,left=0,top=0,width=100,height=100"
					: "";
			const newTab = window.open(href, "_blank", switchPage);
			setTimeout(() => {
				if (newTab && !newTab.closed) {
					newTab.close();
				}
				location.reload();
			}, 100);
		}
		var pets = [];
		async function fetchPets(url) {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("HTTP error",response.status);
			}
			const html = await response.text();
			const parser = new DOMParser();
			const data = parser.parseFromString(html, "text/html");
			return data;
		}
		fetchPets(qrURL).then((data) => {
			data.querySelectorAll(".bs-petselect-avatar").forEach((petAv) => {
				let name = petAv.getAttribute("alt");
				let image = petAv.getAttribute("src");
				pets.push({name: name, image: image});
			});
			let adjPetNum = 9;
			let remainder = pets.length % adjPetNum;
			if (remainder == 1 || remainder == 2) adjPetNum = 1+adjPetNum;
			if (remainder == 3 || remainder == 4) adjPetNum = adjPetNum-1;
			let calcRows = Math.trunc(pets.length/adjPetNum)+1;
			const needsExtraRows = Boolean(calcRows>1);
			buttonContainer.style.gridTemplateColumns = `repeat(${adjPetNum}, 0fr)`;
			let buttonContainerRow2, buttonContainerRow3;
			if (needsExtraRows) {
				buttonContainerRow2 = buttonContainer.cloneNode(false);
				if (calcRows > 2) {
					buttonContainerRow3 = buttonContainer.cloneNode(false);
				}
			}
			const nodesToInsert = [switchHeader, buttonContainer];
			if (buttonContainerRow2) {
				nodesToInsert.push(buttonContainerRow2);
			}
			if (buttonContainerRow3) {
				nodesToInsert.push(buttonContainerRow3);
			}
			targetButton.after(...nodesToInsert);
			const baseImgStyle = "margin-left: 10px; border-radius: 50%; object-fit: cover;";
			const inactiveStyle = "filter: grayscale(1) opacity(0.2); ";
			let row1Html = "";
			let row2Html = "";
			let row3Html = "";
			for (let i = 0; i < pets.length; i++) {
				const pet = pets[i];
				const curPetStyle = pet.name === curPet ? inactiveStyle : "";
				const href = "https://www.neopets.com/process_changepet.phtml?new_active_pet="+encodeURIComponent(pet.name);
				const itemHtml =
					`<a id="add_pet" href="${href}" target="_blank"><img id="petimg" `
					+`src="${pet.image}" style="${curPetStyle}${baseImgStyle}"></a>`;
				if (needsExtraRows && i >= adjPetNum) {
					if (i >= adjPetNum*2) {
						row3Html += itemHtml;
					} else {
						row2Html += itemHtml;
					}
				} else {
					row1Html += itemHtml;
				}
			}
			buttonContainer.insertAdjacentHTML("beforeend", row1Html);
			if (buttonContainerRow2) {
				buttonContainerRow2.insertAdjacentHTML("beforeend", row2Html);
			}
			if (buttonContainerRow3) {
				buttonContainerRow3.insertAdjacentHTML("beforeend", row3Html);
			}
			const addLink = document.querySelectorAll("a#add_pet");
			if (!addLink) return;
			addLink.forEach((e)=> e.addEventListener("click",handleAddPetClick));
		});
	}
})();
