const CONTACT_FUNCTION =
    "https://fqcabbpvevtlzzwsvezi.supabase.co/functions/v1/send-contact-message";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contact-form");

    if (!form) {
        return;
    }

    const successElement =
        document.getElementById("contact-success");

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const button =
            form.querySelector("button[type='submit']");

        const originalButtonText =
            button.textContent;

        button.disabled = true;
        button.textContent = "Sending...";

        if (successElement) {
            successElement.textContent = "";
            successElement.classList.remove("error");
        }

        const formData =
            new FormData(form);

        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            message: formData.get("message"),
            _gotcha: formData.get("_gotcha")
        };

        try {

            const response =
                await fetch(
                    CONTACT_FUNCTION,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(data)
                    }
                );

            const result =
                await response.json();

            if (!response.ok || !result.success) {

                throw new Error(
                    result.error ||
                    "Unable to send your message."
                );

            }

            form.reset();

            if (successElement) {
                successElement.textContent =
                    "Your message has been sent! Thank you for reaching out. I'll get back to you soon.";
            }

        } catch (error) {

            console.error(
                "Contact form error:",
                error
            );

            if (successElement) {
                successElement.textContent =
                    "I'm sorry, but your message couldn't be sent right now. Please try again or call/text 208-557-4566.";
                
                successElement.classList.add("error");
            }

        } finally {

            button.disabled = false;
            button.textContent =
                originalButtonText;

        }

    });

});