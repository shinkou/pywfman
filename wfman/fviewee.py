#-*- coding: UTF-8 -*-

import mimetypes, os

from wfman.fcore import FCore

class FViewee(FCore):
	"""
	File system node viewee class
	"""

	def show(self):
		"""
		Show contents
		"""
		if self.isDir():
			raise Exception('Only file contents can be shown.')
		n, ext = os.path.splitext(self.getName())
		mimetypes.init()
		try:
			t = mimetypes.types_map[ext]
		except Exception as e:
			# RFC2046 section 4.5.1
			t = 'application/octet-stream'
		data = open(self.getPath(), 'rb').read()
		return [t, data]
