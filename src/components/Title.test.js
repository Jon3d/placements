import renderer from 'react-test-renderer';
import Title from './Title';

it('renders Title correctly', () => {
  const tree = renderer
    .create(<Title />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});