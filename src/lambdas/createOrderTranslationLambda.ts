import { SQS } from 'aws-sdk';
import { resolveCommand } from '../adapters/index';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const queueUrl = process.env.COMMAND_QUEUE_URL;
  if (!queueUrl) {
    throw new Error('COMMAND_QUEUE_URL is not set');
  }

  const payload = event.body ? JSON.parse(event.body) : '';
  const { commandName, command } = resolveCommand(payload);

  if (commandName !== 'CreateOrder') {
    throw new Error('Unsupported command for this endpoint');
  }

  const sqs = new SQS();
  await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({ commandName, command }),
    })
    .promise();

  return { statusCode: 202, body: JSON.stringify({ status: 'accepted' }) };
};
