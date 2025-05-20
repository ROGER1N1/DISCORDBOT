module.exports = {
  name: 'destroy',
  isNodeEvent: true,
  execute(client, node) {
    console.log(
      global.styles.errorColor(`[Node Destroy] `) +
        global.styles.warningColor(`Node ${node.id} has been destroyed`)
    );
  },
};
