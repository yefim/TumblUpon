from __future__ import with_statement
import sqlite3
import json

from flask import Flask, request, session, g, redirect, url_for, \
             abort, render_template, flash
from werkzeug import check_password_hash, generate_password_hash

from utils import api, thread_map


#configuration
DATABASE = '/tmp/flaskr.db'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'

TUMBLR = 'http://api.tumblr.com/v2/'
API_KEY = 'wnsr7xgJJz7Dpjcm0S9YNWe1UbJHc4oGwVYUhtvkykcPK678rA'

app = Flask(__name__)
app.config.from_object(__name__)


# Database functions

def connect_db():
    """Connect to the database."""
    return sqlite3.connect(app.config['DATABASE'])


def query_db(query, args=(), one=False):
    """Queries the database and returns a list of dictionaries."""
    cur = g.db.execute(query, args)
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv


def init_db():
    """Flush the database."""
    with closing(connect_db()) as db:
        with app.open_resource('schema.sql') as f:
            db.cursor().executescript(f.read())
        db.commit()


def get_user_id(username):
    """Convenience method to look up the id for a username."""
    rv = g.db.execute('select user_id from user where username = ?',
                       [username]).fetchone()
    return rv[0] if rv else None


@app.before_request
def before_request():
    g.user = None
    if 'user_id' in session:
        g.user = query_db('select * from user where user_id = ?',
                          [session['user_id']], one=True)
    g.db = connect_db()


@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test01')
def test01():
    return render_template('test01.html')

def get_tumblr_tag(tag):
    return api(TUMBLR, 'tagged', api_key=API_KEY, tag=tag)['response']


# API


@app.route('/api/v1/blog/<host_name>/post/<post_id>/')
def post(host_name, post_id):
    response = api(TUMBLR, 'blog', host_name, 'posts', id=post_id, api_key=API_KEY)['response']
    blog = response['blog']
    post = response['posts'][0]
    return render_template('post.html', post=post, blog=blog)


@app.route('/api/v1/tags/<tag>/')
def tag(tag):
    return json.dumps(get_tumblr_tag(tag))


POPULAR = ['Fashion']


@app.route('/api/v1/popular/')
def popular():
    responses = []
    for response in thread_map(get_tumblr_tag, POPULAR):
        responses.extend(response)
    return json.dumps(responses)


if __name__ == '__main__':
    app.run(debug=True)
