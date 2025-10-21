//chyba nowe
window.addEventListener("load", () => {
	document.getElementById("popup-card").classList.remove("hidden");
}); // chyba nowe
// 3D Business Card Interactive Logic

class BusinessCard3D {
	constructor() {
		this.isFlipped = false;
		this.isAnimating = false;
		this.touchStartX = 0;
		this.touchEndX = 0;

		this.init();
	}

	init() {
		this.setupEventListeners();
		this.initializeAnimations();
		this.setupPWA();
		this.createBackgroundAnimation();
	}

	setupEventListeners() {
		// Card flip events
		const cardContainer = document.getElementById("card-container");
		const navArrows = document.querySelectorAll(".nav-arrow");

		// Arrow navigation
		navArrows.forEach((arrow) => {
			arrow.addEventListener("click", (e) => {
				e.stopPropagation();
				this.flipCard();
			});
		});

		// Touch events for mobile
		cardContainer.addEventListener("touchstart", (e) => {
			this.touchStartX = e.changedTouches[0].screenX;
		});

		cardContainer.addEventListener("touchend", (e) => {
			this.touchEndX = e.changedTouches[0].screenX;
			this.handleSwipe();
		});

		// Keyboard navigation
		document.addEventListener("keydown", (e) => {
			if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				this.flipCard();
			}
		});

		// Auto-hide arrows on mobile
		this.setupResponsiveArrows();
	}

	handleSwipe() {
		const swipeThreshold = 50;
		const diff = this.touchStartX - this.touchEndX;

		if (Math.abs(diff) > swipeThreshold) {
			this.flipCard();
		}
	}

	flipCard() {
		if (this.isAnimating) return;

		this.isAnimating = true;
		const cardContainer = document.getElementById("card-container");

		// Add flip animation
		cardContainer.classList.toggle("flipped");
		this.isFlipped = !this.isFlipped;

		// Add haptic feedback for mobile
		if ("vibrate" in navigator) {
			navigator.vibrate(50);
		}

		// Reset animation flag
		setTimeout(() => {
			this.isAnimating = false;
		}, 600);

		// Animate card content
		this.animateCardContent();
	}

	animateCardContent() {
		const elements = this.isFlipped
			? document.querySelectorAll(".card-back *")
			: document.querySelectorAll(".card-front *");

		anime({
			targets: elements,
			opacity: [0, 1],
			translateY: [20, 0],
			delay: anime.stagger(100),
			duration: 600,
			easing: "easeOutQuart",
		});
	}

	initializeAnimations() {
		// Animate page load
		anime
			.timeline()
			.add({
				targets: ".header",
				opacity: [0, 1],
				translateY: [-30, 0],
				duration: 800,
				easing: "easeOutQuart",
			})
			.add(
				{
					targets: ".card-container",
					opacity: [0, 1],
					scale: [0.8, 1],
					duration: 1000,
					easing: "easeOutElastic(1, .8)",
				},
				"-=400"
			)
			.add(
				{
					targets: ".download-section",
					opacity: [0, 1],
					translateY: [30, 0],
					duration: 600,
					easing: "easeOutQuart",
				},
				"-=200"
			);

		// Floating animation for card
		this.setupFloatingAnimation();

		// Text splitting animation
		if (typeof Splitting !== "undefined") {
			Splitting();
		}
	}

	setupFloatingAnimation() {
		// Enhanced floating with mouse interaction
		const cardContainer = document.getElementById("card-container");

		document.addEventListener("mousemove", (e) => {
			if (window.innerWidth <= 768) return; // Disable on mobile

			const rect = cardContainer.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const rotateX = (e.clientY - centerY) / 20;
			const rotateY = (centerX - e.clientX) / 20;

			cardContainer.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
		});

		// Reset on mouse leave
		cardContainer.addEventListener("mouseleave", () => {
			cardContainer.style.transform = "";
		});
	}

	createBackgroundAnimation() {
		// Create subtle particle background using PIXI.js
		if (typeof PIXI === "undefined") return;

		const app = new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0x000000,
			backgroundAlpha: 0,
		});

		const bgContainer = document.getElementById("background-animation");
		bgContainer.appendChild(app.view);

		// Create particles
		const particles = [];
		const particleCount = 30;

		for (let i = 0; i < particleCount; i++) {
			const particle = new PIXI.Graphics();
			particle.beginFill(0xd4af37, 0.1);
			particle.drawCircle(0, 0, Math.random() * 3 + 1);
			particle.endFill();

			particle.x = Math.random() * app.screen.width;
			particle.y = Math.random() * app.screen.height;
			particle.vx = (Math.random() - 0.5) * 0.5;
			particle.vy = (Math.random() - 0.5) * 0.5;

			app.stage.addChild(particle);
			particles.push(particle);
		}

		// Animate particles
		app.ticker.add(() => {
			particles.forEach((particle) => {
				particle.x += particle.vx;
				particle.y += particle.vy;

				if (particle.x < 0) particle.x = app.screen.width;
				if (particle.x > app.screen.width) particle.x = 0;
				if (particle.y < 0) particle.y = app.screen.height;
				if (particle.y > app.screen.height) particle.y = 0;
			});
		});

		// Resize handler
		window.addEventListener("resize", () => {
			app.renderer.resize(window.innerWidth, window.innerHeight);
		});
	}

	setupResponsiveArrows() {
		const arrows = document.querySelectorAll(".nav-arrow");

		const checkMobile = () => {
			if (window.innerWidth <= 480) {
				arrows.forEach((arrow) => (arrow.style.display = "none"));
			} else {
				arrows.forEach((arrow) => (arrow.style.display = "block"));
			}
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
	}

	setupPWA() {
		// Register Service Worker
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("sw.js")
				.then((registration) => {
					console.log("SW registered: ", registration);
				})
				.catch((registrationError) => {
					console.log("SW registration failed: ", registrationError);
				});
		}

		// Handle app installation
		let deferredPrompt;

		window.addEventListener("beforeinstallprompt", (e) => {
			e.preventDefault(); // zapobiega automatycznemu pokazaniu
			deferredPrompt = e;
			console.log("App is installable");
		});
	}

	showInstallPromotion() {
		// You can add a custom install prompt here
		console.log("App is installable");
	}
}

