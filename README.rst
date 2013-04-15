Install django
--------------

Visit https://www.djangoproject.com/download/1.5/tarball/ and install the
latest release (version 1.5) by following the instructions.


Test
----

- Change to the base directory where the project is hosted.

- Open "pywfman/settings.py", go to line 56, and edit **MEDIA_ROOT** to the
  path where you want to put the jail.

- Type "python manage.py runserver" to start the test server.

- Open a web browser and go to "http://localhost:8000/wfman/".

- Login in with the accounts below:

  username: *superuser*
  password: *superpass*
