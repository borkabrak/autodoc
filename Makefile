##############################################################################
#
# Build and deploy the ditool documentation site
#
#   'make all' should remain idempotent (i.e., running it twice is always the same as
#   running it once. In other words, it never hurts to run it.)
#
#   This means: 
#       - it never changes human-composed doc files (.mkd)
#       - When it cleans up, it removes ONLY FILES THAT IT CREATED
#
##############################################################################

############
## CONFIG ##
############

# Where the website lives
WEBDIR=/srv/www/htdocs/didoc

# Where DIDoc lives
PROJECT_ROOT=/home/jcarter/ditool/didoc

# Where the DITOOL source code lives
#DITOOL="//USHEN048W/Public/Didoc"
DITOOL=$(PROJECT_ROOT)/doc/alt

#######################
## TARGETS (Recipes) ##
#######################

##############################################################################
# 'all' is the default target -- what happens when you just run:
#    $ make

all: build publish clean

##############################################################################

build: analyze-kaml make-function-doc process-templates convert-to-html make-index

analyze-kaml: 
	# Gather information about KAML markup.
	$(PROJECT_ROOT)/bin/make_spec $(DITOOL)/api.js 

make-function-doc: analyze-jsdoc
	# Make the function documentation from the jsdoc data
	$(PROJECT_ROOT)/bin/make-function-doc

process-templates: cd-here
	# [spec data] + *.mkd => *.markdown
	$(PROJECT_ROOT)/bin/ttk doc/*.mkd -d analysis.json -e "markdown"

convert-to-html:
	# Convert *.markdown files to html
	$(PROJECT_ROOT)/bin/markdown2html *.markdown
	
make-index:
	# Make the application's index page.
	$(PROJECT_ROOT)/bin/ttk index.html.tt -d analysis.json

publish:
	# Publish the appropriate files to the web dir
	cp $(PROJECT_ROOT)/*.html $(WEBDIR)/
	cp $(PROJECT_ROOT)/*.css $(WEBDIR)/
	cp $(PROJECT_ROOT)/*.js $(WEBDIR)/
	cp $(PROJECT_ROOT)/*.png $(WEBDIR)/

clean:
	# Remove converted files
	rm -f $(PROJECT_ROOT)/*.markdown
	rm -f $(PROJECT_ROOT)/*.html

##############################################################################

analyze-jsdoc: 
	# [JSDoc comments] => [spec data]
	$(PROJECT_ROOT)/bin/jsdoc2json $(DITOOL)/api.js 

sloppy: build publish
	# Publish, but leave converted files in doc directory

purge: clean
	# Remove all published files
	rm -f $(WEBDIR)/*.html
	rm -f $(WEBDIR)/*.css
	rm -f $(WEBDIR)/*.js
	rm -f $(WEBDIR)/*.png

cd-here:
	#switch to project home dir
	cd $(PROJECT_ROOT)/ 