// Contact functions
function callPhone() {
	window.location.href = "tel:+48123456789";
}

function sendEmail() {
	window.location.href = "mailto:jan@masazysta.pl?subject=Umówienie wizyty";
}

// Download app function
function downloadApp() {
	if (deferredPrompt) {
		deferredPrompt.prompt(); // pokazuje systemowy baner
		deferredPrompt.userChoice.then((choiceResult) => {
			if (choiceResult.outcome === "accepted") {
				console.log("Użytkownik zainstalował aplikację");
			} else {
				console.log("Użytkownik anulował instalację");
			}
			deferredPrompt = null;
		});
	} else {
		alert("Aplikacja już zainstalowana lub nie jest dostępna do instalacji.");
	}
}
function showiOSInstallInstructions() {
	const modal = createModal(`
        <h3>📱 Dodaj do ekranu głównego</h3>
        <ol style="text-align: left; padding-left: 20px;">
            <li>Naciśnij ikonę <strong>Udostępnij</strong> w przeglądarce</li>
            <li>Przewiń w dół i wybierz <strong>Dodaj do ekranu głównego</strong></li>
            <li>Naciśnij <strong>Dodaj</strong> w prawym górnym rogu</li>
        </ol>
        <p style="margin-top: 15px; font-size: 0.9rem; color: #666;">
            Wizytówka będzie dostępna jak zwykła aplikacja!
        </p>
    `);
	document.body.appendChild(modal);
}

function showInstallInstructions() {
	const modal = createModal(`
        <h3>📱 Pobierz aplikację</h3>
        <p>Aby pobrać wizytówkę na telefon:</p>
        <ol style="text-align: left; padding-left: 20px;">
            <li>Kliknij menu w przeglądarce (3 kropki)</li>
            <li>Wybierz "Zainstaluj aplikację" lub "Dodaj do ekranu głównego"</li>
            <li>Potwierdź instalację</li>
        </ol>
        <p style="margin-top: 15px; font-size: 0.9rem; color: #666;">
            Dzięki temu zawsze będziesz miał wizytówkę pod ręką!
        </p>
    `);
	document.body.appendChild(modal);
}

function createModal(content) {
	const modal = document.createElement("div");
	modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 20px;
    `;

	const modalContent = document.createElement("div");
	modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

	modalContent.innerHTML =
		content +
		`
        <button onclick="this.closest('.modal').remove()" 
                style="margin-top: 20px; padding: 10px 20px; background: #D4AF37; color: white; border: none; border-radius: 20px; cursor: pointer;">
            Zamknij
        </button>
    `;

	modal.className = "modal";
	modal.appendChild(modalContent);

	// Close on background click
	modal.addEventListener("click", (e) => {
		if (e.target === modal) {
			modal.remove();
		}
	});

	return modal;
}

// Utility functions
function showNotification(message, type = "info") {
	const notification = document.createElement("div");
	notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#4CAF50" : "#2196F3"};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
	notification.textContent = message;

	document.body.appendChild(notification);

	// Animate in
	setTimeout(() => {
		notification.style.transform = "translateX(0)";
	}, 100);

	// Remove after 3 seconds
	setTimeout(() => {
		notification.style.transform = "translateX(100%)";
		setTimeout(() => notification.remove(), 300);
	}, 3000);
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
	const businessCard = new BusinessCard3D();

	// Add some interactive effects
	const profileImage = document.querySelector(".profile-image");
	if (profileImage) {
		profileImage.addEventListener("click", () => {
			anime({
				targets: profileImage,
				scale: [1, 1.1, 1],
				duration: 300,
				easing: "easeInOutQuad",
			});
		});
	}

	// Add hover effects to buttons
	document.querySelectorAll(".btn").forEach((btn) => {
		btn.addEventListener("mouseenter", () => {
			anime({
				targets: btn,
				scale: 1.05,
				duration: 200,
				easing: "easeOutQuad",
			});
		});

		btn.addEventListener("mouseleave", () => {
			anime({
				targets: btn,
				scale: 1,
				duration: 200,
				easing: "easeOutQuad",
			});
		});
	});
});

// Export for global access
window.flipCard = () => {
	const card = document.getElementById("card-container");
	card.classList.toggle("flipped");
};
