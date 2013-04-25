# Build the ditool documentation site

# Set the destination for finished HTML files -- this should be where the web
# server will look for the site.
DESTINATION=/srv/www/htdocs/didoc

# Default build is first one -- neat

# Publish and clean up after build
all: build tidy

build: kaml mkd2html publish 

kaml:
	# Auto-generate KAML documentation
	bin/kamldoc

publish:
	# Publish the files to the web dir
	cp *.html $(DESTINATION)/
	cp bin/*.css $(DESTINATION)/
	cp bin/*.js $(DESTINATION)/

mkd2html:
	# Convert the files
	bin/autodoc *.mkd

sloppy: build
	# Publish, but leave converted files in doc directory

tidy:
	# Remove converted files from doc directory
	rm -f *.html
	
clean:
	# Remove all generated files -- including published
	rm -f *.html
	rm -f $(DESTINATION)/*.html
