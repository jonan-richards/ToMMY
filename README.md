# ToMMY - web client and replication package
This is the replication package for my Master's thesis "What You Need is What You Get: Theory of Mind for LLM-Generated Code Explanations".

## Files
The package contains the following items:
- `/analysis`
    - `data`: processed dataset
    - `clean-data.ipynb`: data cleaning pipeline
    - `simulate-conversations.ipynb`: light-weight evaluation of ToMMY
    - `user-study.ipynb`: data analysis pipeline
- `/screenshots`: screenshots of the different screens encountered in the web client
- `/task`
    - `questions`: quiz questions and answers for the code snippets
    - `snippets`: code snippets and licenses
    - `design.ipynb`: quiz question and answer creation pipeline
    - `design.json`: config file detailing the tasks, models (agents), and participant groups
- `/web`
    - `api`: backend of the web client
    - `client`: frontend of the web client
    - `shared`: type definitions shared between the backend/frontend

The most noteworthy files are:
- `/analysis/data`: our dataset
- `/analysis/simulate-conversations.ipynb`: contains a Python implementation of ToMMY and the control approach
- `/web/api/src/lib/agent.ts`: contains a Javascript implementation of ToMMY and the control approach

## Web client
To run the web client, `Node.js` needs to be installed. Next, run `npm i` in the `/web` directory. Add your OpenAI key and any string as JWT key in `/web/.env.template`, and rename this file to `.env`. Also, run the `prisma-generate:dev` and `prisma-push:dev` npm scripts in `/web/api`. Add the URLs to your qualtrics surveys to the database for the following keys (steps): `welcome`, `quiz-natural-language-processing`, `evaluation-A`, `quiz-data-analysis`, and `evaluation-B`.

The following npm scripts are available:
- `/web/client`
    - `dev`: run the frontend locally.
    - `host`: run the frontend, exposed to the local network. A self-signed certificate is used, browsers may give warnings.
- `/web/api`
    - `start:dev`: run the backend, suitable when both running the frontend locally or exposed to the local network.
    - `prisma-studio:dev`: run Prisma studio, to conveniently inspect and modify the database.
    - `generate-credentials`: generate login credentials for a new participant. Create the user manually using these credentials through Prisma studio, and set their group to either `control-first` or `tom-first`.
    - `dump-data`: save the relevant data from the `SQlite` database to a file in `/analysis/data`, to be further processed in `/analysis/clean-data.ipynb`.
