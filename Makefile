# Build the ditool documentation site

DESTINATION=/srv/www/htdocs/didoc

# Default build is first one -- neat

# Publish and clean up after build
neat: build tidy

convert:
	# Convert the files
	./bin/mkd2html *.mkd

sloppy: build
	# Publish, but leave converted files in doc directory

tidy:
	# Remove converted files
	rm -f *.html
	
publish:
	# Publish the files to the web dir
	cp *.html $(DESTINATION)/
	cp *.css $(DESTINATION)/
	cp *.js $(DESTINATION)/

build: convert publish 

clean:
	# Remove all generated files -- including published
	rm -f *.html
	rm -f $(DESTINATION)/*.html

all: neat
