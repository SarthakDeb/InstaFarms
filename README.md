# Full Stack User Management & Society App

A full-stack application designed for user profile management (create, edit, delete) with a social follow system. Users can view profiles, see follower/following counts. Features image uploads to AWS S3 and a custom authentication system.

## ✨ Features

* **User Authentication**: Secure signup and login using email and password.
* **User Profile Management**:
    * Create new user profiles with details like name, email, phone, date of birth, and profile image.
    * Edit existing user profiles.
    * Delete user profiles.
* **Dashboard / Society Page**:
    * View all user profiles stored in the database.
    * Display details including current age, profile picture, follower count, and following count.
    * Follow/Unfollow other users.
* **Image Uploads**: Profile images are uploaded to and served from AWS S3.
* **Dark/Light Mode**: Toggle between themes for user preference.
* **Responsive Design**: Styled with Tailwind CSS for a modern look across devices.
* **API**: Backend built with Express.js and PostgreSQL.

## 🛠️ Tech Stack

* **Frontend**:
    * React (with Vite)
    * Tailwind CSS (with JIT compilation via `@tailwindcss/vite`)
    * React Router DOM (for client-side routing)
    * Axios (for API calls)
    * `lucide-react` (for icons)
    * `framer-motion` (for basic animations)
    * `date-fns` (for date utilities)
