# Auto Report Generation
## Description



##Prerequisites
* Make sure you have node.js and npm installed.
    * Go to https://nodejs.org/en/download/
    * npm comes with node.js
    * Once finish install node.js, you can run the command ` node -v ` and ` npm -v ` to check the version. If it shows the correct version then you are down with the installation.
   
##Installation

```shell
git clone
cd AutoReportGeneration
npm install
npm start
```
The application will be started at port 3000 if the environment variable 'PORT' is not being set.    
Port can also be configured using command `PORT=3000 npm start`
 ![Example](docs/project%20UI.PNG)
### Test  
Run the tests using `npm test test`  

### Logs
All the logs are located in /logs folder

####For jsreport running locally:   
  Make sure you have  node.js (>= 8.9) on the target machine 
```shell
cd jsReport/jsreportapp  
npm install  
jsreport start  
```
 * The default port for jsreport is 5488, and you can customize a lot of configurations in '/jsReport/jsreportapp/jsreport.config.json'.   
    * For your reference please to go https://jsreport.net/learn/configuration  for more information.
##Technology
* Node.js && npm
* Express
* jsreport https://jsreport.net/
* Bootstrap4 https://getbootstrap.com/
* Heroku https://dashboard.heroku.com

##Dependencies
* sendgrid: Email provider https://app.sendgrid.com/
    * 100 emails per day
* jsreport: Report provider https://jsreport.net/
    * 5 templates for free
* Heroku: Cloud platform for deploying jsreport https://dashboard.heroku.com

##Contributor
Chao Zhang 


   