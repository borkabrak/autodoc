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

# Where the DITOOL source code lives
DITOOL="/cygdrive/c/TFS/Data Intelligence Tool/src/ditool/DEV"

##############################################################################
# Default target (what happens when you just run:
#    $ make


all: build publish tidy


##############################################################################

build: analyze-kaml analyze-jsdoc process-templates convert-to-html make-index

analyze-kaml: 
	# [KAML elements] => [spec data]
	$(PROJECT_ROOT)/bin/make_spec $(PROJECT_ROOT)/analysis.json

analyze-jsdoc:
	# [JSDoc comments] => [spec data]
	$(PROJECT_ROOT)/bin/jsdoc2json $(DITOOL)/api.js

process-templates: cd
	# [spec data] + *.mkd => *.markdown
	$(PROJECT_ROOT)/bin/ttk doc/*.mkd -d analysis.json -e "markdown"

convert-to-html:
	# Convert *.markdown files to html
	$(PROJECT_ROOT)/bin/markdown2html *.markdown
	
make-index:
	$(PROJECT_ROOT)/bin/ttk index.html.tt -d analysis.json

publish:
	# Publish the files to the web dir
	cp $(PROJECT_ROOT)/*.html $(WEBDIR)/
	cp $(PROJECT_ROOT)/*.css $(WEBDIR)/
	cp $(PROJECT_ROOT)/*.js $(WEBDIR)/
	cp $(PROJECT_ROOT)/*.png $(WEBDIR)/


##############################################################################
sloppy: build publish
	# Publish, but leave converted files in doc directory

tidy:
	# Remove converted files
	rm -f $(PROJECT_ROOT)/*.markdown
	rm -f $(PROJECT_ROOT)/*.html
	
clean: tidy
	# Remove all published files
	rm -f $(WEBDIR)/*.html
	rm -f $(WEBDIR)/*.css
	rm -f $(WEBDIR)/*.js
	rm -f $(WEBDIR)/*.png

cd:
	#switch to project home dir
	cd $(PROJECT_ROOT)/ 
