
# Order Buy APP

### Prerequisites
*  Requires Node version (v16.20.1)
*  Requires pnpm 6


### Setup & Running Instructions

### 1. Running the UI service

  #### Using Docker Compose (Recommended)
  Clone the repository from GitHub and navigate to the root directory of the app.
  You can review the docker-compose.yml file for detailed docker configurations.

  ```
  docker-compose up
  open http://localhost:3000

  docker-compose stop
  ```

  #### Development by local
  Clone the repository from GitHub and navigate to the root directory of the app.
  (Requires pnpm 6)

  #### Run NEXT.JS server
  ```
  pnpm install
  pnpm run start:local
  open http://localhost:3000
  ```