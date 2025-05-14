module.exports = {
  name: 'error',
  isNodeEvent: true,
  execute(client, node, error, payload) {
    console.log(
      global.styles.errorColor(`[Node Error] `) +
        global.styles.warningColor(`Node ${node.id} encountered an error:`) +
        '\n' +
        global.styles.errorColor(error)
    );

    if (payload) {
      console.log(
        global.styles.secondaryColor(`Payload:`) +
          '\n' +
          global.styles.infoColor(JSON.stringify(payload, null, 2))
      );
    }
  },
};
