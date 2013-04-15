#-*- coding: UTF-8 -*-

import logging, os

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import redirect
from django.template import Context, loader

from wfman.fbrowsee import FBrowsee
from wfman.fviewee import FViewee
from wfman.fwriter import FWriter

CONTENT_TEXT = 'text/plain; charset=UTF-8'
CONTENT_HTML = 'text/html; charset=UTF-8'

def index(req):
	# redirect user to login if necessary
	if not req.user or not req.user.is_authenticated():
		return redirect('/wfman/login')

	from django.core.context_processors import csrf
	c = Context({})
	c['user'] = req.user
	c.update(csrf(req))
	template = loader.get_template('wfman/index.html')
	s = template.render(c)
	return HttpResponse(s)

def login(req):
	# redirect user to index if he/she has already done so
	if req.user and req.user.is_authenticated():
		return redirect('/wfman/')

	from django.core.context_processors import csrf
	c = Context({})
	c.update(csrf(req))
	if req.POST and req.POST['username'] and req.POST['password']:
		from django.contrib.auth import authenticate, login
		uname = req.POST['username']
		pword = req.POST['password']
		user = authenticate(username=uname, password=pword)
		if user is None:
			# login failed
			c['username'] = uname
			c['password'] = pword
			c['errmsg'] = 'Login failed.'
		else:
			# login succeeded
			login(req, user)
			c['user'] = req.user
			return redirect('/wfman/')
	template = loader.get_template('wfman/login.html')
	s = template.render(c)
	return HttpResponse(s)

def logoff(req):
	from django.contrib.auth import logout
	logout(req)
	# redirect to login page
	return redirect('/wfman/login/')

def css(req, path=''):
	try:
		template = loader.get_template('wfman/css/' + path)
		s = template.render(Context({}))
	except Exception as e:
		s = '/* !!! Error loading style file "%s" !!! */' % path
		logging.exception('Cannot load css "%s".' % path)
	return HttpResponse(s, content_type='text/css; charset=UTF-8')

def js(req, path=''):
	try:
		template = loader.get_template('wfman/js/' + path)
		s = template.render(Context({}))
	except Exception as e:
		s = '/* !!! Error loading script file "%s" !!! */' % path
		logging.exception('Cannot load js "%s".' % path)
	return HttpResponse(s, content_type='text/javascript; charset=UTF-8')

def image(req, path=''):
	data = open(os.path.realpath(os.path.dirname(__file__) + '/../templates/wfman/image/' + path), 'rb').read()
	imgType = path.rsplit('.', 1)[-1].lower()
	if 'jpg' == imgType:
		imgType = 'jpeg'
	contentType = 'image/%s' % imgType
	return HttpResponse(data, content_type=contentType)

@login_required
def fblist(req, path=''):
	"""
	List files and folders
	"""
	fb = FBrowsee(path)
	template = loader.get_template('wfman/list.html')
	context = Context({
		'current': fb
	})

	if fb.isDir():
		context['fblist'] = fb.list()

	return HttpResponse(template.render(context))

@login_required
def fbcopy(req):
	"""
	Copy file or folder
	"""
	import json, shutil

	if req.POST and req.POST['from'] and req.POST['to']:
		sFrom = req.POST['from']
		sTo = req.POST['to']
		try:
			fb = FBrowsee(req.POST['from'])
			fb.copy(req.POST['to'])
			c = 200
			s = '"%s" copied to "%s" successfully.' % (sFrom, sTo)
		except IOError as ioe:
			c = 500
			s = "Unable to copy: %s" % ioe
			logging.exception(s)
	return HttpResponse(s, CONTENT_TEXT, c)

@login_required
def fbmove(req):
	"""
	Move file or folder
	"""
	import json, shutil

	if req.POST and req.POST['from'] and req.POST['to']:
		sFrom = req.POST['from']
		sTo = req.POST['to']
		try:
			fb = FBrowsee(req.POST['from'])
			fb.move(req.POST['to'])
			c = 200
			s = '"%s" moved to "%s" successfully.' % (sFrom, sTo)
		except IOError as ioe:
			c = 500
			s = "Unable to move: %s" % ioe
			logging.exception(s)
	return HttpResponse(s, CONTENT_TEXT, c)

@login_required
def fbdelete(req, path=''):
	"""
	Delete file or folder
	"""
	try:
		fb = FBrowsee(path)
		fb.delete()
		c = 200
		s = '"%s" deleted successfully.' % path
	except Exception as e:
		c = 500
		s = 'Error deleting "%s".' % path
		logging.exception(s)
	return HttpResponse(s, CONTENT_TEXT, c)

@login_required
def fbview(req, path=''):
	"""
	Show file content
	"""
	try:
		fv = FViewee(path)
		c = 200
		t, s = fv.show()
	except Exception as e:
		c = 500
		s = 'Error viewing "%s": %s' % (path, e.message)
		t = CONTENT_TEXT
		logging.exception(s)
	return HttpResponse(s, t, c)

@login_required
def fbnewdir(req, path=''):
	"""
	Create new node as folder
	"""
	try:
		fw = FWriter(path)
		fw.newdir()
		c = 200
		s = 'Folder "%s" created successfully.' % path
	except Exception as e:
		c = 500
		s = 'Error creating folder "%s": %s' % (path, e.message)
		logging.exception(s)
	return HttpResponse(s, CONTENT_TEXT, c)

@login_required
def fbupload(req):
	"""
	Upload file
	"""
	c = 400
	s = 'File upload incomplete.'
	if req.POST and req.FILES:
		try:
			path = req.POST['path']
			fname = req.FILES['file'].name
			fw = FWriter(os.path.join(path, fname))
			fw.newfile(req.FILES['file'])
			c = 200
			s = 'File "%s" uploaded successfully.' % fname
		except Exception as e:
			c = 500
			s = 'Error uploading file "%s": %s' % (fname, e.message)
			logging.exception(s)
	return HttpResponse(s, CONTENT_TEXT, c)
