# Install NVM
which curl || ( sudo apt install curl )
which nvm || ( curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash )
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Allow node to run on port 80 for node
which setcap || ( sudo apt install libcap2-bin )
sudo setcap cap_net_bind_service=+ep /home/hgadmin/.nvm/versions/node/v16.15.0/bin/node

# Change to app dir
cd app

# because this is where the .env file is located
cd server

# Start App via pm2
nvm install 16.15.0
nvm use 16.15.0
npm i -g pm2@latest
pm2 stop api --silent
pm2 flush
pm2 delete api --silent
pm2 start "node index.js" --name api 

# Show logs after a wait time
sleep 60
pm2 logs api --nostream --lines 100
pm2 ls

# Stats
ps uax
netstat -anpl | grep tcp
uptime
w
free -h
df -h
hostname
curl ifconfig.io
