const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{13}$/, 'ISBN must be a 13-digit ISBN-13']
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 0
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator(value) {
        return value <= this.totalCopies;
      },
      message: 'Available copies cannot exceed total copies'
    }
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    required: true
  }
});

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);