import renderer from 'react-test-renderer';
import App from 'App';

beforeAll(() => {
  // Swallowing warnings due to some unavoidable path warnings with small sample app
  // eslint-disable-next-line no-console
  console.warn = () => true;
});

it('renders correctly', () => {
  const tree = renderer
    .create(<App />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});