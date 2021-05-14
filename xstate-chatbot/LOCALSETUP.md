# XState-Chatbot Local Setup

There are two ways to run the xstate-chatbot:
1. As a Frontend React App: The chat dialog flows could be tested locally by running the [react-app](./react-app). It is only for the initial purpose of testing the dialogs and does not represent how the bot will run on server. Further instructions to keep in mind while running as a react-app are present as a part of the README in the [react-app](./react-app) directory.
2. As as Backend Server: It closely represents how the chatbot is going to run on the server. It is a [NodeJS](./nodejs) server. Detailed instructions to setup the server are present in the README of [nodejs](./nodejs) directory.


## Modifying the Dialog

The Xstate Machine that contains the dialog is present in ```nodejs/src/machine/```. To modify the dialog, please make changes to that file.

Any external api calls are written as part of files present in ```nodejs/src/machine/service``` which would get called from the state machine.


## Environment Variables

