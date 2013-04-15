#-*- coding: UTF-8 -*-

import os

from wfman.fcore import FCore

class FWriter(FCore):
	"""
	File system node writer class
	"""

	def newdir(self):
		"""
		Create new node as folder
		"""
		if os.path.exists(self.getPath()):
			raise Exception('File or directory already exists.')
		os.makedirs(self.getPath())
		# update info
		self.setPath(self.getPath())

	def newfile(self, f):
		"""
		Create new node as file
		"""
		if os.path.exists(self.getPath()):
			raise Exception('File or directory already exists.')
		with open(self.getPath(), 'wb+') as dst:
			for chunk in f.chunks():
				dst.write(chunk)
