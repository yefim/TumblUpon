import urllib
import urllib2
import json


def api(domain, *args, **kwargs):
  assert domain.endswith("/")
  path = "".join((domain, "/".join([str(arg) for arg in args]), "?", urllib.urlencode(kwargs)))
  try:
    response = urllib2.build_opener().open(path)
  except urllib2.HTTPError as e:
    raise ValueError("invalid path: %s", path)
  return json.loads(response.read())['result']
