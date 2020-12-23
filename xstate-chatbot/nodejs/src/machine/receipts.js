const { assign } = require('xstate');
const receipts = {
    id: 'receipts',
    initial: 'menu',
    states: {
      menu: {
        id: 'menu',
        onEntry: assign((context, event) => {
          context.chatInterface.toUser(context.user, "Receipts is unimplemented");
        }),
        always: '#sevamenu'
      },
    }
};
module.exports = receipts;