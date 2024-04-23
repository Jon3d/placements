import renderer from 'react-test-renderer';
import Chart from './Chart';

it('renders Chart correctly', () => {
  const tree = renderer
    .create(<Chart />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});