##############################################################################
#
# Build and deploy the ditool documentation site
#
#   Make should remain idempotent (i.e., it never hurts to run it)
#   This means: 
#       - it never changes human-composed doc files
#       - When it cleans up, it removes ONLY FILES THAT IT CREATED
#
##############################################################################

# Set the destination for finished HTML files -- this should be where the web
# server will look for the site.
WEBDIR=/srv/www/htdocs/didoc


# Default target (what happens when you just run 'make')

all: build publish tidy_up


##############################################################################

build: generate_kaml_doc convert_to_html 

generate_kaml_doc:
	# Auto-generate KAML documentation
	bin/generate_kaml_doc

convert_to_html:
	# Convert the files
	bin/autodoc *.mkd

publish:
	# Publish the files to the web dir
	cp *.html $(WEBDIR)/
	cp bin/*.css $(WEBDIR)/
	cp bin/*.js $(WEBDIR)/


##############################################################################
sloppy: build publish
	# Publish, but leave converted files in doc directory

tidy_up:
	# Remove converted files from doc directory
	rm -f *.html
	
clean:
	# Remove all generated files -- including published
	rm -f *.html
	rm -f $(WEBDIR)/*.html
