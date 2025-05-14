const { Schema, model } = require('mongoose');

const autoRoleSchema = new Schema({
  serverId: { type: String, required: true, unique: true },
  roleIds: [{ type: String, required: true }],
});

module.exports = model('AutoRole', autoRoleSchema);
