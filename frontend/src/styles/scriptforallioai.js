const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        // Close other FAQ items
        faqItems.forEach((faq) => {
            if (faq !== item) {
                faq.classList.remove("active");
            }
        });

        // Toggle clicked item
        item.classList.toggle("active");
    });
});
// Sign In button logic

const signinButton = document.getElementById("signinButton");

if (signinButton) {
    signinButton.addEventListener("click", () => {

        const isLoggedIn = localStorage.getItem("isLoggedIn");

        if (isLoggedIn === "true") {
            // User is already signed in
            window.location.href = "/app";
        } else {
            // User is not signed in
            window.location.href = "/signin";
        }

    });
}
// ================================
// Upgrade to Plus / Pro
// ================================

const upgradePlus = document.getElementById("upgradePlus");
const upgradePro = document.getElementById("upgradePro");

function handleUpgrade(plan) {

    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // Save which plan the user wants
    localStorage.setItem("selectedPlan", plan);

    if (isLoggedIn === "true") {

        // Already logged in → Billing page
        window.location.href = "/billing";

    } else {

        // Not logged in → Remember destination
        localStorage.setItem("redirectAfterLogin", "/billing");

        // Go to Sign In
        window.location.href = "/signin";
    }
}


// Plus button
if (upgradePlus) {
    upgradePlus.addEventListener("click", () => {
        handleUpgrade("plus");
    });
}


// Pro button
if (upgradePro) {
    upgradePro.addEventListener("click", () => {
        handleUpgrade("pro");
    });
}