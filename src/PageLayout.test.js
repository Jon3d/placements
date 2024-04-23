import renderer from 'react-test-renderer';
import PageLayout from 'PageLayout';

beforeAll(() => {
  // Swallowing warnings due to some unavoidable path warnings with small sample app
  // eslint-disable-next-line no-console
  console.warn = () => true;
});

it('renders correctly', () => {
  const tree = renderer
    .create(<PageLayout />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});