# Financial Results Dashboard

A backend system for managing and displaying financial results on investor relations pages.

## Features

- Upload financial result PDFs with metadata (year, quarter, website)
- Retrieve financial results for specific websites
- Secure file storage using Supabase
- RESTful API endpoints

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_STORAGE_BUCKET=financial-results
   JWT_SECRET=your_jwt_secret
   ```

4. Set up Supabase:
   - Create a new project
   - Create a storage bucket named `financial-results`
   - Create a table named `financial_results` with the following schema:
     ```sql
     create table financial_results (
       id uuid default uuid_generate_v4() primary key,
       year integer not null,
       quarter text not null,
       pdf_url text not null,
       website text not null,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
     );
     ```

5. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### GET /api/results
Query parameters:
- `site`: The website identifier (e.g., 'site1', 'site2')

Returns a list of financial results for the specified site.

### POST /api/upload
Upload a new financial result PDF.

Form data:
- `pdf`: The PDF file
- `year`: The year (e.g., 2024)
- `quarter`: The quarter (e.g., 'Q1', 'Q2', 'Q3', 'Q4')
- `website`: The website identifier ('site1', 'site2', or 'both')

## Development

The server uses nodemon for development, which automatically restarts when files change.

```bash
npm run dev
``` 