# Remembr - Text Memorization Assistant

Remembr is a web application designed to help users memorize texts efficiently. Whether you're practicing speeches, studying for exams, learning scripts, or memorizing poetry, Remembr provides the tools to make the memorization process more effective.

## Features

- **Text Management**: Add, edit, delete, and search through your collection of texts
- **Practice Modes**: Memorize texts word by word or paragraph by paragraph with intuitive navigation
- **Progress Tracking**: Monitor your memorization progress with last practiced timestamps
- **User Authentication**: Secure user accounts with email and password
- **Responsive Design**: Works on desktop and mobile devices
- **PWA Support**: Install as a Progressive Web App for offline access
- **Dark/Light Theme**: Choose your preferred visual theme

## Technology Stack

- **Frontend**: Next.js 15, React, TailwindCSS
- **Backend**: Next.js API routes
- **Database**: SQLite
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with dark/light mode

## Getting Started

First, run the development server:

```bash
# Install dependencies
yarn install

# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/app`: Next.js application routes and pages
- `/components`: Reusable React components
- `/lib`: Utility functions and API helpers
  - `/api`: API utility functions
  - `/db`: Database connection and schema
- `/public`: Static assets

## Usage Guide

### Registration and Login

1. Create a new account via the registration page
2. Log in with your credentials
3. You'll be redirected to the dashboard

### Managing Texts

1. Add new texts from the dashboard or texts page
2. Edit or delete texts as needed
3. Browse your collection with the built-in search functionality

### Practice Mode

1. Select a text to practice
2. Choose word-by-word or paragraph-by-paragraph mode
3. Navigate through the text with the provided controls
4. Track your progress with timestamps

## Deployment Options

### Docker Deployment

See [DOCKER.md](DOCKER.md) for detailed instructions on deploying with Docker.

```bash
# Quick start with Docker
docker run -p 3000:3000 -v ./data:/data ghcr.io/YOUR_USERNAME/remembr:latest
```

### Manual Deployment

1. Clone the repository
2. Install dependencies: `yarn install`
3. Build the application: `yarn build`
4. Start the server: `yarn start`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org) - The React framework
- [NextAuth.js](https://next-auth.js.org) - Authentication for Next.js
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS framework
- [SQLite](https://sqlite.org) - Self-contained database
