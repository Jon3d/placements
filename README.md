# PIO Takehome test

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
It also uses some example formatting from [MaterialUI](https://v3.mui.com/getting-started/page-layout-examples/).

## API Setup
  For the API component (Flask) you will need to cd into the directory 'api', and run:
    To activate thesource venv/bin/activate

### `source venv/bin/activate`
  To activate the python virtual env

### `pip install -r requirements.txt`
  To install the python requirements

### `flask run` or `yarn start-flask`
  To start a local instance of the api (runs on :3001 by default), you can adjust the ports in {repo_home}/.env \
  You can start the api with either {repo_home}/api/flask run, or {repo_home}/yarn start-flask to start the dev server


## Frontend Setup

In the project root directory, install the dependencies with 'yarn install'

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000/campaigns](http://localhost:3000/campaigns) or [http://localhost:3000/details](http://localhost:3000/details)to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

