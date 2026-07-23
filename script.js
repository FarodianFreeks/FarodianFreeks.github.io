document.addEventListener("DOMContentLoaded", () => {
    const themeButton = document.getElementById("themeButton");
    const menuButton = document.getElementById("menuButton");
    const navLinks = document.getElementById("navLinks");
    const navScrim = document.getElementById("navScrim");
    const copyEmailButton = document.getElementById("copyEmail");
    const copyMessage = document.getElementById("copyMessage");
    const currentYear = document.getElementById("currentYear");

    /* Theme */

    function readSavedTheme() {
        try {
            return window.localStorage.getItem("farodian-theme");
        } catch (error) {
            return null;
        }
    }

    function saveTheme(theme) {
        try {
            window.localStorage.setItem("farodian-theme", theme);
        } catch (error) {
            /* The theme still works when storage is unavailable. */
        }
    }

    const savedTheme = readSavedTheme();
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

                saveTheme(
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

    /* Mobile Navigation */

    if (menuButton && navLinks) {
        const mobileNavQuery = window.matchMedia("(max-width: 700px)");
        const navItems = Array.from(navLinks.querySelectorAll("a[href^='#']"));
        let scrimTimer = null;

        function setScrimVisibility(visible) {
            if (!navScrim) {
                return;
            }

            if (scrimTimer !== null) {
                window.clearTimeout(scrimTimer);
                scrimTimer = null;
            }

            if (visible) {
                navScrim.hidden = false;
                window.requestAnimationFrame(() => {
                    navScrim.classList.add("is-visible");
                });
                return;
            }

            navScrim.classList.remove("is-visible");
            scrimTimer = window.setTimeout(() => {
                navScrim.hidden = true;
                scrimTimer = null;
            }, 290);
        }

        function setMenuState(open, restoreFocus) {
            const shouldOpen = Boolean(open && mobileNavQuery.matches);

            navLinks.classList.toggle("open", shouldOpen);

            if (mobileNavQuery.matches) {
                navLinks.setAttribute("aria-hidden", String(!shouldOpen));
            } else {
                navLinks.removeAttribute("aria-hidden");
            }

            menuButton.setAttribute("aria-expanded", String(shouldOpen));
            menuButton.setAttribute(
                "aria-label",
                shouldOpen ? "Close navigation" : "Open navigation"
            );
            document.body.classList.toggle("menu-open", shouldOpen);
            setScrimVisibility(shouldOpen);

            if (shouldOpen) {
                window.setTimeout(() => {
                    if (navItems[0]) {
                        try {
                            navItems[0].focus({ preventScroll: true });
                        } catch (error) {
                            navItems[0].focus();
                        }
                    }
                }, 180);
            } else if (restoreFocus) {
                menuButton.focus();
            }
        }

        menuButton.addEventListener("click", () => {
            const isOpen = menuButton.getAttribute("aria-expanded") === "true";
            setMenuState(!isOpen, false);
        });

        if (navScrim) {
            navScrim.addEventListener("click", () => {
                setMenuState(false, true);
            });
        }

        navItems.forEach((link) => {
            link.addEventListener("click", () => {
                const targetSelector = link.getAttribute("href");
                const target = targetSelector
                    ? document.querySelector(targetSelector)
                    : null;

                setMenuState(false, false);

                if (target && mobileNavQuery.matches) {
                    window.setTimeout(() => {
                        const hadTabIndex = target.hasAttribute("tabindex");

                        if (!hadTabIndex) {
                            target.setAttribute("tabindex", "-1");
                        }

                        try {
                            target.focus({ preventScroll: true });
                        } catch (error) {
                            target.focus();
                        }

                        if (!hadTabIndex) {
                            target.addEventListener(
                                "blur",
                                () => target.removeAttribute("tabindex"),
                                { once: true }
                            );
                        }
                    }, 340);
                }
            });
        });

        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                menuButton.getAttribute("aria-expanded") === "true"
            ) {
                setMenuState(false, true);
            }
        });

        function handleMobileNavChange(event) {
            if (!event.matches) {
                setMenuState(false, false);
                navLinks.removeAttribute("aria-hidden");
            } else {
                navLinks.setAttribute(
                    "aria-hidden",
                    String(menuButton.getAttribute("aria-expanded") !== "true")
                );
            }
        }

        if (typeof mobileNavQuery.addEventListener === "function") {
            mobileNavQuery.addEventListener("change", handleMobileNavChange);
        } else if (typeof mobileNavQuery.addListener === "function") {
            mobileNavQuery.addListener(handleMobileNavChange);
        }

        handleMobileNavChange(mobileNavQuery);

        const sections = navItems
            .map((link) => {
                const target = document.querySelector(link.getAttribute("href"));
                return target ? { link, target } : null;
            })
            .filter(Boolean);

        if ("IntersectionObserver" in window && sections.length > 0) {
            const activeLinkObserver = new IntersectionObserver(
                (entries) => {
                    const visibleEntries = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                    if (visibleEntries.length === 0) {
                        return;
                    }

                    const activeId = visibleEntries[0].target.id;

                    sections.forEach(({ link, target }) => {
                        if (target.id === activeId) {
                            link.setAttribute("aria-current", "page");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                },
                {
                    rootMargin: "-24% 0px -62% 0px",
                    threshold: [0.01, 0.2, 0.5]
                }
            );

            sections.forEach(({ target }) => activeLinkObserver.observe(target));
        }
    }

    /* Disabled Links */

    document.querySelectorAll("a.disabled").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
        });
    });

    /* Copy Email Button */

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

    /* Current Year */

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    /* Animation reveals */

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

    /* Instant Cursor Light */

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
            const relatedTarget = event.relatedTarget;
            const nextButtonElement = relatedTarget &&
                typeof relatedTarget.closest === "function"
                ? relatedTarget.closest("button, .button")
                : null;

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

    /* Liquid Buttons */

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
