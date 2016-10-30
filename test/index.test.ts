import * as assert from 'power-assert';

import * as index from '../src/index';

describe('lib', () => {
  describe('checklist', () => {
    it('should parse string to array', () => {
      const str = 'foo,bar\ntest 1 ,test 2';

      return index.parseCSV(str).then((result) => {
        console.log(result);
        assert.deepEqual(result, [
          ['foo', 'bar'],
          ['test 1 ', 'test 2'],
        ]);
      });
    });
  });
});
