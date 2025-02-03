// Initialize AOS
AOS.init({
    duration: 1200,
    once: true
});

class CategoryPage {
    constructor() {
        this.searchInput = document.getElementById('recipeSearch');
        this.resultsGrid = document.querySelector('.results-grid');
        this.featuredGrid = document.getElementById('featuredRecipes');
        this.categoryTags = document.querySelectorAll('.category-tag');
        this.currentCategory = window.location.pathname.split('/').pop().split('.')[0];
        
        this.setupEventListeners();
        this.loadFeaturedRecipes();
    }

    setupEventListeners() {
        // Search Input
        this.searchInput.addEventListener('input', this.debounce(() => {
            const query = this.searchInput.value;
            if (query.length > 2) {
                this.searchRecipes(query);
            }
        }, 500));

        // Category Tags
        this.categoryTags.forEach(tag => {
            tag.addEventListener('click', () => {
                this.categoryTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                this.searchRecipes('', tag.dataset.category);
            });
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async searchRecipes(query, tag = '') {
        try {
            const params = new URLSearchParams({
                apiKey: config.API_KEY,
                query: query,
                type: this.currentCategory,
                tag: tag,
                number: 9,
                addRecipeInformation: true
            });

            const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.SEARCH}?${params}`);
            const data = await response.json();

            if (data.results) {
                this.displayRecipes(data.results, this.resultsGrid);
            }
        } catch (error) {
            console.error('Error searching recipes:', error);
        }
    }

    async loadFeaturedRecipes() {
        try {
            const params = new URLSearchParams({
                apiKey: config.API_KEY,
                type: this.currentCategory,
                number: 9,
                addRecipeInformation: true,
                sort: 'popularity'
            });

            const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.SEARCH}?${params}`);
            const data = await response.json();

            if (data.results) {
                this.displayRecipes(data.results, this.featuredGrid);
            }
        } catch (error) {
            console.error('Error loading featured recipes:', error);
        }
    }

    displayRecipes(recipes, container) {
        container.innerHTML = recipes.map((recipe, index) => `
            <div class="recipe-card" style="animation-delay: ${index * 0.1}s">
                <div class="recipe-image">
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <div class="recipe-overlay">
                        <span class="time"><i class="far fa-clock"></i> ${recipe.readyInMinutes} mins</span>
                        <span class="difficulty ${this.getDifficultyClass(recipe.readyInMinutes)}">
                            ${this.getDifficulty(recipe.readyInMinutes)}
                        </span>
                    </div>
                </div>
                <div class="recipe-content">
                    <h3>${recipe.title}</h3>
                    <p>${recipe.summary ? recipe.summary.slice(0, 100).replace(/<[^>]*>/g, '') + '...' : ''}</p>
                    <div class="recipe-meta">
                        <span><i class="fas fa-user"></i> ${recipe.servings} servings</span>
                        <span><i class="fas fa-fire"></i> ${Math.round(recipe.calories || 0)} cal</span>
                    </div>
                    <button class="view-recipe" onclick="showRecipeDetails(${recipe.id})">View Recipe</button>
                </div>
            </div>
        `).join('');
    }

    getDifficulty(minutes) {
        if (minutes <= 30) return 'Easy';
        if (minutes <= 60) return 'Medium';
        return 'Hard';
    }

    getDifficultyClass(minutes) {
        if (minutes <= 30) return 'easy';
        if (minutes <= 60) return 'medium';
        return 'hard';
    }

    async showRecipeDetails(recipeId) {
        try {
            const params = new URLSearchParams({
                apiKey: config.API_KEY
            });

            const response = await fetch(`${config.BASE_URL}/${recipeId}/information?${params}`);
            const recipe = await response.json();

            const modal = document.createElement('div');
            modal.className = 'recipe-modal';
            modal.innerHTML = `
                <div class="modal-content" data-aos="fade-up">
                    <span class="close-modal">&times;</span>
                    <div class="recipe-detail-header">
                        <img src="${recipe.image}" alt="${recipe.title}">
                        <h2>${recipe.title}</h2>
                    </div>
                    <div class="recipe-info">
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>${recipe.readyInMinutes} mins</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <span>${recipe.servings} servings</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-fire"></i>
                            <span>${recipe.calories || 'N/A'} calories</span>
                        </div>
                    </div>
                    <div class="recipe-content">
                        <h3>Ingredients</h3>
                        <ul class="ingredients-list">
                            ${recipe.extendedIngredients.map(ing => `
                                <li>${ing.original}</li>
                            `).join('')}
                        </ul>
                        <h3>Instructions</h3>
                        <ol class="instructions-list">
                            ${recipe.analyzedInstructions[0]?.steps.map(step => `
                                <li>${step.step}</li>
                            `).join('') || 'No instructions available'}
                        </ol>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.close-modal').onclick = () => modal.remove();
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };
        } catch (error) {
            console.error('Error fetching recipe details:', error);
        }
    }
}

// Initialize the category page
const categoryPage = new CategoryPage();

// Make showRecipeDetails available globally
window.showRecipeDetails = (recipeId) => {
    categoryPage.showRecipeDetails(recipeId);
};