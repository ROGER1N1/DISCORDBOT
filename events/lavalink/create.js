module.exports = {
  name: 'create',
  isNodeEvent: true,
  execute(client, node) {
    console.log(
      global.styles.successColor(`[Node Create] `) +
        global.styles.accentColor(`Node ${node.id} has been created`)
    );
  },
};
