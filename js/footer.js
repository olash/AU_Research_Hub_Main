import { supabase } from '../supabase.js';

// Load Footer Content (Random Initiative & Random Papers)
async function loadFooterContent() {
    const initiativeCard = document.getElementById("initiativeCard");
    const paperCards = document.getElementById("paperCards");

    try {
        // Fetch Initiatives
        const { data: initiatives, error: initError } = await supabase
            .from("initiatives")
            .select("title, cover_image, location, year")
        // .eq("published", true); // Removing filter for now to ensure data shows

        if (initError) console.error("Footer Initiatives Error:", initError);

        if (initiatives && initiatives.length > 0) {
            const item = initiatives[Math.floor(Math.random() * initiatives.length)];

            // Ensure image url is valid
            const imgUrl = item.cover_image || '/images/default-paper.jpg'; // Fallback

            if (initiativeCard) {
                initiativeCard.innerHTML = `
            <img src="${imgUrl}" alt="${item.title}" />
            <div style="padding:12px">
                <strong style="display:block; margin-bottom:4px; line-height:1.2;">${item.title}</strong>
                <small style="color:gray;">${item.location || 'Location'} • ${item.year || 'Year'}</small>
            </div>
            `;
                initiativeCard.classList.remove("hidden");
            }
        }

        // Fetch Papers
        const { data: papers, error: paperError } = await supabase
            .from("papers")
            .select("title, cover_image")
        // .eq("published", true); // Removing filter for now

        if (paperError) console.error("Footer Papers Error:", paperError);

        if (papers && papers.length > 0 && paperCards) {
            paperCards.innerHTML = papers
                .sort(() => 0.5 - Math.random())
                .slice(0, 2)
                .map(p => `
            <div class="footer-paper">
              <img src="${p.cover_image || '/images/default-paper.jpg'}" alt="${p.title}" />
              <div style="padding:12px">
                <strong style="display:block; line-height:1.2;">${p.title}</strong>
              </div>
            </div>
          `)
                .join("");

            paperCards.classList.remove("hidden");
        }
    } catch (err) {
        console.error("Error loading footer content:", err);
    }
}

// Newsletter Logic
function setupNewsletter() {
    const form = document.getElementById("newsletterForm");
    const input = document.getElementById("newsletterEmail");

    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const email = input.value.trim().toLowerCase();
        if (!email) return;

        const { error } = await supabase
            .from("newsletter_subscribers")
            .insert([{ email }]);

        if (error) {
            // Check for duplicate key error (code 23505 in Postgres)
            if (error.code === '23505') {
                alert("You are already subscribed.");
            } else {
                console.error("Newsletter Error:", error);
                alert("Failed to subscribe. Please try again.");
            }
        } else {
            alert("Subscribed successfully!");
            input.value = "";
        }
    });
}

// Initialize Footer
// Initialize Footer
document.addEventListener("DOMContentLoaded", () => {
    const footerContainer = document.getElementById("footer");
    if (!footerContainer) return;

    fetch("/components/footer.html")
        .then(res => res.text())
        .then(html => {
            footerContainer.innerHTML = html;
            loadFooterContent();
            setupNewsletter();
        })
        .catch(err => console.error("Failed to load footer HTML:", err));
});
