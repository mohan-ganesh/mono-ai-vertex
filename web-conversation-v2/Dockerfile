# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:16 as build

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Install all the dependencies
RUN npm i

# Generate the build of the application
RUN npm run build --test

# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/default.conf /etc/nginx/templates/default.conf.template
COPY --from=build /usr/local/app/dist/web-conversation-v2 /usr/share/nginx/html

# Expose port 80
EXPOSE 80