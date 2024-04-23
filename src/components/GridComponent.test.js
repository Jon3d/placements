import renderer from 'react-test-renderer';
import GridComponent from './GridComponent';

it('renders GridComponent correctly', () => {
  const data = [];
  const pagination = {
    start: 0,
    size: 10,
    total: 0,
  };
  const setPage = () => { };
  const setCount = () => { };
  const setSort = () => { };
  const loading = false;
  const exportFile = () => { };
  const props = {
    data,
    pagination,
    setPage,
    setCount,
    setSort,
    loading,
    exportFile,
  };

  const tree = renderer
    .create(<GridComponent {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});