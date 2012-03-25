from __future__ import with_statement
import sqlite3
#import psycopg2
import json
from contextlib import closing

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
    g.db = connect_db()
    g.user = None
    if 'user_id' in session:
        g.user = query_db('select * from user where user_id = ?',
                          [session['user_id']], one=True)


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

def get_tumblr_tag(tag, offset=0):
    return api(TUMBLR, 'tagged', offset=offset, api_key=API_KEY, tag=tag)['response']

# LOGIN

def authenticate(username, password):
    """Attempt to log the user in. Raises a ValueError on bad credentials."""
    users = query_db('select * from user')
    for user in users:
        if user['username'] == username:
            if check_password_hash(generate_password_hash(password), password):
                session['user_id'] = user['user_id']
                break
            else:
                print "bad password"
                raise ValueError('Invalid password')
    else:
        raise ValueError('Invalid username')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            authenticate(request.form['username'], request.form['password'])
        except ValueError as e:
            return render_template('login.html', error=str(e))
        else:
            flash('You were logged in')
            return redirect(url_for('index'))
    else:
        if g.user:
            return redirect(url_for('index'))
        else:
            return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('You were logged out')
    return redirect(url_for('index'))


def user_create(username, email, password):
    g.db.execute('''insert into user (
        username, email, pw_hash) values (?, ?, ?)''',
        [username, email, generate_password_hash(password)])
    user_id = get_user_id(username)
    # for tag in POPULAR:
    #    g.db.execute('''insert into tag (
    #        tag, user_id) values (?, ?)''',
    #        [tag, user_id])
    g.db.commit()


@app.route('/register', methods=['GET', 'POST'])
def register():
    """Registers the user."""
    if g.user:
        return redirect(url_for('index'))
    error = None
    if request.method == 'POST':
        if not request.form['username']:
            error = 'You have to enter a username'
        elif not request.form['email'] or \
                 '@' not in request.form['email']:
            error = 'You have to enter a valid email address'
        elif not request.form['password']:
            error = 'You have to enter a password'
        elif request.form['password'] != request.form['password2']:
            error = 'The two passwords do not match'
        elif get_user_id(request.form['username']) is not None:
            error = 'The username is already taken'
        else:
            user_create(request.form['username'], request.form['email'], request.form['password'])
            flash('You were successfully registered and can login now')
            return redirect(url_for('login'))
    return render_template('register.html', error=error)


# User Resource


@app.route('/tag/create/<tag>/', methods=['GET'])
def create_tag(tag):
    if g.user:
        user_id = session['user_id']
        if tag not in get_user_tags(user_id):
            g.db.execute('''insert into tag (
                tag, user_id) values (?, ?)''',
                [tag, user_id])
            g.db.commit()
            flash("Added tag: %s" % tag)
    return redirect(url_for('index'))

def get_user_tags(user_id):
    for tag in g.db.execute('select tag from tag where user_id=?', [user_id]):
        yield tag[0]

@app.route('/tags/', methods=['GET'])
def tags():
    if g.user:
        user_id = session['user_id']
        return json.dumps(list(get_user_tags(user_id)))
    return redirect(url_for('index'))




@app.route('/tag/destroy/<tag>/', methods=['GET'])
def delete_tag(tag):
    if g.user:
        user_id = session['user_id']
        tags = get_user_tags(user_id)
        if tag in tags:
            g.db.execute('''delete from tag where tag=? and user_id=?''',
                [tag, user_id])
            g.db.commit()
            flash("Deleted tag: %s" % tag)
    return redirect(url_for('index'))


@app.route('/settings/', methods=['GET'])
def settings():
    if not g.user:
        return redirect(url_for('index'))
    user_id = session['user_id']
    tags = get_user_tags(user_id)
    return render_template('settings.html', tags=tags)


# API


@app.route('/api/v1/blog/<host_name>/post/<post_id>/')
def post(host_name, post_id):
    response = api(TUMBLR, 'blog', host_name, 'posts', id=post_id, api_key=API_KEY)['response']
    blog = response['blog']
    post = response['posts'][0]
    return render_template('post.html', post=post, blog=blog)


@app.route('/api/v1/tags/<tag>/')
def tag(tag):
    responses = []
    data, tag = get_tumblr_tag(tag)
    for response in data:
        response['tag'] = tag
        responses.append(response)
    return json.dumps(responses)

def tagify(d, tag):
    """Add a tag to a dict"""
    d['tag'] = tag
    return d


POPULAR = ['LOL', 'fashion', 'vintage', 'landscape', 'animals', 'illustration', 'gaming', 'art', 'makeup', 'film', 'tattoos', 'typography', 'food', 'crafts']


@app.route('/api/v1/popular/')
def popular():
    if g.user:
        responses = []
        try:
            offset = request.args.get('offset', '')
        except KeyError:
            offset = 0
        def get_data(tag):
            return get_tumblr_tag(tag, offset=offset), tag

        user_id = session['user_id']
        tags = get_user_tags(user_id)
        if tags:
            for data, tag in thread_map(get_data, tags):
                for response in data:
                    response['tag'] = tag
                    responses.append(response)
        return json.dumps(responses)
    else:
        responses = []
        try:
            offset = request.args.get('offset', '')
        except KeyError:
            offset = 0
        def get_data(tag):
            return get_tumblr_tag(tag, offset=offset)
        for response in thread_map(get_data, POPULAR):
            responses.extend(response)
        return json.dumps(responses)


if __name__ == '__main__':
    app.run(debug=True)
