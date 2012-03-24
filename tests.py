import json
import unittest

import tumblupon


class TumblUponTestCase(unittest.TestCase):

    def test_get_tumbr_tag(self):
        got = tumblupon.get_tumblr_tag('LOL')
        self.assertTrue(len(got) == 20)

    def test_popular_returns_valid_json(self):
        self.assertTrue(json.loads(tumblupon.popular()))


if __name__ == "__main__":
    unittest.main()
