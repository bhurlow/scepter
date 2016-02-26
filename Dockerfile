FROM node:5.6.0
ADD . /app
WORKDIR /app
RUN npm install 
RUN ls
CMD node index.js
