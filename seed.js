require('dotenv').config();

const mongoose = require('mongoose');
const Book = require('./models/Book');
const Genre = require('./models/Genre');

const genreData = [
  { name: 'Science Fiction', slug: 'science-fiction' },
  { name: 'Mystery', slug: 'mystery' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Historical Fiction', slug: 'historical-fiction' }
];

const bookData = [
  {
    title: 'The Glass Horizon',
    author: 'Mara Venn',
    genre: 'science-fiction',
    description: 'A survey pilot discovers a habitable world hidden behind a permanent storm.',
    totalCopies: 6,
    availableCopies: 4
  },
  {
    title: 'Signal at Europa',
    author: 'Jonas Reed',
    genre: 'science-fiction',
    description: 'A deep-space research crew investigates a repeating signal beneath Europa ice.',
    totalCopies: 4,
    availableCopies: 4
  },
  {
    title: 'The Memory Engine',
    author: 'Nia Calder',
    genre: 'science-fiction',
    description: 'In a city where memories can be traded, one archivist finds a memory that is not hers.',
    totalCopies: 5,
    availableCopies: 2
  },
  {
    title: 'Orbit of Ash',
    author: 'Peter Sol',
    genre: 'science-fiction',
    description: 'Two rival engineers race to repair a failing habitat before its orbit decays.',
    totalCopies: 3,
    availableCopies: 1
  },
  {
    title: 'A Map of Quiet Streets',
    author: 'Elena March',
    genre: 'mystery',
    description: 'A cartographer follows a trail of altered street maps through a coastal town.',
    totalCopies: 7,
    availableCopies: 5
  },
  {
    title: 'The Last Bell at Wren House',
    author: 'Caleb North',
    genre: 'mystery',
    description: 'A winter guest list becomes the key to a locked-room disappearance.',
    totalCopies: 4,
    availableCopies: 3
  },
  {
    title: 'Murder in the Reading Room',
    author: 'Sophie Vale',
    genre: 'mystery',
    description: 'A library assistant deciphers marginal notes to solve a decades-old crime.',
    totalCopies: 5,
    availableCopies: 5
  },
  {
    title: 'The Clockmaker’s Alibi',
    author: 'David Rook',
    genre: 'mystery',
    description: 'A detective tests the timeline behind a clockmaker’s impossible alibi.',
    totalCopies: 3,
    availableCopies: 0
  },
  {
    title: 'The Orchard of Small Stars',
    author: 'Liora Fen',
    genre: 'fantasy',
    description: 'A young gardener tends a celestial orchard whose fruit predicts the future.',
    totalCopies: 6,
    availableCopies: 6
  },
  {
    title: 'Beneath the Briar Crown',
    author: 'Thomas Wren',
    genre: 'fantasy',
    description: 'An apprentice mapmaker enters an enchanted forest to reclaim a stolen crown.',
    totalCopies: 5,
    availableCopies: 3
  },
  {
    title: 'The River That Remembers',
    author: 'Amira Solenne',
    genre: 'fantasy',
    description: 'A ferryman must bargain with a river that remembers every promise ever made.',
    totalCopies: 4,
    availableCopies: 2
  },
  {
    title: 'Lanterns of the Deep Vale',
    author: 'Gareth Ives',
    genre: 'fantasy',
    description: 'A village’s lantern keeper discovers a hidden road between the living and the lost.',
    totalCopies: 3,
    availableCopies: 3
  },
  {
    title: 'The Indigo Dispatch',
    author: 'Clara West',
    genre: 'historical-fiction',
    description: 'A wartime courier carries a coded letter across occupied countryside.',
    totalCopies: 6,
    availableCopies: 4
  },
  {
    title: 'Winter at Bell Foundry',
    author: 'Marcus Hale',
    genre: 'historical-fiction',
    description: 'A family of foundry workers rebuilds their lives in an industrial city in 1892.',
    totalCopies: 4,
    availableCopies: 1
  },
  {
    title: 'Letters from the Salt Road',
    author: 'Ruth Ellery',
    genre: 'historical-fiction',
    description: 'A traveling apothecary records the changing fortunes of towns along an old trade route.',
    totalCopies: 5,
    availableCopies: 5
  },
  {
    title: 'The Seamstress of Alder Square',
    author: 'Isabel Crowe',
    genre: 'historical-fiction',
    description: 'A seamstress in 1920s London pieces together a family secret from a coat lining.',
    totalCopies: 3,
    availableCopies: 2
  }
];

function makeIsbn13(prefix) {
  const weightedSum = [...prefix].reduce((sum, digit, index) => {
    return sum + Number(digit) * (index % 2 === 0 ? 1 : 3);
  }, 0);
  const checkDigit = (10 - (weightedSum % 10)) % 10;
  return `${prefix}${checkDigit}`;
}

async function seed() {
  const { MONGODB_URI: mongoUri } = process.env;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required. Copy .env.example to .env and set your connection string.');
  }

  try {
    await mongoose.connect(mongoUri);
    await Book.deleteMany({});
    await Genre.deleteMany({});

    const genres = await Genre.insertMany(genreData);
    const genreIds = new Map(genres.map((genre) => [genre.slug, genre._id]));
    const books = bookData.map((book, index) => {
      if (book.availableCopies > book.totalCopies) {
        throw new Error(`Invalid copy counts for "${book.title}"`);
      }

      const isbnPrefix = `9781000000${String(index + 1).padStart(2, '0')}`;
      return {
        ...book,
        isbn: makeIsbn13(isbnPrefix),
        coverImage: `https://covers.openlibrary.org/b/isbn/${makeIsbn13(isbnPrefix)}-L.jpg`,
        genre: genreIds.get(book.genre)
      };
    });

    await Book.insertMany(books);
    console.log(`Seeded ${genres.length} genres and ${books.length} books.`);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error('Catalog seeding failed:', error.message);
  process.exitCode = 1;
});