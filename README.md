# Mission Simulator

This application is designed to simulate planning, launching, and tracking of concurrent missions with sequential objectives as well as assigning personnel, assets and objectives.

## Recorded Demonstration

The following video demonstrates planning, viewing, scheduling, and launching/tracking three missions with multiple objectives. Missions are executed concurrently. This video is not intended to demonstrate all features of the application. Viewers are encouraged to skip to sections relevant to their interests for convenience.

https://drive.google.com/drive/folders/1GnSWPNRbtU1FqKLjKARThEJgs3slpXl8

## Technologies Used

- **Frontend**: React, HTML, CSS, TypeScript
- **Backend**: TypeScript, Node.js, Express.js, PostgreSQL, Redis, BullMQ
- **Security**: JWT, Bcrypt
- **Containerization**: Docker
- **Orchestration**: Kubernetes

## Features & Functionality

Frontend:
- **Routing**: Implements dynamic routing using React Router to navigate between different pages of the app.
- **Components**: Utilizes React components to build reusable UI elements. Certain pages and features are encapsulated in their own component, improving maintainability and readability of the code.
- **Passing Props**: Components communicate and share data through props, allowing for dynamic content rendering and a smooth user experience. For example, the main page component passes data to child components to display relevant content.
- **Context**: Shares and persists user information across routes using React context.
- **Local Storage**: Persists user information and session tokens across page refreshes using localStorage API.
- **Dynamic Component Rendering**: Conditionally renders components based on user role and state. Renders components based on API responses.
- **Visual Objective Progress Tracking**: Tracks objectives completion progress visually using component with chart.js bar chart and integrated client socket listening for updates from objective jobs running on backend.

Backend:
- **Error Handling**: Server handles errors and sends error code to client. Client outputs error messages to UI based on error code.  
- **Mission Execution Pipeline Simulation**: Simulates mission execution pipeline by queuing parent and children jobs for mission and associated objectives, to Redis queues via BullMQ flow. Initiates dedicated worker for parent/mission task and children/objectives jobs respectively.
- **Role-based JWT Authentication**: Utilizes server-generated tokens to authenticate client actions throughout login session. Users Admin, Commanders, Operators have different allowed actions.
- **Secure Password Storage**: Passwords are hashed before storage on signup. Hashed input password is compared to stored hash on login.
- **Two-Factor Authentication**: Requires users to register 2FA on signup. Prompts user to enter 2FA time-based one-time passcode upon login.
- **Non-Repudiation**: User actions are logged with action-specific details to prevent denial of having performed action.

Docker: 
- **Containerized Backend Services**: Containerized Backend Services: Backend components, including the Express server, PostgreSQL database, and Redis server, are containerized using Docker for consistent and portable environments.
- **Docker Compose for Local Dev**: Uses docker-compose to spin up multi-container development environments with linked services, simplifying local testing and deployment.
- **Optimized Dockerfiles**: Custom Dockerfiles created for backend and worker services to minimize image size and improve build performance.
- **Peristent Volumes**: Configured Docker volumes to ensure database persistence across container restarts during local development.

Kubernetes:
- **Service Deployment**: Application components are deployed to a Kubernetes cluster using declarative YAML manifests, including Deployments, Services, and Ingress resources.
- **Scalability**: Supports autoscaling of pods in Deployments based on resource usage.


## Challenges & Solutions

Frontend:
- **Challenge**: Desired to visually track completion progress of mission objectives executed on the backend via the frontend.
- **Solution**: Integrated Chart.js bar chart with Socket.io client socket configured to listen for updates from tasks (objectives) running on backend. An array of objective progress values is progressively built from data received over the client socket and mapped to single-bar Chart.js bar chart components.
  
  A key consideration was whether to have a single socket pass data received to the multiple missions or to have a socket for each mission. The former option was eliminated after realization that it would not function with multiple backend missions emitting updates concurrently.

- **Challenge**: Objective tasks executed on the backend are assigned random strings as IDs by BullMQ by default. This makes subscribing to them via the frontend socket difficult as it does not have knowledge of the IDs.
- **Solution**: Programmed system for backend objectives to to follow order of IDs: mission 1 - objective 1, mission 1 - objective 2 and so on, while the frontend independently yet synchronously also tracks these IDs for the socket to subscribe to.

- **Challenge**: Needed a method of tracking the lifecycle of a objective tasks running on the backend via the client socket.
- **Solution**: Engineered client socket event listeners to listen for lifecycle events for backend objective tasks. A connection is established by the client socket on component mount via useEffect so that it is established only once in the entire mission lifecycle. Two event listeners are coded inside a separate useEffect. An event listener subscribes to objective progress value events and another event listener listens for objective completion events. Upon objective completion, a react state is set to the next mission objective task ID and this automatically triggers the useEffect, updating the event handlers to subscribe to this new objective task.
  

Backend: 
- **Challenge**: Flow child jobs are JavaScript objects that must be nested within each other in order to execute sequentially. Data received from from client is not nested, but in an array.
- **Solution**: Wrote recursive algorithm to accept array of objects and transform it into nested objects.


Kubernetes:
- **Challenge**: Frontend was not sending requests to backend via Ingress.
- **Solution**: Exposed Ingress service port outside Kubernetes cluster bypassing Ingress LoadBalancer service to directly access the backend service.
