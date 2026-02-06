
import { supabase } from '../supabase.js';

const params = new URLSearchParams(window.location.search);
const query = params.get("q");

async function runSearch() {
    const resultsContainer = document.getElementById("searchResults");

    if (!query) {
        resultsContainer.innerHTML = `<p class="text-gray-500">Please enter a search term.</p>`;
        return;
    }

    const { data: papers, error } = await supabase
        .from("papers")
        .select("*")
        .ilike("title", `%${query}%`);

    if (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `<p class="text-red-500">Error fetching results.</p>`;
        return;
    }

    if (!papers || papers.length === 0) {
        resultsContainer.innerHTML = `<p class="text-gray-500">No results found for "${query}".</p>`;
        return;
    }

    // Clear loading message
    resultsContainer.innerHTML = '';

    // Show query title
    const title = document.querySelector('h1');
    if (title) title.innerHTML = `Search Results for "<span class="text-blue-600">${query}</span>"`;

    papers.forEach(paper => {
        const div = document.createElement("div");
        div.className = "bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300";

        div.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
            <span class="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
                ${paper.category || 'Paper'}
            </span>
            <h3 class="font-bold text-xl mb-2 text-gray-900 leading-tight">${paper.title}</h3>
            <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span><i class="fas fa-user mr-2"></i>${paper.author || 'Unknown'}</span>
                    <span><i class="fas fa-calendar mr-2"></i>${paper.date || 'No Date'}</span>
            </div>
        </div>
      </div>
      <a href="${paper.pdf_url}" target="_blank" class="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors">
        Read Paper <i class="fas fa-arrow-right ml-2 text-xs"></i>
      </a>
    `;

        resultsContainer.appendChild(div);
    });
}

runSearch();
