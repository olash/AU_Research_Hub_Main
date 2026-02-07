import { supabase } from './supabase.js';

// 3.1 Capture input
const searchInput = document.getElementById("globalSearchInput");
const resultsBox = document.getElementById("searchResults");

if (searchInput && resultsBox) {
    // 3.2 Listen for typing (debounced)
    let timeout;

    searchInput.addEventListener("input", () => {
        clearTimeout(timeout);

        const query = searchInput.value.trim();

        if (query.length < 2) {
            resultsBox.classList.add("hidden");
            resultsBox.innerHTML = "";
            return;
        }

        timeout = setTimeout(() => {
            runGlobalSearch(query);
        }, 300);
    });

    // 3.3 Global search function
    async function runGlobalSearch(query) {
        resultsBox.innerHTML = "<div class='search-item'>Searching...</div>";
        resultsBox.classList.remove("hidden");

        try {
            const [papers, gallery, initiatives, team] = await Promise.all([
                supabase
                    .from("papers")
                    .select("id, title")
                    .ilike("title", `%${query}%`)
                    .limit(5),

                supabase
                    .from("gallery")
                    .select("id, title")
                    .ilike("title", `%${query}%`)
                    .limit(5),

                supabase
                    .from("initiatives")
                    .select("id, title")
                    .ilike("title", `%${query}%`)
                    .limit(5),

                supabase
                    .from("team_members")
                    .select("id, name")
                    .ilike("name", `%${query}%`)
                    .limit(5)
            ]);

            renderResults([
                ...(papers.data || []).map(i => ({ ...i, type: "Paper", url: `/resources/?id=${i.id}` })),
                ...(gallery.data || []).map(i => ({ ...i, type: "Gallery", url: `/gallery/` })),
                ...(initiatives.data || []).map(i => ({ ...i, type: "Initiative", url: `/initiatives.html?id=${i.id}` })),
                ...(team.data || []).map(i => ({ ...i, query: i.name, type: "Team", url: `/#team-grid` }))
            ]);
        } catch (error) {
            console.error("Search error:", error);
            resultsBox.innerHTML = "<div class='search-item'>Error searching.</div>";
        }
    }

    // 3.4 Render results under the search bar
    function renderResults(items) {
        if (!items.length) {
            resultsBox.innerHTML = "<div class='search-item'>No results found</div>";
            return;
        }

        resultsBox.innerHTML = items.map(item => `
            <div class="search-item" onclick="window.location.href='${item.url}'">
                <div class="font-medium text-gray-900">${item.title || item.name}</div>
                <div class="search-type">${item.type}</div>
            </div>
        `).join("");
    }

    // STEP 4 — CLOSE SEARCH WHEN CLICKING AWAY
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
            resultsBox.classList.add("hidden");
        }
    });

} else {
    console.warn("Global search elements not found");
}
