# AquaCare Tracker

An elegant web application to help you track your aquarium cleaning schedules. It provides intelligent cleaning suggestions based on your tank's specifications, including fish, capacity, filtration, and plants, ensuring a healthy environment for your aquatic pets.

This project was built with React, TypeScript, and Tailwind CSS, and uses the Google Gemini API for intelligent suggestions.

## Features

- **Aquarium Management:** Add, edit, and delete multiple aquariums.
- **AI-Powered Scheduling:** Get intelligent cleaning and water change schedules based on your tank's parameters.
- **Task Tracking:** Easily mark cleaning and water changes as complete.
- **Visual Status:** At-a-glance status indicators for upcoming maintenance.
- **Responsive Design:** Works beautifully on desktop and mobile devices.
- **Offline Support:** Uses a service worker to provide basic functionality and data persistence even without an internet connection.

## Tech Stack

- **Framework:** React, TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **AI:** Google Gemini API
- **Offline Storage:** Browser Local Storage & Service Worker

## Prerequisites

- **Node.js:** Version 18.x or higher.
- **npm:** Included with Node.js.
- **Google Gemini API Key:** You can obtain one from [Google AI Studio](https://aistudio.google.com/).

## Environment Variables Setup

This application requires a Google Gemini API key.

1.  Create a file named `.env` in the root of the project directory.
2.  Add your API key to this file in the following format:

    ```
    VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

**Important:** The `.env` file is listed in `.gitignore` and should never be committed to version control to keep your API key secure.

## Local Development

To run the application on your local machine for development:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

This will start a local server, typically at `http://localhost:5173`, with hot-reloading enabled.

## Building for Production

To compile and bundle the application into static files for deployment:

1.  **Run the build command:**
    ```bash
    npm run build
    ```

This command will generate a `dist/` directory in the project root. This directory contains the optimized, static HTML, CSS, and JavaScript files for your application.

## Deployment to a Static Host

You can deploy the contents of the `dist/` directory to any static web host.

### General Deployment Instructions

1.  **Build the Project:** Run `npm run build` to create the `dist/` folder.
2.  **Configure Environment Variables:** In your hosting provider's settings (e.g., Vercel, Netlify, AWS Amplify), set the `VITE_API_KEY` environment variable. These platforms securely inject the variable during the build process.
3.  **Deploy the Output Directory:** Upload the contents of the `dist/` directory to your static hosting service.
4.  **Configure Rewrites/Redirects:** Since this is a SPA, you must configure your server to redirect all traffic to `index.html`. This allows client-side routing to function correctly.

## Example Deployments on Conventional Servers

If you are deploying to a traditional web server like Nginx or Apache, follow these steps:

1.  **Build the Project:** Generate the `dist/` folder by running `npm run build`.
2.  **Upload Files:** Copy the contents of the `dist/` folder to your server's web root (e.g., `/var/www/your-site`).
3.  **Handle API Key:** With a simple static server, you must use a build-time environment variable from your deployment pipeline or set up a server-side proxy to protect your API key. Exposing it directly in static files is not recommended.

### Example: Deploying to an Nginx Server

Create a server block configuration for your site.

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Path to your static files from the build command
    root /var/www/your-site; # This should point to where you uploaded the 'dist' contents
    index index.html;

    # SPA configuration: Route all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Example: Deploying to an Apache Server

For Apache, you can handle the SPA routing using `mod_rewrite`.

**Method 1: Using `.htaccess` (Recommended for shared hosting)**

1.  Ensure `mod_rewrite` is enabled on your server.
2.  Create a file named `.htaccess` in the same directory as your `index.html` (e.g., `/var/www/your-site/.htaccess`) with the following content:

    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule . /index.html [L]
    </IfModule>
    ```

**Method 2: Using VirtualHost Configuration (Recommended for VPS/dedicated servers)**

Edit your site's virtual host file.

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/your-site

    <Directory /var/www/your-site>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA Rewrite Rules
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

After saving, enable the site and restart Apache. With these steps, your AquaCare Tracker application will be successfully deployed.
