FROM node:5.6.0
ADD . /app
WORKDIR /app
ENV DEBUG scepter:*
RUN npm install 
CMD node index.js
