const { Schema, model } = require('mongoose');

const buttonRoleSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  panelName: {
    type: String,
    required: true,
  },
  panelData: {
    type: Object,
    required: true,
  },
  buttons: [
    {
      label: String,
      roleId: String,
      style: String,
      customId: String,
    },
  ],
  channelId: {
    type: String,
    required: true,
  },
});

const ButtonRole = model('ButtonRole', buttonRoleSchema);

module.exports = ButtonRole;