* **Backend**:
    * Node.js
    * Express.js
    * PostgreSQL (SQL database)
    * `pg` (Node.js PostgreSQL client)
    * `bcryptjs` (for password hashing)
    * `jsonwebtoken` (for JWT-based authentication)
    * `aws-sdk` (v3 for S3 integration: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
* **Image Storage**: AWS S3

## 📂 Project Structure

The project is organized into two main directories:

* `/frontend`: Contains the React client-side application.
* `/server`: Contains the Express.js server-side application and API logic.

Each directory has its own `package.json` and `node_modules`.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/) (v18.x or later recommended)
* [npm](https://www.npmjs.com/) (usually comes with Node.js) or [Yarn](https://yarnpkg.com/)
* [PostgreSQL](https://www.postgresql.org/download/)
* An AWS Account with an S3 bucket configured.

## 🚀 Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/SarthakDeb/InstaFarms.git]
    cd YOUR_REPOSITORY_NAME
    ```

2.  **Backend Setup:**
    * Navigate to the backend directory:
        ```bash
        cd server
        ```
    * Install dependencies:
        ```bash
        npm install
        ```
    * **PostgreSQL Database Setup:**
        1.  Ensure PostgreSQL server is running.
        2.  Create a new database (e.g., `user_management_db`).
        3.  Create a PostgreSQL user with privileges to this database.
        4.  Execute the DDL commands below to create the necessary tables:
            <details>
            <summary><strong>Click to expand PostgreSQL Schema (DDL)</strong></summary>

            ```sql
            -- Table: users
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255), -- Made nullable for initial signup
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255), -- For hashed passwords
                phone VARCHAR(20),
                date_of_birth DATE,
                profile_image_url TEXT, -- Stores the URL from S3
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );

            -- Table: followers
            CREATE TABLE IF NOT EXISTS followers (
                follower_id INTEGER NOT NULL,
                following_id INTEGER NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (follower_id, following_id),
                CONSTRAINT fk_follower
                    FOREIGN KEY(follower_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_following
                    FOREIGN KEY(following_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            );

            -- Trigger to automatically update the updated_at timestamp on users table
            CREATE OR REPLACE FUNCTION trigger_set_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = NOW();
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER set_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION trigger_set_timestamp();

            -- Indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
            CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
            ```
            </details>

    * **Environment Variables (Backend):**
        1.  Copy the example environment file:
            ```bash
            cp .env.example .env
            ```
        2.  Open `server/.env` and fill in your actual credentials/values for:
            * `PORT`
            * `DB_USER`, `DB_HOST`, `DB_DATABASE`, `DB_PASSWORD`, `DB_PORT`
            * `JWT_SECRET` (use a strong random string), `JWT_EXPIRES_IN`
            * `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
            * Ensure your IAM user for these AWS keys has `s3:PutObject`, `s3:PutObjectAcl` (if making public), and `s3:DeleteObject` permissions for the specified bucket.

    * **AWS S3 Bucket CORS Configuration:**
        Your S3 bucket **must** have CORS configured to allow `PUT` requests from your frontend's origin (e.g., `http://localhost:5173` during development). See AWS documentation for how to set this up. An example CORS configuration is provided earlier in our discussion.

    * Start the backend server:
        ```bash
        npm run dev
        # or npm start
        ```
        The server should typically run on `http://localhost:3001`.

3.  **Frontend Setup:**
    * Navigate to the frontend directory (from the project root):
        ```bash
        cd ../frontend
        # or cd frontend if you are already in the root
        ```
    * Install dependencies:
        ```bash
        npm install
        ```
    * **Environment Variables (Frontend):**
        1.  Copy the example environment file:
            ```bash
            cp .env.example .env
            ```
        2.  Open `frontend/.env` and ensure `VITE_API_BASE_URL` is set correctly (e.g., `http://localhost:3001/api` if your backend runs on port 3001).

    * Start the frontend development server:
        ```bash
        npm run dev
        ```
        The frontend will typically run on `http://localhost:5173`.

## ⚙️ Environment Variables

### Backend (`server/.env`)

* `PORT`: Port for the backend server (e.g., `3001`).
* `DB_USER`: PostgreSQL username.
* `DB_HOST`: PostgreSQL host (e.g., `localhost`).
* `DB_DATABASE`: PostgreSQL database name.
* `DB_PASSWORD`: PostgreSQL user password.
* `DB_PORT`: PostgreSQL port (e.g., `5432`).
* `JWT_SECRET`: A strong secret key for signing JWTs.
* `JWT_EXPIRES_IN`: Token expiration time (e.g., `1d`, `7d`, `1h`).
* `AWS_ACCESS_KEY_ID`: Your AWS IAM user's access key ID.
* `AWS_SECRET_ACCESS_KEY`: Your AWS IAM user's secret access key.
* `AWS_REGION`: The AWS region where your S3 bucket is located (e.g., `us-east-1`).
* `S3_BUCKET_NAME`: The name of your AWS S3 bucket for image uploads.

### Frontend (`frontend/.env`)

* `VITE_API_BASE_URL`: The base URL for your backend API (e.g., `http://localhost:3001/api`).

## 🎨 Using the Application

1.  Navigate to the frontend URL in your browser.
2.  **Sign up** with an email and password.
3.  After signup/login, you'll be redirected.
4.  Go to your **Profile page** to update your name, date of birth, phone number, and profile picture.
5.  Visit the **Society page** to view other users and use the follow/unfollow functionality.
6.  Toggle **Dark/Light mode** using the theme switcher in the navbar.

## API Endpoints Overview

A brief overview of the main API endpoints (all prefixed with `/api`):

* **Auth:**
    * `POST /auth/signup`: Register a new user.
    * `POST /auth/login`: Log in an existing user.
* **Users:**
    * `GET /users`: Get all users.
    * `GET /users/:userId`: Get a specific user by ID.
    * `POST /users`: Create a new user profile (now primarily handled by signup, this might be for admin or future use).
    * `PUT /users/:userId`: Update a user's profile.
    * `DELETE /users/:userId`: Delete a user.
    * `POST /users/:userId/follow/:targetUserId`: Follow another user.
    * `DELETE /users/:userId/unfollow/:targetUserId`: Unfollow another user.
    * `GET /users/:userId/following`: Get users followed by a specific user.
    * `GET /users/:userId/followers`: Get followers of a specific user.
* **S3:**
    * `POST /s3/presigned-upload-url`: Get a pre-signed URL for uploading images to S3.

---
