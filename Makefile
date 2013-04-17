# Build the ditool documentation site

DESTINATION=/srv/www/htdocs/didoc
REPORTS_DIR=di_reports

# Default build is first one -- neat

# Publish and clean up after build
all: build tidy

build: generate convert publish 

generate:
	# Auto-generate documentation, where possible
	./bin/makedoc.pl

publish:
	# Publish the files to the web dir
	cp *.html $(DESTINATION)/
	cp *.css $(DESTINATION)/
	cp *.js $(DESTINATION)/
	cp $(REPORTS_DIR)/*.html $(DESTINATION)/

convert:
	# Convert the files
	./bin/markdown2html *.mkd
	./bin/markdown2html $(REPORTS_DIR)/*.mkd

sloppy: build
	# Publish, but leave converted files in doc directory

tidy:
	# Remove converted files from doc directory
	rm -f *.html
	rm -f $(REPORTS_DIR)/*.html
	
clean:
	# Remove all generated files -- including published
	rm -f *.html
	rm -f $(DESTINATION)/*.html
