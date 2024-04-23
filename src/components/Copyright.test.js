import renderer from 'react-test-renderer';
import Copyright from './Copyright';

it('renders Copyright correctly', () => {
  const tree = renderer
    .create(<Copyright />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});