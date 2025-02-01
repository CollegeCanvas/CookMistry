// Spoonacular API Configuration
const config = {
    API_KEY: 'de436fdde4a94f7587fe5e3d6d73c36c', // Replace with your API key
    BASE_URL: 'https://api.spoonacular.com/recipes',
    ENDPOINTS: {
        SEARCH: '/complexSearch',
        RANDOM: '/random',
        INFORMATION: '/information'
    },
    DEFAULT_PARAMS: {
        number: 9,
        addRecipeInformation: true,
        fillIngredients: true
    }
};

// Recipe Categories
const categories = [
    { id: 'breakfast', name: 'Breakfast', type: 'meal', count: 42, image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666', description: 'Start your day with our delicious breakfast recipes' },
    { id: 'main-course', name: 'Main Course', type: 'meal', count: 156, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', description: 'Explore our diverse collection of main course dishes' },
    { id: 'appetizers', name: 'Appetizers', type: 'meal', count: 89, image: 'https://images.unsplash.com/photo-1541529086526-db283c563270', description: 'Delightful small bites to start your meal' },
    { id: 'desserts', name: 'Desserts', type: 'meal', count: 128, image: 'https://images.unsplash.com/photo-1488477304112-4944851de03d', description: 'Sweet treats and indulgent desserts for every occasion' },
    { id: 'healthy', name: 'Healthy', type: 'diet', count: 94, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', description: 'Nutritious and wholesome recipes for a healthy lifestyle' },
    { id: 'quick-easy', name: 'Quick & Easy', type: 'meal', count: 73, image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352', description: 'Fast and simple recipes ready in 30 minutes or less' }
];