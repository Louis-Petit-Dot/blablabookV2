export function mapOLSubjectsToGenres(subjects: string[]): string[] {
    const genreMap: Record<string, string> = {
        // Young Adult
        'juvenile fiction': 'Young Adult',
        'children\'s fiction': 'Young Adult',
        'school stories': 'Young Adult',
        'young adult': 'Young Adult',
        'teen fiction': 'Young Adult',

        // Horror
        'horror': 'Horror',
        'ghosts': 'Horror',
        'monsters': 'Horror',
        'supernatural': 'Horror',
        'vampires': 'Horror',
        'zombies': 'Horror',

        // Comedy
        'comedy': 'Comedy',
        'humor': 'Comedy',
        'humour': 'Comedy',
        'satire': 'Comedy',
        'parody': 'Comedy',

        // Drama
        'drama': 'Drama',
        'dramatic': 'Drama',
        'tragedy': 'Drama',

        // Adventure
        'adventure': 'Adventure',
        'action': 'Adventure',
        'survival': 'Adventure',

        // Poetry
        'poetry': 'Poetry',
        'poems': 'Poetry',
        'verse': 'Poetry',

        // Essay
        'essays': 'Essay',
        'reflections': 'Essay',
        'memoirs': 'Essay',
        'journalism': 'Essay',

        // Historical
        'historical': 'Historical',
        'history': 'Historical',
        'historical fiction': 'Historical',
        'period fiction': 'Historical',

        // Crime
        'crime': 'Crime',
        'detective': 'Crime',
        'murder': 'Crime',

        // Thriller
        'thriller': 'Thriller',
        'suspense': 'Thriller',
        'psychological thriller': 'Thriller',
        'spy': 'Thriller',
        'espionage': 'Thriller',

        // Policier
        'police': 'Policier',
        'detective fiction': 'Policier',
        'mystery': 'Policier',
        'noir': 'Policier',

        // Science-Fiction
        'science fiction': 'Science-Fiction',
        'sci-fi': 'Science-Fiction',
        'futuristic': 'Science-Fiction',
        'space opera': 'Science-Fiction',
        'dystopian': 'Science-Fiction',
        'cyberpunk': 'Science-Fiction',

        // Fantasy
        'fantasy': 'Fantasy',
        'magic': 'Fantasy',
        'wizards': 'Fantasy',
        'witches': 'Fantasy',
        'mythology': 'Fantasy',
        'fairy tales': 'Fantasy',
        'epic fantasy': 'Fantasy',

        // Romance
        'romance': 'Romance',
        'love stories': 'Romance',
        'romantic': 'Romance',
        'chick lit': 'Romance',

        // Biographie
        'biography': 'Biographie',
        'autobiography': 'Biographie',
        'biographical': 'Biographie',
        'life stories': 'Biographie',

        // Développement personnel
        'self-help': 'Développement personnel',
        'personal development': 'Développement personnel',
        'motivation': 'Développement personnel',
        'psychology': 'Développement personnel',
        'mental health': 'Développement personnel',

        // Philosophie
        'philosophy': 'Philosophie',
        'philosophical': 'Philosophie',
        'ethics': 'Philosophie',
        'metaphysics': 'Philosophie',

        // Religion
        'religion': 'Religion',
        'religious': 'Religion',
        'spirituality': 'Religion',
        'theology': 'Religion',
        'bible': 'Religion',

        // Art
        'art': 'Art',
        'painting': 'Art',
        'sculpture': 'Art',
        'photography': 'Art',
        'design': 'Art',
        'architecture': 'Art',

        // Cuisine
        'cooking': 'Cuisine',
        'recipes': 'Cuisine',
        'food': 'Cuisine',
        'culinary': 'Cuisine',
        'gastronomy': 'Cuisine',

        // Voyage
        'travel': 'Voyage',
        'tourism': 'Voyage',
        'geography': 'Voyage',
        'exploration': 'Voyage',

        // Santé
        'health': 'Santé',
        'medicine': 'Santé',
        'fitness': 'Santé',
        'nutrition': 'Santé',
        'wellness': 'Santé',

        // Business
        'business': 'Business',
        'economics': 'Business',
        'finance': 'Business',
        'entrepreneurship': 'Business',
        'management': 'Business',

        // Sciences
        'science': 'Sciences',
        'physics': 'Sciences',
        'biology': 'Sciences',
        'chemistry': 'Sciences',
        'mathematics': 'Sciences',
        'technology': 'Sciences',
        'computer science': 'Sciences'
    };

    const mappedGenres = new Set<string>();

    subjects.forEach(subject => {
        const normalized = subject.toLowerCase().trim();
        const genre = genreMap[normalized] || 'Divers';
        mappedGenres.add(genre);
    });

    return Array.from(mappedGenres);
}