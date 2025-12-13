# 🚀 Rating & Review Platform (MERN + PostgreSQL)

A full-stack rating system where **normal users** rate stores, **store owners** manage stores, and **system admins** manage everything through a powerful dashboard.

This project demonstrates **authentication, role-based access, admin panels, CRUD, searching, sorting, modals, PostgreSQL relations, and scalable backend design.**

---

### 🖼 Login & Register User Form

![Login](assets/login/login.png)
![Register](assets/login/register.png)

### 🖼 Admin Dashboard

![Home](assets/Admin/Home.png)

![Register](/assets/Admin/AddUser.png)

![store](/assets/Admin/Store.png)

![stats](/assets/Admin/stats.png)

### 🖼 Store List (User View)

![store List](/assets/normalUser/storeList.png)

![Rating](/assets/normalUser/rating.png)

### 🖼 Store Owner Panel

![store Owner](/assets/storeOwner/Screenshot%202025-12-13%20at%2012.40.20 PM.png)

---

# ⭐ Features

## 👨‍💼 System Admin

- View **total users, stores, ratings**
- Manage Users
  ✔ View all users
  ✔ Search + Sort
  ✔ Create user
  ✔ Update role
  ✔ Self-role protection
  ✔ Delete user
  ✔ View user details (stores owned / ratings given)
- Manage Stores
  ✔ View all stores
  ✔ Search + Sort
  ✔ Create store (assign owner)
  ✔ View store details
  ✔ Delete store

---

## 👤 Normal User

- Browse all stores
- View ratings + details
- Add ratings
- Edit ratings
- Delete ratings

---

## 🏪 Store Owner

- Create stores
- Edit & delete own stores
- View received ratings
- Rating breakdown

---

# 🛠 Tech Stack

### **Frontend**

- React.js
- TailwindCSS
- Context API
- Axios
- React Router v6

### **Backend**

- Node.js
- Express.js
- PostgreSQL
- JWT
- Bcrypt
- Middleware-based access control

---

# 📂 Folder Structure

```
project/
│── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   └── index.js
│
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/AuthContext.jsx
│   │   ├── services/api.js
│   │   └── App.jsx
│   └── package.json
```

---

# ⚙️ Setup Instructions

## 🔧 Backend Setup

### 1️⃣ Install dependencies

```bash
cd backend
npm install
```

### 2️⃣ Create `.env`

```
DATABASE_URL=postgres://username:password@localhost:5432/ratingapp
JWT_SECRET=your_secret_key
PORT=4000
```

### 3️⃣ Run backend

```bash
npm run dev
```

---

## 🎨 Frontend Setup

### 1️⃣ Install dependencies

```bash
cd frontend
npm install
```

### 2️⃣ Start frontend

```bash
npm start
```

---

# 🔐 Authentication Flow

### JWT Tokens

- User logs in
- Server returns JWT
- Stored in **localStorage**
- All protected API calls include `Authorization: Bearer <token>`

### Route Protection

- **verifyToken** ensures valid login
- **ensureRole("system_admin")** restricts admin-only routes
- Prevents:

  - Admin modifying own role
  - Admin deleting own account

---

# 🔌 API Endpoints (Full)

## 🟦 AUTH

```http
POST /auth/register
POST /auth/login
```

## 🟥 ADMIN — Users

```http
GET    /admin/users
POST   /admin/users/create
PUT    /admin/users/:id/role
GET    /admin/users/:id/details
DELETE /admin/users/:id
GET    /admin/stats
```

## 🟩 ADMIN — Stores

```http
GET    /admin/stores
POST   /stores/admin-create
```

## 🟨 STORES

```http
GET    /stores
GET    /stores/:id
POST   /stores
PUT    /stores/:id
DELETE /stores/:id
```

## ⭐ RATINGS

```http
POST    /ratings/:storeId
PUT     /ratings/:ratingId
DELETE  /ratings/:ratingId
```

---

# 🧪 Testing Instructions

### 🔹 Make an admin user

1. Register a user
2. Go to PostgreSQL → update the role

```
UPDATE users SET role='system_admin' WHERE id=1;
```

3. Login → full admin panel unlocks

---

# 🧾 Database Schema (Simplified ERD)

```
Users (id, name, email, password, role, address)
|
|---< Stores (id, name, email, owner_id, address)
        |
        |---< Ratings (id, user_id, store_id, rating, comment, created_at)
```

---

# 🏁 Final Notes

✔ Fully tested
✔ Mobile responsive
✔ All CRUD operations complete
✔ Industry-level admin panel
✔ Good for internships, live projects, portfolio

---

# 👨‍💻 Author

### **Krish Balana — MERN Stack Developer**

---

# ⭐ If you like this project

Give it a star on GitHub ⭐
