# Mission Simulator
This application is designed to simulate launching and tracking missions as well as assigning personnel, assets and objectives.

## Technologies Used  
- **Frontend**: React, HTML, CSS, Typecript
- **Backend**: Javascript, Node.js, Express.js, SQLite3
- **Security**: JWT, Bcrypt

## Features & Functionality  
- **Routing**: Implements dynamic routing using React Router to navigate between different pages of the app.
- **Components**: Utilizes React components to build reusable UI elements. Certain pages and features are encapsulated in their own component, improving maintainability and readability of the code.
- **Passing Props**: Components communicate and share data through props, allowing for dynamic content rendering and a smooth user experience. For example, the main page component passes data to child components to display relevant content.  
- **Role-based JWT Authentication**: Utilizes server-generated tokens to authenticate client actions throughout login session. Users Admin, Commanders, Operators have different allowed actions.  
- **Secure Password Storage**: Passwords are hashed before storage on signup. Hashed input password is compared to stored hash on login.
- **Non-Repudiation**: User actions are logged with action-specific details to prevent denial of having performed action.  

## Challenges & Solutions  

## Future Improvements  

