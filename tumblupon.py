import json

from flask import Flask, render_template
from utils import api
app = Flask(__name__)


TUMBLR = 'http://api.tumblr.com/v2/'
API_KEY = 'wnsr7xgJJz7Dpjcm0S9YNWe1UbJHc4oGwVYUhtvkykcPK678rA'


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test')
def test():
    return render_template('test.html')


@app.route('/api/v1/tags/<tag>/')
def get_tag(tag):
    return json.dumps(api(TUMBLR, api_key=API_KEY, tag=tag))


if __name__ == '__main__':
    app.run(debug=True)
