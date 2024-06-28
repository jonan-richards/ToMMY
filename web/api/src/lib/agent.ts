import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from '@langchain/core/prompts';
import {
    Runnable,
    RunnablePassthrough,
    RunnableSequence,
} from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import {
    AIMessage,
    AIMessageChunk,
    HumanMessage,
} from '@langchain/core/messages';
import { Snippet } from '#shared/task';
// eslint-disable-next-line import/no-cycle
import { InteractionMessageData } from '../services/interaction';

type Message = InteractionMessageData;

type AgentMessage = Message & {
    type: 'ai' | 'internal'
};

export type Agent = Runnable<
{
    snippet: Snippet
    input: string
    history: Message[]
},
AgentMessage[]
>;

const modelCTX = {
    load: (config: { temperature: number }) => new ChatOpenAI({
        modelName: 'gpt-3.5-turbo',
        ...config,
    }),
    costs: {
        input: 0.0005 / 1000,
        output: 0.0015 / 1000,
    },
};

const getHistory = (chat: Message[]) => chat
    .filter((message) => ['ai', 'user'].includes(message.type))
    .map((message) => (message.type === 'user'
        ? new HumanMessage(message.content)
        : new AIMessage(message.content)));

const createAgent = (
    messages: {
        key: string,
        type: 'ai' | 'internal',
        template: ChatPromptTemplate<{
            snippet: Snippet
            input: string
            history: Message[]
        }>
    }[],
): Agent => {
    const model = modelCTX.load({ temperature: 0 });

    return RunnableSequence.from([
        RunnablePassthrough.assign({
            history: (input) => getHistory(input.history),
            code: (input) => input.snippet.code,
            language: (input) => input.snippet.language,
        }),

        ...messages.map(({ key, type, template }) => [
            RunnablePassthrough.assign({
                startTime: () => process.hrtime(),
                [`${key}Response`]: RunnableSequence.from([template, model]),
            }),
            RunnablePassthrough.assign({
                // Textual content
                [key]: (input) => (input[`${key}Response`] as AIMessageChunk).content,

                // Output message
                [`${key}Message`]: (input) => {
                    const response = input[`${key}Response`] as AIMessageChunk;
                    const time = process.hrtime(input.startTime as [number, number]);

                    return {
                        type,
                        content: response.content as string,
                        tokenCountInput: response.response_metadata.tokenUsage?.promptTokens,
                        tokenCountOutput: response.response_metadata.tokenUsage?.completionTokens,
                        timeMS: Math.round(time[0] * 1000 + time[1] / 1e6),
                    };
                },
            }),
        ]).flat(),

        // Gather list of messages
        (output) => messages.map(({ key }) => output[`${key}Message`] as AgentMessage),
    ]);
};

export const agents = {
    control: createAgent([
        {
            key: 'answer',
            type: 'ai',
            template: ChatPromptTemplate.fromMessages([
                ['system', `You are a helpful assistant. The user is given a code snippet which they have to understand. Note that the user did not write the code or provide the code snippet themselves.
                    
Code: """{language}
{code}
"""

Produce an appropriate response to the user's input.`],
                new MessagesPlaceholder('history'),
                ['user', '{input}'],
            ]),
        },
    ]),

    tom: createAgent([
        {
            key: 'questions',
            type: 'internal',
            template: ChatPromptTemplate.fromMessages([
                ['system', `You are a helpful assistant. The user is given a code snippet which they have to understand. Note that the user did not write the code or provide the code snippet themselves.
                    
Code: """{language}
{code}
"""`],
                new MessagesPlaceholder('history'),
                ['user', '{input}'],
                ['user', 'Identify what aspects of the user\'s mental state are directly relevant to producing a response to the user\'s input. Phrase these aspects as open-ended questions. The questions should be different enough from each other to each provide valuable insights. Make sure the questions are about the user\'s mental state and are not leading.'],
            ]),
        },
        {
            key: 'mentalState',
            type: 'internal',
            template: ChatPromptTemplate.fromMessages([
                ['system', `You are a helpful assistant. The user is given a code snippet which they have to understand. Note that the user did not write the code or provide the code snippet themselves.

Code: """{language}
{code}
"""`],
                new MessagesPlaceholder('history'),
                ['user', '{input}'],
                ['user', `Take the perspective of the user. Answer the following questions about the user's mental state, and explain how this mental state has led to the user's messages. Note that the user did not write the code or provide the code snippet themselves. Therefore, you cannot base your answers on the code snippet or on any code the user copies and pastes, only on the conversation history. Phrase the answers as independent statements, not as responses to the questions.

Questions: """
{questions}
""".`],
            ]),
        },
        {
            key: 'answer',
            type: 'ai',
            template: ChatPromptTemplate.fromMessages([
                ['system', `You are a helpful assistant. The user is given a code snippet which they have to understand. Note that the user did not write the code or provide the code snippet themselves.

Code: """{language}
{code}
"""

Produce an appropriate response to the user's input.`],
                new MessagesPlaceholder('history'),
                ['user', '{input}'],
                ['user', `You have identified the mental state of the user. Use this mental state to produce an appropriate response. Do not mention how the response is based on the user's mental state.
                
Mental state: """
{mentalState}
"""`],
            ]),
        },
    ]),
} as const;
