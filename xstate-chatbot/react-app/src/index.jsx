import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat } from '@progress/kendo-react-conversational-ui';

import { interpret } from 'xstate';
import chatbotMachine from '../../nodejs/src/machine/seva';

import * as marked from 'marked';

function MessageTemplate(props) {
    let message = props.item.text;
    // console.log(message);
    message = message.replaceAll('\n', '<br/>');
    let htmlToinsert = { __html: message };
    return (
        <div className="k-bubble">
            <div dangerouslySetInnerHTML={htmlToinsert} />
        </div>
    );
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.user = {
            id: 1,
            avatarUrl: "https://via.placeholder.com/24/008000/008000.png"
        };
        this.bot = { id: 0 };
        this.state = {
            messages: [
            ]
        };
    }

    componentDidMount() {
        this.chatbotService = interpret(chatbotMachine.withContext ({  
            chatInterface: this,
            user: {
                mobileNumber: "9284726483",
                uuid: "81528b1a-5795-43a7-a6e2-8c64ff145c3d",
            },
            slots: {pgr: {}, bills: {}, receipts: {}}
        }));
        this.chatbotService.start();
    }

    toUser = (user, outputMessages) => {
        if(!Array.isArray(outputMessages)) {
            let message = outputMessages;
            outputMessages = [ message ];
            console.warn('Output array had to be constructed. Remove the use of deeprecated function from the code. \ndialog.sendMessage() function should be used to send any message instead of any previously used methods.');
        }
        for(let message of outputMessages) {
            let botMessage = {
                author: {
                    id: 0
                },
                text: message
            };
            this.setState(prevState => ({
                messages: [
                    ...prevState.messages,
                    botMessage
                ]
            }));
        }
    }

    fromUser = (event) => {
        this.setState((prevState) => ({
            messages: [
                ...prevState.messages,
                event.message
            ]
        }));
        let message = {}
        if(event.message.text.startsWith("(")) {
            message = {
                input: event.message.text,
                type: "location"
            }
        } else {
            message = {
                input: event.message.text,
                type: "text"
            }
        }
        this.chatbotService.send("USER_MESSAGE", { message: message });
    }

    render() {
        return (
            <div>
                <Chat user={this.user}
                    messages={this.state.messages}
                    onMessageSend={this.fromUser}
                    placeholder={"Type a message..."}
                    messageTemplate={MessageTemplate}
                    width={400}>
                </Chat>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.querySelector('my-app')
);
