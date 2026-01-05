# Cook With Ashi

**Cook With Ashi** is a React-based food ordering website for a homemade lunch delivery service.  
Customers can place orders easily, while admins can manage and confirm orders through a simple dashboard.

---

## Features

- Place daily meal orders with name, address, phone, and meal selection
- Admin dashboard to view orders from the last 3 days
- Pending orders can be confirmed by admin
- Clean and responsive design for mobile and desktop
- Simple, user-friendly interface for customers and admins

---

## Tech Stack

- React (Vite)
- JavaScript (ES6+)
- CSS for styling
- React Router for page navigation

---

## Project Structure

cook-with-ashi/
├─ public/
├─ src/
│ ├─ components/
│ ├─ App.jsx
│ ├─ main.jsx
│ └─ ...
├─ .gitignore
├─ package.json
└─ README.md

---

## How to Run Locally

1. Clone the repository:

git clone https://github.com/nathasha-nethmini/Cook-with-Ashi.git

2. Navigate into the project folder:

cd cook-with-ashi

3. Install dependencies:

npm install

4. Start the development server:

npm run dev

5. Open your browser at:

http://localhost:5173

## Notes

- Make sure to create a `.env` file in the root folder for admin credentials:

VITE_ADMIN_USER=yourusername
VITE_ADMIN_PASS=yourpassword

- `.env` is ignored by Git and will not be pushed to GitHub.
