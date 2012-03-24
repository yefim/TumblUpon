import json
import threading
import urllib
import urllib2


def api(domain, *args, **kwargs):
    assert domain.endswith("/")
    path = "".join((domain, "/".join([str(arg) for arg in args]), "?", urllib.urlencode(kwargs)))
    try:
        response = urllib2.build_opener().open(path)
    except urllib2.HTTPError:
        raise ValueError("invalid path: %s", path)
    return json.loads(response.read())




class Mapper(threading.Thread):
    def __init__(self, func, item):
        self.func = func
        self.item = item
        self.result = None 
        super(Mapper, self).__init__()

    def run(self):
        self.result = self.func(self.item)


def thread_map(func, iterable):
    """Run a function in parallel with threads."""
    threads = []
    for item in iterable:
        thread = Mapper(func, item)
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()
        yield thread.result
