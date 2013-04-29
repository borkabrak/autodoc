##############################################################################
#
# Build and deploy the ditool documentation site
#
#   Make should remain idempotent (i.e., it never hurts to run it)
#   This means: 
#       - it never changes human-composed doc files (.mkd)
#       - When it cleans up, it removes ONLY FILES THAT IT CREATED
#
##############################################################################

# Where the website lives
WEBDIR=/srv/www/htdocs/didoc

# Where DIDoc lives
PROJECT_ROOT=/home/jcarter/ditool/didoc

##############################################################################
# Default target (what happens when you just run 'make')


all: build publish tidy_up


##############################################################################

build: analyze generate_markdown convert_to_html 

analyze:
	# Build a knowledge base of everything we can programatically discover
	$(PROJECT_ROOT)/bin/analyze $(PROJECT_ROOT)/bin/analysis.json

generate_markdown: cd
	# Consolidate doc with analysis data
	bin/doc2markdown *.mkd

convert_to_html:
	# Convert the files
	$(PROJECT_ROOT)/bin/autodoc $(PROJECT_ROOT)/*.markdown

publish:
	# Publish the files to the web dir
	cp $(PROJECT_ROOT)/*.html $(WEBDIR)/
	cp $(PROJECT_ROOT)/bin/*.css $(WEBDIR)/
	cp $(PROJECT_ROOT)/bin/*.js $(WEBDIR)/


##############################################################################
sloppy: build publish
	# Publish, but leave converted files in doc directory

tidy_up:
	# Remove converted files from doc directory
	rm -f $(PROJECT_ROOT)/*.html
	rm -f $(PROJECT_ROOT)/*.markdown
	
clean: tidy_up
	# Remove all generated files -- including published
	rm -f $(WEBDIR)/*.html

cd:
	#switch to project home dir
	cd $(PROJECT_ROOT)/ 
