# Use an official Node.js runtime as the base image
FROM node:22-alpine3.19

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the backend code to the working directory
COPY . .

# Expose the port your backend runs on (e.g., 3000)
EXPOSE 3000

# Define the command to run your backend
CMD ["npm", "start"]