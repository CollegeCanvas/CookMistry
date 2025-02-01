// Initialize AOS
AOS.init({
    duration: 800,
    once: true
});

// Preloader
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    preloader.classList.add('fade-out');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 1000);
});

// Typing Animation
function typeText(element, text, speed = 100) {
    let index = 0;
    element.innerHTML = '';
    
    function type() {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animations
document.querySelectorAll('.typing-effect').forEach(element => {
    const text = element.textContent;
    typeText(element, text);
});

// Counter Animation
const counters = document.querySelectorAll('.counter');
const counterSpeed = 200;

const animateCounter = (counter) => {
    const target = parseInt(counter.getAttribute('data-target'));
    let count = 0;
    const increment = target / counterSpeed;

    const updateCount = () => {
        if (count < target) {
            count += increment;
            counter.innerText = Math.ceil(count).toLocaleString();
            setTimeout(updateCount, 1);
        } else {
            counter.innerText = target.toLocaleString();
        }
    };

    updateCount();
};

// Trigger counter animation when in view
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

// Recipe Search and API Integration
class RecipeAPI {
    constructor() {
        this.searchInput = document.getElementById('recipeSearch');
        this.searchResultsGrid = document.getElementById('searchResultsGrid');
        this.featuredGrid = document.getElementById('featuredRecipes');
        this.setupEventListeners();
        this.loadFeaturedRecipes();
    }

    setupEventListeners() {
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const searchSection = document.getElementById('searchResults');
            
            if (!e.target.value.trim()) {
                searchSection.style.display = 'none';
                return;
            }
            
            searchSection.style.display = 'block';
            searchTimeout = setTimeout(() => {
                this.searchRecipes(e.target.value);
            }, 500);
        });

        // Event delegation for recipe details
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-recipe')) {
                const recipeId = e.target.getAttribute('data-recipe-id');
                if (recipeId) {
                    this.showRecipeDetails(recipeId);
                }
            }
        });
    }

    async searchRecipes(query) {
        if (!query) {
            this.searchResultsGrid.innerHTML = '';
            return;
        }

        this.showLoading(this.searchResultsGrid);
        try {
            const params = new URLSearchParams({
                ...config.DEFAULT_PARAMS,
                apiKey: config.API_KEY,
                query: query,
                addRecipeInformation: true,
                fillIngredients: true,
                instructionsRequired: true
            });

            const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.SEARCH}?${params}`);
            const data = await response.json();
            
            if (data.results.length === 0) {
                this.searchResultsGrid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <p>No recipes found for "${query}"</p>
                    </div>
                `;
                return;
            }
            
            this.displayRecipes(data.results, this.searchResultsGrid);
        } catch (error) {
            console.error('Error searching recipes:', error);
            this.showError('Failed to search recipes. Please try again.');
        }
        this.hideLoading(this.searchResultsGrid);
    }

    showLoading(container) {
        const spinner = container.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'flex';
    }

    hideLoading(container) {
        const spinner = container.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'none';
    }

    async showRecipeDetails(recipeId) {
        this.showLoading(document.querySelector('.recipes-grid'));
        try {
            const params = new URLSearchParams({
                apiKey: config.API_KEY,
                includeNutrition: true  // Make sure to request nutrition info
            });

            const response = await fetch(`${config.BASE_URL}/${recipeId}/information?${params}`);
            const recipe = await response.json();
            
            // Get nutrition data
            const nutrients = recipe.nutrition?.nutrients || [];
            const nutritionData = {
                calories: this.findNutrient(nutrients, 'Calories'),
                protein: this.findNutrient(nutrients, 'Protein'),
                carbs: this.findNutrient(nutrients, 'Carbohydrates'),
                fat: this.findNutrient(nutrients, 'Fat'),
                fiber: this.findNutrient(nutrients, 'Fiber'),
                sugar: this.findNutrient(nutrients, 'Sugar')
            };

            const existingModal = document.querySelector('.recipe-modal');
            if (existingModal) {
                existingModal.remove();
            }

            const modal = document.createElement('div');
            modal.className = 'recipe-modal';
            modal.innerHTML = `
                <div class="recipe-modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="recipe-modal-header">
                        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-hero-image">
                        <h2>${recipe.title}</h2>
                        <div class="recipe-stats">
                            <span><i class="far fa-clock"></i> ${recipe.readyInMinutes} mins</span>
                            <span><i class="fas fa-user"></i> ${recipe.servings} servings</span>
                            <span><i class="fas fa-fire"></i> ${recipe.healthScore} health score</span>
                        </div>
                    </div>
                    <div class="recipe-modal-body">
                        <div class="recipe-tags">
                            ${recipe.diets.map(diet => `<span class="recipe-tag">${diet}</span>`).join('')}
                            ${recipe.vegetarian ? '<span class="recipe-tag">Vegetarian</span>' : ''}
                            ${recipe.vegan ? '<span class="recipe-tag">Vegan</span>' : ''}
                            ${recipe.glutenFree ? '<span class="recipe-tag">Gluten Free</span>' : ''}
                        </div>
                        
                        <div class="recipe-section">
                            <h3><i class="fas fa-info-circle"></i> Description</h3>
                            <p>${recipe.summary}</p>
                        </div>

                        <div class="recipe-section">
                            <h3><i class="fas fa-chart-bar"></i> Nutrition Facts</h3>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <span class="nutrition-value">${nutritionData.calories?.amount?.toFixed(0) || 'N/A'}</span>
                                    <span class="nutrition-label">Calories</span>
                                </div>
                                <div class="nutrition-item">
                                    <span class="nutrition-value">${nutritionData.protein?.amount?.toFixed(2) || 'N/A'}g</span>
                                    <span class="nutrition-label">Protein</span>
                                </div>
                                <div class="nutrition-item">
                                    <span class="nutrition-value">${nutritionData.carbs?.amount?.toFixed(2) || 'N/A'}g</span>
                                    <span class="nutrition-label">Carbs</span>
                                </div>
                                <div class="nutrition-item">
                                    <span class="nutrition-value">${nutritionData.fat?.amount?.toFixed(2) || 'N/A'}g</span>
                                    <span class="nutrition-label">Fat</span>
                                </div>
                                <div class="nutrition-item">
                                    <span class="nutrition-value">${nutritionData.fiber?.amount?.toFixed(2) || 'N/A'}g</span>
                                    <span class="nutrition-label">Fiber</span>
                                </div>
                                <div class="nutrition-item">
                                    <span class="nutrition-value">${nutritionData.sugar?.amount?.toFixed(2) || 'N/A'}g</span>
                                    <span class="nutrition-label">Sugar</span>
                                </div>
                            </div>
                        </div>

                        <div class="recipe-section">
                            <h3><i class="fas fa-list"></i> Ingredients</h3>
                            <ul class="ingredients-list">
                                ${recipe.extendedIngredients.map(ing => `
                                    <li class="ingredient-item">
                                        ${ing.original}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <div class="recipe-section">
                            <h3><i class="fas fa-utensils"></i> Instructions</h3>
                            <ol class="instructions-list">
                                ${recipe.analyzedInstructions[0]?.steps.map(step => `
                                    <li class="instruction-step">
                                        ${step.step}
                                    </li>
                                `).join('') || '<li>No instructions available</li>'}
                            </ol>
                        </div>
                    </div>
                </div>
            `;

            // Add modal to the page
            document.body.appendChild(modal);

            // Add active class after a short delay to trigger animation
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);

            // Close button functionality
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = () => {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            };

            // Close on outside click
            modal.onclick = (event) => {
                if (event.target === modal) {
                    closeBtn.click();
                }
            };

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && document.querySelector('.recipe-modal')) {
                    closeBtn.click();
                }
            });

        } catch (error) {
            console.error('Error loading recipe details:', error);
            this.showError('Failed to load recipe details. Please try again.');
        }
        this.hideLoading(document.querySelector('.recipes-grid'));
    }
    findNutrient(nutrients, name) {
        return nutrients.find(n => n.name === name);
    }

    displayRecipes(recipes, container) {
        container.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" data-aos="fade-up">
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
                    <p>${recipe.summary ? this.stripHtml(recipe.summary).slice(0, 100) + '...' : ''}</p>
                    <div class="recipe-meta">
                        <span><i class="fas fa-user"></i> ${recipe.servings} servings</span>
                        <span><i class="fas fa-fire"></i> ${recipe.healthScore} health score</span>
                    </div>
                    <button class="view-recipe" data-recipe-id="${recipe.id}">View Recipe</button>
                </div>
            </div>
        `).join('');
    }

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
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

    showLoading() {
        document.querySelector('.loading-spinner').style.display = 'flex';
    }

    hideLoading() {
        document.querySelector('.loading-spinner').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
}
// Initialize Recipe API
const recipeAPI = new RecipeAPI();

// Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Animate hamburger menu
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = spans[0].style.transform === 'rotate(45deg) translate(6px, 6px)' ? '' : 'rotate(45deg) translate(6px, 6px)';
    spans[1].style.opacity = spans[1].style.opacity === '0' ? '1' : '0';
    spans[2].style.transform = spans[2].style.transform === 'rotate(-45deg) translate(6px, -6px)' ? '' : 'rotate(-45deg) translate(6px, -6px)';
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
            navLinks.classList.remove('active');
        }
    });
});

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input').value;
    if (email) {
        // Add success animation
        const button = newsletterForm.querySelector('button');
        button.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
        button.classList.add('success');
        
        setTimeout(() => {
            button.innerHTML = 'Subscribe';
            button.classList.remove('success');
            newsletterForm.reset();
        }, 3000);
    }
});

// Parallax Effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});