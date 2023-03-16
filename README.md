# CANTCRED 

This is my submission for winter of code 2023 conducted by [SDSLabs](https://github.com/sdslabs), IIT Roorkee.

## About

Cantcred is a web app to connect users and vendors across the R-land for the R-junta. It helps users to book items even without paying right now by using a credit system and keeps track of all the orders. It also helps users by saving their time while booking orders. For the vendors, this app provides a platform where each and every order is tracked and it reduces the risk of fraud.

## Features

 ### User 
 - Book food items from registered vendors 
 - Pay directly or Pay later using Credit system 
 - View your past orders and refill your credit 
 - Direct login via Channel-i 
 - Friendly User Interface and easy navigation 
### Vendor 
- Manual Registration using vendor details , passwords are hashed 
- Verification needed to access User Portal
- Payment through Stripe 
- Friendly Interface to view menu, add items
- View your past orders, current orders , and pending credit details 

##  Tech Stack and Dependencies used 

- **NodeJS , Express , MongoDB , Handlebars , Materialize 1.0.0**  - to handle the frontend and backend
- **bcrypt** - for hashing passwords
- **mongoose** - for connecting node and mongodb
- **moments** - to format the date 
- **express-session, cookie-parser** - to register sessions for the user and the vendor
- **passport** - to authenticate using channeli 
- **xhr2** - to handle xml http requests 

## Setting up the server 

 **Prerequisites** :  Node.js , Git 
 -  Clone the repository in your desired folder , copy the https url or SSH , you can clone by opening terminal and running the command ` git clone -b <branch name> <repo link> ` 
 -  Open terminal in the directory , run the command  `mv .env.sample .env`
 -  Open the file .env using any text editor or VS code ,  Put in the channel-i client ID  in **ID** , the secret in **SECRET** , database link in **DB** , session secret in **SCR**, it is preferred to keep the **PORT** at 4000 only , in **SK** put in the stripe key
 -  Open terminal in the directory , run the command `npm i` then after installation of dependencies run the command  `npm start` 
 -  Open another terminal in the same directory , run the command 
 `stripe listen --forward-to localhost:4000/users/webhook`, keep this terminal running
-   Go to your browser and go to `http://localhost:4000` , you are all set now

## Using the Application 

**User** : 

 - Click on the user button , it will redirect you to channel-i , enter your channel-i  credentials 
 - Enter your mobile number for first time onboarding 
 - You can now use the app to order items, view your previous orders 
 - PS : you may get a pleasant surprise if you go to any undefined path (for example `/users/dfdaf`

**Vendor** :  

- Click on vendor , then you can regitser , enter your details and click on submit. If already registered you can login and skip the next three steps.
- Await verification , and then login
- Click on accept payments for first time onboarding
- Configure payments using the **Configure Payment** link 
- You can now use the portal as a vendor , add items , view your menu , view previous orders , view current orders , view pending credit transactions

## Author
**[Aaditya Gupta](https://github.com/Aaditya-G)**

## Mentors 
**[Tanmay Bajaj](https://github.com/Frey0-0)**
**[Gurmannat Sohal](https://github.com/itsgurmannatsohal)**