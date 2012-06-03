from __future__ import with_statement
import os
import json
from contextlib import closing

from flask import Flask, request, session, g, redirect, url_for, \
             abort, render_template, flash
from flask.ext.sqlalchemy import SQLAlchemy
from werkzeug import check_password_hash, generate_password_hash

from utils import api, thread_map


#configuration
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'

TUMBLR = 'http://api.tumblr.com/v2/'
API_KEY = 'wnsr7xgJJz7Dpjcm0S9YNWe1UbJHc4oGwVYUhtvkykcPK678rA'

app = Flask(__name__)
app.config.from_object(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:////tmp/tumblupon.db')
db = SQLAlchemy(app)

# Models

class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    pw_hash = db.Column(db.String(160))

    def __init__(self, username, pw_hash):
        self.username = username
        self.pw_hash = pw_hash

class Tag(db.Model):
    tag_id = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String(100))
    user_id = db.Column(db.Integer)

    def __init__(self, tag, user_id):
        self.tag = tag
        self.user_id = user_id


# Database functions



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
    user = User.query.filter_by(username=username).first()
    return user.user_id if user else None

@app.before_request
def before_request():
    g.user = None
    if 'user_id' in session:
        g.user = User.query.filter_by(user_id=session['user_id']).first()

@app.route('/')
def index():
    return render_template('index.html')

def get_tumblr_tag(tag, offset=0):
    return api(TUMBLR, 'tagged', offset=offset, api_key=API_KEY, tag=tag)['response']

# LOGIN

def authenticate(username, password):
    """Attempt to log the user in. Raises a ValueError on bad credentials."""
    user = User.query.filter_by(username=username).first()
    if not user:
        raise ValueError('Invalid username')
    if check_password_hash(user.pw_hash, password):
        session['user_id'] = user.user_id
    else:
        raise ValueError('Invalid password')

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


def user_create(username, password):
    user = User(username, generate_password_hash(password))
    db.session.add(user)
    db.session.commit() # only after commiting do you have user.user_id
    first_tag = Tag('cats', user.user_id)
    db.session.add(first_tag)
    db.session.commit()


@app.route('/register', methods=['GET', 'POST'])
def register():
    """Registers the user."""
    if g.user:
        return redirect(url_for('index'))
    error = None
    if request.method == 'POST':
        if not request.form['username']:
            error = 'You have to enter a username'
        elif not request.form['password']:
            error = 'You have to enter a password'
        elif request.form['password'] != request.form['password2']:
            error = 'The two passwords do not match'
        elif get_user_id(request.form['username']) is not None:
            error = 'The username is already taken'
        else:
            user_create(request.form['username'], request.form['password'])
            authenticate(request.form['username'], request.form['password'])
            return redirect(url_for('settings'))
    return render_template('register.html', error=error)


# User Resource


@app.route('/tag/create/<tag>/', methods=['GET'])
def create_tag(tag):
    if g.user:
        user_id = session['user_id']
        if tag not in get_user_tags(user_id):
            t = Tag(tag, user_id)
            db.session.add(t)
            db.session.commit()
            flash("Added tag: %s" % tag)
    return redirect(url_for('index'))

def get_user_tags(user_id):
    for t in Tag.query.filter_by(user_id=user_id).all():
        yield t.tag

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
        tag_to_delete = Tag.query.filter_by(tag=tag, user_id=user_id).first()
        if tag_to_delete:
            db.session.delete(tag_to_delete)
            db.session.commit()
            flash("Deleted tag: %s" % tag)
    return redirect(url_for('index'))


@app.route('/dashboard/', methods=['GET'])
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
    data = get_tumblr_tag(tag)
    for response in data:
        response['tag'] = tag
        responses.append(response)
    return json.dumps(responses)

def tagify(d, tag):
    """Add a tag to a dict"""
    d['tag'] = tag
    return d


#POPULAR = ['LOL', 'fashion', 'vintage', 'landscape', 'animals', 'illustration', 'gaming', 'art', 'makeup', 'film', 'tattoos', 'typography', 'food', 'crafts']

POPULAR = ['fashion', 'landscape', 'animals']

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
    db.create_all()
    port = int(os.environ.get('PORT',5000))
    app.run(host='0.0.0.0', port=port, debug=True)
