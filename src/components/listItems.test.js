import renderer from 'react-test-renderer';
import { mainListItem, secondaryListItem } from './listItems';

it('renders mainListItem correctly', () => {
  const tree = renderer
    .create(<mainListItem />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders secondaryListItem correctly', () => {
  const tree = renderer
    .create(<secondaryListItem />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});