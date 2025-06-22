# Mission Simulator

This application is designed to simulate launching and tracking missions as well as assigning personnel, assets and objectives.

## Technologies Used

- **Frontend**: React, HTML, CSS, TypeScript
- **Backend**: Javascript, Node.js, Express.js, SQLite3
- **Security**: JWT, Bcrypt

## Features & Functionality

- **Routing**: Implements dynamic routing using React Router to navigate between different pages of the app.
- **Components**: Utilizes React components to build reusable UI elements. Certain pages and features are encapsulated in their own component, improving maintainability and readability of the code.
- **Passing Props**: Components communicate and share data through props, allowing for dynamic content rendering and a smooth user experience. For example, the main page component passes data to child components to display relevant content.
- **Context**: Shares and persists user information across routes using React context.
- **Local Storage**: Persists user information and session tokens across page refreshes using localStorage API.
- **Dynamic Component Rendering**: Conditionally renders components based on user role and state. Renders components based on API responses.
- **Visual Objective Progress Tracking**: Tracks objectives completion progress visually using component with chart.js bar chart and integrated client socket listening for updates from objective jobs running on backend.
- **Mission Execution Pipeline Simulation**: Simulates mission execution pipeline by queuing parent and children jobs for mission and associated objectives, to Redis queues via BullMQ flow. Initiates dedicated worker for parent/mission task and children/objectives jobs respectively.

- **Role-based JWT Authentication**: Utilizes server-generated tokens to authenticate client actions throughout login session. Users Admin, Commanders, Operators have different allowed actions.
- **Secure Password Storage**: Passwords are hashed before storage on signup. Hashed input password is compared to stored hash on login.
- **Two-Factor Authentication**: Requires users to register 2FA on signup. Prompts user to enter 2FA time-based one-time passcode upon login.
- **Non-Repudiation**: User actions are logged with action-specific details to prevent denial of having performed action.

## Challenges & Solutions

- **Challenge**: Flow child jobs are JavaScript objects that must be nested within each other in order to execute sequentially. Data received from from client is not nested, but in an array.
- **Solution**: Wrote recursive algorithm to accept array of objects and transform it into nested objects.
- **Challenge**: Desired to visually track completion progress of separate objectives via front end.
- **Solution**: Integrated Chart.js bar chart component with Socket.io client socket configured to listen for updates from tasks running on backend.

## Future Improvements
