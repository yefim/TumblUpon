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

@app.route('/test01')
def test01():
    return render_template('test01.html')

@app.route('/test2')
def test2():
    return render_template('test2.html')

def get_tumblr_tag(tag):
    return api(TUMBLR, 'tagged', api_key=API_KEY, tag=tag)['response']

@app.route('/api/v1/tags/<tag>/')
def tag(tag):
    return json.dumps(get_tumblr_tag(tag))


POPULAR = ['LOL', 'Fashion', 'GIFS', 'Vintage', 'Landscape']


@app.route('/api/v1/popular/')
def popular():
    responses = []
    for tag in POPULAR:
        responses.extend(get_tumblr_tag(tag))
    return json.dumps(responses)


if __name__ == '__main__':
    app.run(debug=True)
