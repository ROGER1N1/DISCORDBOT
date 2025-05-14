module.exports = {
  name: 'connect',
  isNodeEvent: true,
  execute(client, node) {
    console.log(
      global.styles.successColor(`[Node Connect] `) +
        global.styles.accentColor(`Node ${node.id} successfully connected`)
    );
  },
};
