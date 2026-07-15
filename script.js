const themeButton = document.getElementById("themeButton");
const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");
const copyEmailButton = document.getElementById("copyEmail");
const copyMessage = document.getElementById("copyMessage");
const currentYear = document.getElementById("currentYear");

const savedTheme = localStorage.getItem("farodian-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.body.classList.add("dark");
}

function updateThemeIcon() {
    themeButton.textContent = document.body.classList.contains("dark") ? "☾" : "☀";
}

updateThemeIcon();

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "farodian-theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
    updateThemeIcon();
});

menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
    });
});

document.querySelectorAll("a.disabled").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
});

copyEmailButton.addEventListener("click", async () => {
    const email = "farodian1811@gmail.com";

    try {
        await navigator.clipboard.writeText(email);
        copyMessage.textContent = "Email copied.";
    } catch (error) {
        copyMessage.textContent = `Copy this email: ${email}`;
    }

    window.setTimeout(() => {
        copyMessage.textContent = "";
    }, 3000);
});

currentYear.textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
});
