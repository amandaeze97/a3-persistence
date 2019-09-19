Assignment 3 - Persistence: Two-tier Web Application with Flat File Database, Express server, and CSS template
===

## Bon Me Restaurant

http://a3-amandaeze97.glitch.me

This applcation is a replica of the famous Bon Me restaurant. However, this focuses on their delicious rice bowls. 
To place an order, the customer's first name, last name, and whatever they want to name their meal are required. 
Include a very brief summary of your project here. The name can be anything from Treasure Island to bon appetit. 
When the customer places their order, that order is them put under the "view orders" page with the other customer 
orders. This data is organized in a table where customers can modify or delete their orders. I made it so that the 
once the customer logs onto the application, they feel even more hungry than they already do, by putting a picture 
that is clear and rich with color of some of the available rice bowl options.

Login Credentials:
Username: Amanda
Password: 1234

### Challenges
The main challenges I encountered were relating to documentation. If I had to be specific, I would say with the 
Material framework and Passport middleware. Implementation of some of the Passport functions was unclear, and 
Material had inconsistent component instantiation methods. There wasn't a lot of clarity around how to configure 
certain features using this approach.

### CSS Framework
- **Material**: Aside from the responsive layout that Material offers, I preferred my design in Assignment 2 using 
my custom CSS over using an already made css layout for this assignment.

### Middleware
- **body-parser**: Parses HTTP request body into JSON.
- **compression**: Compresses HTTP responses.
- **serve-static**: Serves static files.
- **passport**: Authenticates users.
- **express-session**: Establishes a session using a cookie upon user login.
- **helmet**: Secure apps by setting various HTTP headers.

### Authentication/Database
I chose to use passport-local and lowdb because they were the easiest to implement.

### Technical Achievements
- **Logout**: I implemented passport's logout capability so that multiple users can log in/out without having to 
restart the server.
- **User Sign-Up**: Rather than adding a new user based on the input of a new user & password combo, I created a 
feature that allows users to select to create an account.


### Design/Evaluation Achievements
- **Responsive layout**: Since my last assignment was not responsive, I wanted to make this application reponsive. 
Through the use of Material.io, I was able to control how all the components on the page scaled up or down.
- **Error handling**: I separated my login functionality into a separate HTML file, so when you access the ordering 
platform, it's done through the url "order.html". I also added error handling to that a user could not bypass the 
the login by just adding order.html in the URL.