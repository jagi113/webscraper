FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static files from the Django container
COPY static /usr/src/app/static

# Expose the Nginx port
EXPOSE 8003

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]