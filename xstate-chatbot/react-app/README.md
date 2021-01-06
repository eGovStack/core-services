# XState-Chatbot-React-App

This `react-app` is provided only to ease the process of dialog development. It should be used only on a developer's local machine when developing any new chat flow. `nodejs` should be run as a backend service and tested once on the local machine using postman before deploying the build to the server.


`
npm install
`

## Modifying the Dialog

The Xstate Machine that contains the dialog is present in `nodejs/src/machine/`. To modify the dialog, please make changes to that file.

Any external api calls are written as part of files present in `nodejs/src/machine/service` which would get called from the state machine.

## Command to setup
This react-app uses files present in the nodejs project. So before running this app, we need to install dependencies in the nodejs project as well.

Run following command in `nodejs/` directory as well as `react-app/` directory

`
npm install
`

## Command to run the App
To start testing the chatbot in a web browser, run following command in `react-app/` directory.

`
npm start
`

Open the website: `http://localhost:3000`

Open the web browser console to see any logs.
