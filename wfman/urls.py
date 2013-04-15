#-*- coding: UTF-8 -*-

from django.conf.urls import patterns, url

from wfman import views

urlpatterns = patterns(''
	, url(r'^$', views.index, name='index')
	, url(r'^css/(?P<path>.*)$', views.css, name='css')
	, url(r'^js/(?P<path>.*)$', views.js, name='js')
	, url(r'^image/(?P<path>.*)$', views.image, name='image')

	, url(r'^login/?$', views.login, name='login')
	, url(r'^logout/?$', views.logoff, name='logout')

	, url(r'^list/(?P<path>.*)$', views.fblist, name='list')
	, url(r'^delete/(?P<path>.*)$', views.fbdelete, name='delete')
	, url(r'^copy(?:/.*)$', views.fbcopy, name='copy')
	, url(r'^move(?:/.*)$', views.fbmove, name='move')
	, url(r'^view/(?P<path>.*)$', views.fbview, name='view')
	, url(r'^newdir/(?P<path>.*)$', views.fbnewdir, name='newdir')
	, url(r'^upload(?:/.*)$', views.fbupload, name='upload')
)
