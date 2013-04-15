#-*- coding: UTF-8 -*-

import os

from pywfman import settings

class FCore:
	"""
	File system node core class
	"""

	def __init__(self, path='', root=settings.MEDIA_ROOT):
		self._root = root
		self.setPath(path)

	def _isReadable(self):
		"""
		Check readability
		"""
		return os.access(self.getPath(), os.F_OK | os.R_OK)

	def _checkPath(self, s):
		"""
		Check operating permission
		"""
		if not s.startswith(self._root + '/') and not self._root == s:
			raise Exception('No permission on "%s".' % s)

	def getPath(self):
		"""
		Set current path
		"""
		return self._path

	def setPath(self, path=''):
		"""
		Get current path
		"""
		# determine current path
		if path:
			s = '/' + path.lstrip('/')
		else:
			s = self._root

		self._checkPath(s)
		self._path = os.path.realpath(s)
		self._parent, self._name = os.path.split(self.getPath())

		if self._isReadable():
			self._stats = os.lstat(self._path)

	def getParent(self):
		"""
		Get path of parent node
		"""
		return self._parent

	def getName(self):
		"""
		Get (directory/file) name
		"""
		return self._name

	def isRoot(self):
		"""
		Check if it is the root
		"""
		return bool(self._root == self._path)

	def isDir(self):
		"""
		Check if it is a directory
		"""
		return bool(0 < (self._stats[0] & 0x4000))
