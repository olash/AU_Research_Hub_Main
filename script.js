import { supabase } from './supabase.js';

// Mobile menu functionality
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuOverlay = document.getElementById('menu-overlay');

function openMenu() {
    mobileMenu.classList.add('open');
    menuOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    mobileMenu.classList.remove('open');
    menuOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
        closeMenu();
    }
});

// Close menu when clicking on menu links (for single page navigation)
if (mobileMenu) {
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mobileMenu && mobileMenu.classList.contains('open')) {
        closeMenu();
    }
});

// Fade In Effect
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".fade-in-section");

    const observerOptions = {
        root: null, // Use the viewport as the root
        rootMargin: "0px", // No margin around the root
        threshold: 0.1 // Trigger when 10% of the element is visible/invisible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If element is entering the viewport
                entry.target.classList.add("is-visible");
            } else {
                // If element is leaving the viewport
                entry.target.classList.remove("is-visible");
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Popup Modal Logic ---
    (async function initPopup() {
        const modal = document.getElementById('popup-modal');
        if (!modal) return;

        const closeBtn = document.getElementById('close-popup');
        const img = document.getElementById('popup-image');
        const title = document.getElementById('popup-title');
        const desc = document.getElementById('popup-desc');
        const btn = document.getElementById('popup-btn');
        const btnText = document.getElementById('popup-btn-text');

        if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });

        try {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .eq('is_active', true)
                .single(); // Returns single object or null

            if (error || !data) {
                // No active banner
                return;
            }

            // Populate Modal
            if (img) img.src = data.image_url;
            if (title) title.textContent = data.title;
            if (desc) desc.textContent = data.description;

            // Handle Button
            if (btn && data.button_url) {
                btn.href = data.button_url;
                if (btnText) btnText.textContent = data.button_text || 'Learn More';
                btn.classList.remove('hidden');
            } else if (btn) {
                btn.classList.add('hidden');
            }

            // Show modal
            modal.classList.remove('hidden');

        } catch (err) {
            console.error('Error fetching popup:', err);
        }
    })();
});

// --- Global Live Search Logic ---
const openSearchBtn = document.getElementById("openSearch");
const searchModal = document.getElementById("searchModal");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

if (openSearchBtn && searchModal && searchInput && searchResults) {
    // Open Logic
    openSearchBtn.addEventListener("click", () => {
        searchModal.classList.remove("hidden");
        searchInput.value = "";
        searchResults.innerHTML = "";
        searchInput.focus();
    });

    // Close Logic
    searchModal.addEventListener("click", (e) => {
        if (e.target === searchModal) {
            searchModal.classList.add("hidden");
        }
    });

    // Live Search Typing Logic
    let searchTimeout;

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();

        clearTimeout(searchTimeout);

        if (query.length < 2) {
            searchResults.innerHTML = "";
            return;
        }

        // debounce (prevents spam requests)
        searchTimeout = setTimeout(() => {
            runGlobalSearch(query);
        }, 300);
    });

    // Run Search against Supabase
    async function runGlobalSearch(query) {
        searchResults.innerHTML = `
        <div class="px-6 py-4 text-sm text-gray-500">
          Searching...
        </div>
      `;

        try {
            const [papersRes, galleryRes] = await Promise.all([
                supabase
                    .from("papers")
                    .select("id, title, author, pdf_url")
                    .ilike("title", `%${query}%`)
                    .limit(5),

                supabase
                    .from("gallery")
                    .select("id, image_url, caption")
                    .ilike("caption", `%${query}%`)
                    .limit(5)
            ]);

            renderSearchResults(papersRes.data || [], galleryRes.data || []);
        } catch (err) {
            console.error("Search failed:", err);
            searchResults.innerHTML = `<div class="px-6 py-4 text-sm text-red-500">Search failed. Please try again.</div>`;
        }
    }

    // Render Results
    function renderSearchResults(papers, gallery) {
        searchResults.innerHTML = "";

        if (papers.length === 0 && gallery.length === 0) {
            searchResults.innerHTML = `
          <div class="px-6 py-6 text-sm text-gray-500">
            No results found
          </div>
        `;
            return;
        }

        // PAPERS
        if (papers.length > 0) {
            const section = document.createElement("div");

            section.innerHTML = `
          <div class="px-6 py-3 text-xs uppercase text-gray-400 bg-gray-50 font-semibold tracking-wider">
            Papers
          </div>
        `;

            papers.forEach(paper => {
                section.innerHTML += `
            <a href="${paper.pdf_url}" target="_blank" class="block px-6 py-4 hover:bg-blue-50 transition-colors group">
              <div class="font-medium text-gray-900 group-hover:text-blue-700">${paper.title}</div>
              <div class="text-sm text-gray-500">${paper.author || 'Unknown Author'}</div>
            </a>
          `;
            });

            searchResults.appendChild(section);
        }

        // GALLERY
        if (gallery.length > 0) {
            const section = document.createElement("div");

            section.innerHTML = `
          <div class="px-6 py-3 text-xs uppercase text-gray-400 bg-gray-50 font-semibold tracking-wider">
            Gallery
          </div>
        `;

            gallery.forEach(item => {
                section.innerHTML += `
            <div class="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors cursor-default">
              <img
                src="${item.image_url}"
                class="w-12 h-12 object-cover rounded-lg shadow-sm"
              />
              <div class="text-sm text-gray-700">
                ${item.caption || "Gallery image"}
              </div>
            </div>
          `;
            });

            searchResults.appendChild(section);
        }
    }
}

// --- Newsletter Subscription Logic ---
const newsletterEmail = document.getElementById("newsletter-email");
const newsletterSubmit = document.getElementById("newsletter-submit");

if (newsletterEmail && newsletterSubmit) {
    newsletterSubmit.addEventListener("click", async () => {
        const email = newsletterEmail.value.trim();
        const originalText = newsletterSubmit.innerHTML;

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        newsletterSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        newsletterSubmit.disabled = true;

        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email }]);

            if (error) {
                // Check specifically for unique violation (code 23505)
                if (error.code === '23505') {
                    alert("You are already subscribed!");
                } else {
                    console.error("Subscription error detail:", error);
                    alert("Failed to subscribe (Database Error).");
                }
            } else {
                alert("Successfully subscribed to the newsletter!");
                newsletterEmail.value = "";
            }
        } catch (err) {
            console.error("Subscription exception:", err);
            alert("Failed to subscribe. Please try again.");
        } finally {
            newsletterSubmit.innerHTML = originalText;
            newsletterSubmit.disabled = false;
        }
    });
}