# Buy, Sell @ IIITH

## Introduction
This project is a **Buy-Sell Web Portal** exclusively for the IIIT Community, built using the **MERN Stack**. The portal allows users to register and act as both **buyers and sellers** while ensuring seamless transactions without additional platform taxation.

## Tech Stack
- **MongoDB** - Database
- **Express.js** - Backend framework (REST API)
- **React.js** - Frontend framework
- **Node.js** - Backend runtime

## Features
### User Management
- Registration with **IIIT email verification**
- Secure authentication with **bcrypt.js for password hashing** and **jsonwebtoken for token-based authentication**
- Persistent login until explicit logout
- Google Recaptcha/LibreCaptcha 

### Item Management
- Add, edit, and delete items as a **seller**
- Search and filter items by **category**
- View item details

### Shopping & Transactions
- **Add items to cart**
- Order items with **secure transaction handling**
- **Order history** tracking (bought/sold items)
- **Seller dashboard** to manage orders
- OTP-based **order completion** for security

### Additional Features
- **Support chatbot** 
- Fully responsive UI with **React UI Libraries (Tailwind, MUI, etc.)**

### Run
- **Backend**
```
    cd backend
    npm i
    npm run backend
```

- **Frontend**
```
    cd frontend
    npm i
    npm run dev
```