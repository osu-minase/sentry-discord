require('now-env');
const { json } = require('micro');
const fetch = require('node-fetch');

const COLORS = {
  debug: parseInt('fbe14f', 16),
  info: parseInt('2788ce', 16),
  warning: parseInt('f18500', 16),
  error: parseInt('e03e2f', 16),
  fatal: parseInt('d20f2a', 16),
};

module.exports = async (request, response) => {
  try {
    const body = await json(request);

    const payload = {
      username: 'Sentry',
      avatar_url: `https://raw.githubusercontent.com/IanMitchell/sentry-discord/master/sentry-icon.png`,
      embeds: [
        {
          title: body.project_name,
          type: 'rich',
          description: body.message,
          url: body.url,
          timestamp: new Date(body.event.received * 1000).toISOString(),
          color: COLORS[body.level] || COLORS.error,
          fields: [],
        },
      ],
    };

    if (body.event.user) {
      payload.embeds[0].fields.push({
        name: '**User**',
        value: body.event.user.username,
      });
    }

    if (body.event.tags) {
      body.event.tags.forEach(([key, value]) => {
        payload.embeds[0].fields.push({
          name: key,
          value,
          inline: true,
        });
      });
    }

    fetch(process.env.WEBHOOK, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
  }
};
