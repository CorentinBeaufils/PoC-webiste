// login.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Empêche l'envoi du formulaire de manière classique

        const email = document.getElementById("email").value;
        const mot_de_passe = document.getElementById("mot_de_passe").value;

        try {
            const response = await fetch("/connexion", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ email, mot_de_passe })
            });

            if (response.ok) {
                // Redirige vers la page /user en cas de succès
                window.location.href = "/customer";
            } else {
                const errorText = await response.text();
                alert("Erreur de connexion : " + errorText);
            }
        } catch (error) {
            console.error("Erreur lors de la tentative de connexion :", error);
            alert("Une erreur est survenue. Veuillez réessayer plus tard.");
        }
    });
});
