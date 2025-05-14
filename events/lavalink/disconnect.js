module.exports = {
  name: 'disconnect',
  isNodeEvent: true,
  execute(client, node, reason) {
    console.log(
      global.styles.errorColor(`[Node Disconnect] `) +
        global.styles.warningColor(`Node ${node.id} disconnected`) +
        global.styles.secondaryColor(` - Reason: ${reason}`)
    );
  },
};
