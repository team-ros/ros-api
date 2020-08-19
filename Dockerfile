# The latest lts image of node
FROM node:lts-alpine

# Creates the working directory
WORKDIR /usr/src/app

# Copies package- and package-lock.json to workdir
COPY package*.json ./

# Installs all needed dependencies
RUN npm install

# Rebuilds tfjs
RUN npm run rebuild-tfjs

# Copies the rest of the application to the working directory
COPY . .

# Compile es6 to commonJS and es5
RUN npm run build

# Expose the Port
EXPOSE 8080

CMD [ "node", "./lib", "/index.js"]