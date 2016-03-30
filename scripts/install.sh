#!/bin/bash

echo "
 ____  _      ____  ____  _____    _      _  ____  ____  ____  ____ 
/ ___\/ \__/|/  _ \/  __\/__ __\  / \__/|/ \/  __\/  __\/  _ \/  __\
|    \| |\/||| / \||  \/|  / \    | |\/||| ||  \/||  \/|| / \||  \/|
\___ || |  ||| |-|||    /  | |    | |  ||| ||    /|    /| \_/||    /
\____/\_/  \|\_/ \|\_/\_\  \_/    \_/  \|\_/\_/\_\\_/\_\\____/\_/\_\
                                                                    
                                                                    "

echo "Installing Smart Mirror Dependencies........!"

# You'll also need to install Node (v4.0.0+) which now comes bundled with npm.
echo "Installing NodeJS!"
wget https://nodejs.org/dist/v4.0.0/node-v4.0.0-linux-armv7l.tar.gz
tar -xvf node-v4.0.0-linux-armv7l.tar.gz 
cd node-v4.0.0-linux-armv7l

# Copy to /usr/local
echo "Copying NodeJS to /usr/local/"
sudo cp -R * /usr/local/

# Getting the code

# Next up you'll want to clone this repository into your user's home folder on your Pi:

echo "Cloning Git Repo"
cd ~
git clone https://github.com/evancohen/smart-mirror.git

cd smart-mirror

echo "Renaming Config File"
cp config.example.js config.js


#Hide the mouse when inactive
echo "Installing unclutter"
sudo apt-get install unclutter

echo "Installing Ndde Packages"
npm install

# Launching Smart Mirror App
npm start

exit 0