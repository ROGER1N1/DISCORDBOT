module.exports = {
  name: 'reconnecting',
  isNodeEvent: true,
  execute(client, node) {
    console.log(
      global.styles.warningColor(`[Node Reconnecting] `) +
        global.styles.highlightColor(
          `Node ${node.id} is attempting to reconnect`
        )
    );
  },
};
