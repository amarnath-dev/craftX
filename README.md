<div align="center">
    <h1><strong>🛍️CraftX</strong></h1>
</div>


<p align="center">    
    <a href="">
        <img alt="GitHub" src="https://img.shields.io/badge/node.js-6DA55F?&logo=node.js&logoColor=white">
    </a>   
    <a href="">
        <img alt="GitHub" src="https://img.shields.io/badge/express.js-%23404d59.svg?&logo=express&logoColor=%2361DAFB">
    </a>    
    <a href="">
        <img alt="GitHub" src="https://img.shields.io/badge/handlebars-000000?&logo=handlebars&logoColor=%2361DAFB">
    </a>    
    <a href="">
        <img alt="GitHub" src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?&logo=mongodb&logoColor=white">
    </a>
    <a href="">
        <img alt="GitHub" src="https://img.shields.io/badge/render-000000?&logo=render&logoColor=white">
    </a>
</p>

<h4 align="center">
    <p>
        <a href="https://craftx.onrender.com">Deployed URL</a>
    <p>
</h4>
CraftX is an c-commerce platform specializing in the sale of handcrafted products. It offers a range of features aimed at providing a seamless shopping experience for the users.Below are the key features implemented in the project:

## Features

- **Secure Authentication:** Utilizes JWT for token-based authentication ensuring secure access to user accounts.
- **User Profile and Account Management:** Users can manage their profiles and accounts conveniently through the platform.
- **Cart and Wishlist Management:** Users can add items to their cart for easy checkout and manage their wishlist for future purchases.
- **Review and Rating System:** Gather feedback from users through a review and rating system.
- **Payment Interface:** Secure online transactions facilitated through Razorpay, ensuring the safety of user payments.
- **Admin Dashboard:** Manage the ecommerce platform efficiently with an intuitive admin dashboard. Dynamic content rendering with HTML and Handlebars for enhanced usability.
  
## UI demo

<p align="center">
    <picture>
    <img alt="craftx" src="./assets/Screenshot (484).png" width=90%>
    </picture>
</p>
<p align="center">
    <picture>
    <img alt="craftx" src="./assets/Screenshot (485).png" width=90%>
    </picture>
</p>

## Tech stack

Main web-frameworks and libraries:
- **Node.js:** Server-side JavaScript execution environment to produce dynamic web pages and service requests.
- **Express.js:** The de facto standard web application framework for Node.js to build web applications including this one.
- **MongoDB(& mongoose.js):** NoSQL database, which serves as the database for this tech stack, for storing and retrieving data(CRUD opreations).
- **Handlebars.js(& Bootstrap):** Templating engine to produce client-side generated dynamic web pages, used to separate UI(view) from logic(model and controller)
- **Payment integration:** Razorpay 
- Sweet Alert, Session & Validation
- JWT tocken based Authentication
- BCrypt Hashing

CraftX is successfully hosted on render You can access the live site [https://craftx.onrender.com](https://craftx.onrender.com).

## How to setup the application locally on your system

1. Cloning the repository
   
   ```
   git clone https://github.com/amarnath-dev/craftX.git
   ```
2. navigate to the cloned directory & install dependancies
   
   ```
   cd craftX
   npm install
   ```
3. set up the env file by refering the `.examle.env`
4. Start Node.js server using npm, the server starts processing request at [http://localhost:3000](http://localhost:3000) 
   
   ```
   npm run dev
   ```