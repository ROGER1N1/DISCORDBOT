const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Todo = require('../../models/Todo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('todo')
    .setDescription('Manage your todo list.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a task to your todo list.')
        .addStringOption((option) =>
          option
            .setName('task')
            .setDescription('The task to add')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('priority')
            .setDescription('Set the priority level: low, medium, high')
            .setRequired(false)
            .addChoices(
              { name: 'Low', value: 'low' },
              { name: 'Medium', value: 'medium' },
              { name: 'High', value: 'high' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('view').setDescription('View your todo list.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Delete a task from your todo list.')
        .addIntegerOption((option) =>
          option
            .setName('task_number')
            .setDescription('The task number to delete')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete_all')
        .setDescription('Delete all tasks from your todo list.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('complete')
        .setDescription('Mark a task as completed.')
        .addIntegerOption((option) =>
          option
            .setName('task_number')
            .setDescription('The task number to mark as completed')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('priority')
        .setDescription('Change the priority of a task.')
        .addIntegerOption((option) =>
          option
            .setName('task_number')
            .setDescription('The task number to change priority')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('new_priority')
            .setDescription('Set the new priority level: low, medium, high')
            .setRequired(true)
            .addChoices(
              { name: 'Low', value: 'low' },
              { name: 'Medium', value: 'medium' },
              { name: 'High', value: 'high' }
            )
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (subcommand === 'add') {
      const task = interaction.options.getString('task');
      const priority = interaction.options.getString('priority') || 'medium';

      const newTodo = new Todo({
        userId,
        task,
        priority,
        dateAdded: new Date(),
      });

      await newTodo.save();

      const addEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('📝 Task Added')
        .setDescription(
          `\`\`\`\nTask: ${task}\nPriority: ${priority.toUpperCase()}\n\`\`\``
        )
        .addFields({
          name: 'Instructions',
          value: 'Use `/todo view` to see all tasks.',
        })
        .setFooter({ text: 'Task added successfully!' })
        .setTimestamp();

      await interaction.reply({ embeds: [addEmbed], ephemeral: true });
    } else if (subcommand === 'view') {
      const todos = await Todo.find({ userId });

      if (todos.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('🚫 No Tasks Found')
          .setDescription(
            'Your todo list is currently empty.\nUse `/todo add` to add a new task.'
          )
          .setTimestamp();

        return await interaction.reply({
          embeds: [emptyEmbed],
          ephemeral: true,
        });
      }

      const tasks = todos
        .map((todo, index) => {
          const timestamp = Math.floor(
            new Date(todo.dateAdded).getTime() / 1000
          );
          return `\`${index + 1}.\` **${todo.task}**\n    • Priority: \`${todo.priority.toUpperCase()}\`\n    • Completed: \`${todo.isCompleted ? '✅' : '❌'}\`\n    • Added on: <t:${timestamp}:F>`;
        })
        .join('\n\n');

      const viewEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📝 Your Todo List')
        .setDescription(tasks)
        .setFooter({
          text: 'Use /todo complete [task_number] to mark a task as completed or /todo delete [task_number] to remove it.',
        })
        .setTimestamp();

      await interaction.reply({ embeds: [viewEmbed], ephemeral: true });
    } else if (subcommand === 'delete') {
      const taskNumber = interaction.options.getInteger('task_number') - 1;
      const todos = await Todo.find({ userId });

      if (taskNumber < 0 || taskNumber >= todos.length) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Invalid Task Number')
          .setDescription(
            'The specified task number does not exist. Please check your list and try again.'
          )
          .setTimestamp();

        return await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }

      const removedTask = todos[taskNumber];
      await Todo.deleteOne({ _id: removedTask._id });

      const deleteEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🗑️ Task Deleted')
        .setDescription(`\`\`\`\nDeleted Task: ${removedTask.task}\n\`\`\``)
        .addFields({
          name: 'Note',
          value: 'The task has been successfully removed from your todo list.',
        })
        .setTimestamp();

      await interaction.reply({ embeds: [deleteEmbed], ephemeral: true });
    } else if (subcommand === 'delete_all') {
      const deleted = await Todo.deleteMany({ userId });

      const deleteAllEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🗑️ All Tasks Deleted')
        .setDescription(
          deleted.deletedCount > 0
            ? `All ${deleted.deletedCount} tasks have been removed from your todo list.`
            : 'Your todo list was already empty.'
        )
        .setTimestamp();

      await interaction.reply({
        embeds: [deleteAllEmbed],
        ephemeral: true,
      });
    } else if (subcommand === 'complete') {
      const taskNumber = interaction.options.getInteger('task_number') - 1;
      const todos = await Todo.find({ userId });

      if (taskNumber < 0 || taskNumber >= todos.length) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Invalid Task Number')
          .setDescription(
            'The specified task number does not exist. Please check your list and try again.'
          )
          .setTimestamp();

        return await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }

      const taskToComplete = todos[taskNumber];
      taskToComplete.isCompleted = true;
      await taskToComplete.save();

      const completeEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Task Completed')
        .setDescription(
          `\`\`\`\nCompleted Task: ${taskToComplete.task}\n\`\`\``
        )
        .addFields({
          name: 'Status',
          value: 'This task has been marked as completed.',
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [completeEmbed],
        ephemeral: true,
      });
    } else if (subcommand === 'priority') {
      {
        const taskNumber = interaction.options.getInteger('task_number') - 1;
        const newPriority = interaction.options.getString('new_priority');
        const todos = await Todo.find({ userId });

        if (taskNumber < 0 || taskNumber >= todos.length) {
          const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Invalid Task Number')
            .setDescription(
              'The specified task number does not exist. Please check your list and try again.'
            )
            .setTimestamp();

          return await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true,
          });
        }

        const taskToChange = todos[taskNumber];
        const oldPriority = taskToChange.priority;
        taskToChange.priority = newPriority;
        await taskToChange.save();

        const priorityChangeEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('🔄 Priority Changed')
          .setDescription(
            `\`\`\`\nTask: ${taskToChange.task}\nOld Priority: ${oldPriority.toUpperCase()}\nNew Priority: ${newPriority.toUpperCase()}\n\`\`\``
          )
          .addFields(
            {
              name: 'Task Number',
              value: `${taskNumber + 1}`,
              inline: true,
            },
            {
              name: 'Status',
              value: 'Priority level updated successfully!',
              inline: true,
            }
          )
          .setFooter({
            text: 'Use /todo view to see the updated list.',
          })
          .setTimestamp();

        await interaction.reply({
          embeds: [priorityChangeEmbed],
          ephemeral: true,
        });
      }
    }
  },
};
