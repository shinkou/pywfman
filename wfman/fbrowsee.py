#-*- coding: UTF-8 -*-

import logging, os, shutil

from wfman.fcore import FCore

class FBrowsee(FCore):
	"""
	File system node browsee class
	"""

	def list(self):
		"""
		List nodes under
		"""
		if self.isDir():
			out = []
			a = os.listdir(self.getPath())
			for i in a:
				out.append(FBrowsee(self.getPath() + '/' + i))
			return sorted(out, key=lambda k: (not k.isDir(), k.getPath()))
		else:
			raise Exception('Only directories can be listed.')

	def copy(self, dst):
		"""
		Copy to dst
		"""
		s = self.getPath()
		d = os.path.join(dst, self.getName())
		if (self.isDir()):
			shutil.copytree(s, d)
			logging.info('Copied directory "%s" to "%s".' % (s, d))
		else:
			shutil.copy(s, d)
			logging.info('Copied file "%s" to "%s".' % (s, d))

	def move(self, dst):
		"""
		Move to dst
		"""
		s = self.getPath()
		d = os.path.join(dst, self.getName())
		shutil.move(s, d)
		logging.info('Moved "%s" to "%s".' % (s, d))

	def delete(self):
		"""
		Delete node
		"""
		if self.isDir():
			shutil.rmtree(self.getPath())
			logging.info('Deleted directory "%s".' % self.getPath())
		else:
			os.remove(self.getPath())
			logging.info('Deleted file "%s".' % self.getPath())
