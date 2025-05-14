module.exports = {
  name: 'reconnectinprogress',
  isNodeEvent: true,
  execute(client, node) {
    console.log(
      global.styles.warningColor(`[Node Reconnect] `) +
        global.styles.primaryColor(
          `Node ${node.id} reconnection process started`
        )
    );
  },
};
