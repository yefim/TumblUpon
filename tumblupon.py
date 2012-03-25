from __future__ import with_statement
import sqlite3

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

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/test01')
def test01():
    return render_template('test01.html')

@app.route('/test2')
def test2():
    return render_template('test2.html')

# LOGIN

def authenticate(username, password):
    """Attempt to log the user in. Raises a ValueError on bad credentials."""
    users = query_db('select * from user')
    for user in users:
        if user['username'] == username:
            if check_password_hash(generate_password_hash(password), password):
                session['logged_in'] = True
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
        return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('index'))


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
            g.db.execute('''insert into user (
                username, email, pw_hash) values (?, ?, ?)''',
                [request.form['username'], request.form['email'],
                 generate_password_hash(request.form['password'])])
            g.db.commit()
            flash('You were successfully registered and can login now')
            return redirect(url_for('login'))
    return render_template('register.html', error=error)


# API FUNCTIONS


def get_tumblr_tag(tag):
    return api(TUMBLR, 'tagged', api_key=API_KEY, tag=tag)['response']


@app.route('/api/v1/tags/<tag>/')
def tag(tag):
    return json.dumps(get_tumblr_tag(tag))


POPULAR = ['LOL', 'Fashion', 'GIFS', 'Vintage', 'Landscape']


@app.route('/api/v1/popular/')
def popular():
    responses = []
    for response in thread_map(get_tumblr_tag, POPULAR):
        responses.extend(response)
    return json.dumps(responses)


if __name__ == '__main__':
    app.run(debug=True)
