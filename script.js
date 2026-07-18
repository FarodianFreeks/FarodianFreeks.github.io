document.addEventListener("DOMContentLoaded", () => {
    const themeButton = document.getElementById("themeButton");
    const menuButton = document.getElementById("menuButton");
    const navLinks = document.getElementById("navLinks");
    const copyEmailButton = document.getElementById("copyEmail");
    const copyMessage = document.getElementById("copyMessage");
    const currentYear = document.getElementById("currentYear");

    /* 
       THEME
       
     */

    const savedTheme = localStorage.getItem("farodian-theme");
    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.body.classList.add("dark");
    }

    function updateThemeIcon() {
        if (!themeButton) {
            return;
        }

        themeButton.textContent =
            document.body.classList.contains("dark") ? "☾" : "☀";
    }

    updateThemeIcon();

    if (themeButton) {
        let themeAnimationInProgress = false;

        themeButton.addEventListener("click", () => {
            if (themeAnimationInProgress) {
                return;
            }

            const reduceThemeMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            const applyThemeChange = () => {
                document.body.classList.toggle("dark");

                localStorage.setItem(
                    "farodian-theme",
                    document.body.classList.contains("dark")
                        ? "dark"
                        : "light"
                );

                updateThemeIcon();
            };

            if (reduceThemeMotion) {
                applyThemeChange();
                return;
            }

            themeAnimationInProgress = true;

            const buttonRect = themeButton.getBoundingClientRect();

            document.body.style.setProperty(
                "--theme-loop-x",
                `${buttonRect.left + buttonRect.width / 2}px`
            );

            document.body.style.setProperty(
                "--theme-loop-y",
                `${buttonRect.top + buttonRect.height / 2}px`
            );

            document.body.classList.remove(
                "theme-transitioning",
                "theme-loop-active"
            );

            themeButton.classList.remove("theme-looping");

            /*
               Force the browser to reset the animation so it can
               play again every time the theme button is clicked.
            */
            void document.body.offsetWidth;

            document.body.classList.add(
                "theme-transitioning",
                "theme-loop-active"
            );

            themeButton.classList.add("theme-looping");
            themeButton.setAttribute("aria-busy", "true");

            /*
               Start the circular loop first, then change the theme
               while the loop is expanding across the page.
            */
            window.setTimeout(applyThemeChange, 180);

            window.setTimeout(() => {
                document.body.classList.remove(
                    "theme-transitioning",
                    "theme-loop-active"
                );

                themeButton.classList.remove("theme-looping");
                themeButton.removeAttribute("aria-busy");

                themeAnimationInProgress = false;
            }, 1650);
        });
    }

    /* 
       MOBILE NAVIGATION
       */

    if (menuButton && navLinks) {
        menuButton.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        document.querySelectorAll(".nav-links a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* 
       DISABLED LINKS
        */

    document.querySelectorAll("a.disabled").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
        });
    });

    /* 
       COPY EMAIL
        */

    if (copyEmailButton && copyMessage) {
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
    }

    /* 
       CURRENT YEAR
        */

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    /* 
       REVEAL ANIMATIONS
        */

    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }

    /* 
       INSTANT CURSOR-FOLLOWING AMBIENT LIGHT
        */

    const supportsFinePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;

    const reduceCursorMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (supportsFinePointer && !reduceCursorMotion) {
        const cursorLight = document.createElement("div");

        cursorLight.className = "cursor-light-gradient";
        cursorLight.setAttribute("aria-hidden", "true");
        document.body.appendChild(cursorLight);

        const glowRadius = 135;
        let hasMoved = false;

        /*
           There is no easing, interpolation, timeout, or animation frame.
           The glow is placed directly at the current pointer coordinates.
        */
        document.addEventListener("pointermove", (event) => {
            if (event.pointerType && event.pointerType !== "mouse") {
                return;
            }

            cursorLight.style.transform =
                `translate3d(` +
                `${event.clientX - glowRadius}px, ` +
                `${event.clientY - glowRadius}px, 0)`;

            if (!hasMoved) {
                hasMoved = true;
                cursorLight.classList.add("visible");
            }
        });

        document.addEventListener("pointerover", (event) => {
            const buttonElement = event.target.closest(
                "button, .button"
            );

            cursorLight.classList.toggle(
                "over-button",
                Boolean(buttonElement)
            );
        });

        document.addEventListener("pointerout", (event) => {
            const nextButtonElement = event.relatedTarget?.closest?.(
                "button, .button"
            );

            if (!nextButtonElement) {
                cursorLight.classList.remove("over-button");
            }
        });

        document.documentElement.addEventListener("mouseleave", () => {
            cursorLight.classList.remove("visible", "over-button");
        });

        document.documentElement.addEventListener("mouseenter", () => {
            if (hasMoved) {
                cursorLight.classList.add("visible");
            }
        });

        window.addEventListener("blur", () => {
            cursorLight.classList.remove("visible", "over-button");
        });
    }

    /* 
       LIQUID-GLASS BUTTON POINTER MOVEMENT
        */

    const liquidButtons = document.querySelectorAll(".button");
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!reduceMotion) {
        liquidButtons.forEach((button) => {
            let animationFrame = null;

            function resetLiquidButton() {
                button.style.setProperty("--liquid-shift-x", "0px");
                button.style.setProperty("--liquid-shift-y", "0px");
                button.style.setProperty("--liquid-rotate-x", "0deg");
                button.style.setProperty("--liquid-rotate-y", "0deg");
                button.style.setProperty("--liquid-light-x", "50%");
                button.style.setProperty("--liquid-light-y", "50%");
            }

            function updateLiquidButton(event) {
                const rect = button.getBoundingClientRect();

                if (rect.width === 0 || rect.height === 0) {
                    return;
                }

                const pointerX = Math.min(
                    1,
                    Math.max(0, (event.clientX - rect.left) / rect.width)
                );

                const pointerY = Math.min(
                    1,
                    Math.max(0, (event.clientY - rect.top) / rect.height)
                );

                const normalX = (pointerX - 0.5) * 2;
                const normalY = (pointerY - 0.5) * 2;

                button.style.setProperty(
                    "--liquid-shift-x",
                    `${(normalX * 7).toFixed(2)}px`
                );

                button.style.setProperty(
                    "--liquid-shift-y",
                    `${(normalY * 2.5).toFixed(2)}px`
                );

                button.style.setProperty(
                    "--liquid-rotate-x",
                    `${(-normalY * 3).toFixed(2)}deg`
                );

                button.style.setProperty(
                    "--liquid-rotate-y",
                    `${(normalX * 4).toFixed(2)}deg`
                );

                button.style.setProperty(
                    "--liquid-light-x",
                    `${(pointerX * 100).toFixed(1)}%`
                );

                button.style.setProperty(
                    "--liquid-light-y",
                    `${(pointerY * 100).toFixed(1)}%`
                );
            }

            button.addEventListener("pointermove", (event) => {
                if (
                    button.classList.contains("disabled") ||
                    button.hasAttribute("disabled")
                ) {
                    return;
                }

                if (animationFrame !== null) {
                    cancelAnimationFrame(animationFrame);
                }

                animationFrame = requestAnimationFrame(() => {
                    updateLiquidButton(event);
                    animationFrame = null;
                });
            });

            button.addEventListener("pointerleave", () => {
                if (animationFrame !== null) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }

                resetLiquidButton();
            });

            button.addEventListener("blur", resetLiquidButton);
        });
    }
});
