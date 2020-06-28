# WoT openHAB 

A JavaScript code which creates a consumable [Thing Description(TD)](https://www.w3.org/2019/wot/td) file, using exposed [openHAB](https://www.openhab.org) items.
In generated TD, every item is represented as readable and observable property, every writable state is represented as actions.


## Get Ready
* Get the latest node.js
```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```
* Clone the repository
	`git clone https://github.com/erkann-sen/wot-openhab.git`
* Install packages
	`npm install`

## Usage 

* Start your openHAB server
* If your openHAB server uses localhost:8080, call 
`node index.js`
* If your endpoint is different, call
`node index.js -u http://<your_openHAB_endpoint_with_port>/rest/items?recursive=false`
* The generated TD file (output.json) is apperad in repo, ready for consume

