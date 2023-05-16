let openBtn = document.querySelector(".bi-three-dots-vertical");
let closeBtn = document.querySelector(".bi-x-square-fill");
let navbar = document.querySelector(".right");

function openMenu() {
  navbar.style.right = "0";
}

function closeMenu() {
  navbar.style.right = "-100%";
}

const issueDateInput = document.getElementById("issueDate");
const lRenewOneInput = document.getElementById("lRenewOne");
const lRenewTwoInput = document.getElementById("lRenewTwo");
const lExpiryInput = document.getElementById("lExpiry");

function addDaysToDate(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

issueDateInput.addEventListener("change", function () {
  const issueDate = new Date(issueDateInput.value);
  const lRenewOneDate = addDaysToDate(issueDate, 363);
  const lRenewTwoDate = addDaysToDate(lRenewOneDate, 365);
  const lExpiryDate = addDaysToDate(lRenewTwoDate, 365);

  lRenewOneInput.value = lRenewOneDate.toISOString().slice(0, 10);
  lRenewTwoInput.value = lRenewTwoDate.toISOString().slice(0, 10);
  lExpiryInput.value = lExpiryDate.toISOString().slice(0, 10);
});
