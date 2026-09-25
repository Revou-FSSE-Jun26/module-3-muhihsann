/* =====================================================================
   DOM Manipulation & Event Handling exercise (vanilla JS)
   Demonstrates:
   - selecting DOM elements
   - updating element content
   - toggling classes
   - creating and removing elements
   - attaching event handlers (click, submit) and preventDefault
   ===================================================================== */

"use strict";

/* ---------- 1. Toggle a class ---------- */
const toggleBtn = document.getElementById("toggle-btn");
const box = document.getElementById("box");

toggleBtn.addEventListener("click", () => {
  // classList.toggle adds the class if absent, removes it if present
  box.classList.toggle("active");
});

/* ---------- 2. Counter: update DOM text on click ---------- */
let count = 0; // number
const counterValue = document.getElementById("counter-value");
const incrementBtn = document.getElementById("increment");
const decrementBtn = document.getElementById("decrement");

function renderCount() {
  counterValue.textContent = String(count);
}

incrementBtn.addEventListener("click", () => {
  count += 1;
  renderCount();
});

decrementBtn.addEventListener("click", () => {
  // guard so the counter never goes negative
  if (count > 0) count -= 1;
  renderCount();
});

/* ---------- 3. Create & remove elements ---------- */
const itemForm = document.getElementById("item-form");
const itemInput = document.getElementById("item-input");
const itemList = document.getElementById("item-list");

itemForm.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  const text = itemInput.value.trim();
  if (text === "") return; // ignore empty input

  // create a new <li> element
  const li = document.createElement("li");

  const label = document.createElement("span");
  label.textContent = text;

  // create a remove button and wire up its click handler
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "remove";
  removeBtn.addEventListener("click", () => {
    itemList.removeChild(li); // remove element from the DOM
  });

  li.appendChild(label);
  li.appendChild(removeBtn);
  itemList.appendChild(li);

  // reset the input for the next entry
  itemInput.value = "";
  itemInput.focus();
});
